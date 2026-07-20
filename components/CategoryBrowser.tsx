"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  Clock,
  FolderOpen,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/categoryIcons";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */
export interface EnrichedCategory {
  name: string;
  count: number;
  lastUsed?: string;
}

interface CategoryBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  activeCategory: string;
  categories: EnrichedCategory[];
  favorites: string[];
  recents: string[];
  onToggleFavorite: (category: string) => void;
  isFavorite: (category: string) => boolean;
}

/* ═══════════════════════════════════════════════════════
   Overlay Animations
   ═══════════════════════════════════════════════════════ */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -10,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
};

/* Mobile bottom sheet variant */
const sheetVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */
export default function CategoryBrowser({
  isOpen,
  onClose,
  onSelect,
  activeCategory,
  categories,
  favorites,
  recents,
  onToggleFavorite,
  isFavorite,
}: CategoryBrowserProps) {
  const [search, setSearch] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setFocusIndex(0);
      // Auto-focus the search input
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── Build flat items list (sectioned) ── */
  const sections = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filterMatch = (name: string) =>
      !query || name.toLowerCase().includes(query);

    const result: Array<{
      type: "header" | "item";
      label: string;
      category?: EnrichedCategory;
    }> = [];

    // Favorites section
    const favCats = categories.filter(
      (c) => isFavorite(c.name) && filterMatch(c.name)
    );
    if (favCats.length > 0) {
      result.push({ type: "header", label: "⭐  Favorites" });
      favCats.forEach((c) => result.push({ type: "item", label: c.name, category: c }));
    }

    // Recent section
    const recentCats = recents
      .map((name) => categories.find((c) => c.name === name))
      .filter(
        (c): c is EnrichedCategory =>
          c !== undefined && !isFavorite(c.name) && filterMatch(c.name)
      );
    if (recentCats.length > 0) {
      result.push({ type: "header", label: "🕒  Recently Used" });
      recentCats.forEach((c) =>
        result.push({ type: "item", label: c.name, category: c })
      );
    }

    // All categories section (alphabetical)
    const allCats = categories
      .filter((c) => filterMatch(c.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (allCats.length > 0) {
      result.push({ type: "header", label: "📂  All Categories" });
      allCats.forEach((c) =>
        result.push({ type: "item", label: c.name, category: c })
      );
    }

    return result;
  }, [categories, favorites, recents, search, isFavorite]);

  // Get only the selectable items (skip headers)
  const selectableItems = useMemo(
    () => sections.filter((s) => s.type === "item"),
    [sections]
  );

  // Clamp focus index
  useEffect(() => {
    if (focusIndex >= selectableItems.length) {
      setFocusIndex(Math.max(0, selectableItems.length - 1));
    }
  }, [selectableItems.length, focusIndex]);

  // Scroll focused item into view
  useEffect(() => {
    const el = itemRefs.current.get(focusIndex);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusIndex]);

  /* ── Keyboard Handler ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((prev) =>
            Math.min(prev + 1, selectableItems.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (selectableItems[focusIndex]) {
            onSelect(selectableItems[focusIndex].label);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Tab":
          e.preventDefault();
          // Tab cycles forward, Shift+Tab backward
          if (e.shiftKey) {
            setFocusIndex((prev) => Math.max(prev - 1, 0));
          } else {
            setFocusIndex((prev) =>
              Math.min(prev + 1, selectableItems.length - 1)
            );
          }
          break;
      }
    },
    [selectableItems, focusIndex, onSelect, onClose]
  );

  // Global escape handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* ── Track selectable item index for refs ── */
  let selectableIdx = -1;

  const noResults = search.trim().length > 0 && selectableItems.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="category-browser-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="category-browser-overlay"
          onClick={onClose}
        >
          {/* Desktop: centered panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="category-browser-panel hidden md:flex"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Header */}
            <div className="category-browser-search-wrap">
              <Search className="w-5 h-5 text-text-muted shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories..."
                className="category-browser-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFocusIndex(0);
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    searchRef.current?.focus();
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden md:flex items-center gap-1.5 ml-2 shrink-0">
                <kbd className="category-browser-kbd">ESC</kbd>
              </div>
            </div>

            {/* Category List */}
            <div ref={listRef} className="category-browser-list custom-scrollbar" data-lenis-prevent>
              {noResults ? (
                <div className="flex flex-col items-center justify-center py-16 select-none">
                  <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-text-muted opacity-50" />
                  </div>
                  <p className="text-[14px] font-semibold text-text-primary mb-1">
                    No categories found
                  </p>
                  <p className="text-[12px] text-text-muted">
                    Try a different search term
                  </p>
                </div>
              ) : (
                sections.map((section, i) => {
                  if (section.type === "header") {
                    return (
                      <div key={`h-${i}`} className="category-browser-section-header">
                        {section.label}
                      </div>
                    );
                  }

                  selectableIdx++;
                  const idx = selectableIdx;
                  const cat = section.category!;
                  const isActive = activeCategory === cat.name;
                  const isFocused = idx === focusIndex;
                  const isFav = isFavorite(cat.name);
                  const icon = getCategoryIcon(cat.name);

                  return (
                    <button
                      key={`${cat.name}-${i}`}
                      ref={(el) => {
                        if (el) itemRefs.current.set(idx, el);
                        else itemRefs.current.delete(idx);
                      }}
                      onClick={() => {
                        onSelect(cat.name);
                        onClose();
                      }}
                      className={`category-browser-item group ${
                        isFocused ? "category-browser-item-focused" : ""
                      } ${isActive ? "category-browser-item-active" : ""}`}
                      onMouseEnter={() => setFocusIndex(idx)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[18px] shrink-0 leading-none" role="img">
                          {icon}
                        </span>
                        <span className="text-[14px] font-semibold text-text-primary truncate">
                          {cat.name}
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                          {cat.count} {cat.count === 1 ? "item" : "items"}
                        </span>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleFavorite(cat.name);
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            isFav
                              ? "text-amber-500 bg-amber-500/10"
                              : `text-text-muted/30 hover:text-amber-400 hover:bg-amber-500/5 ${isFocused ? "opacity-100" : "opacity-0"} group-hover:opacity-100`
                          }`}
                          style={{ opacity: isFav ? 1 : undefined }}
                          title={isFav ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={isFav ? "currentColor" : "none"}
                          />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted/40" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="category-browser-footer">
              <div className="flex items-center gap-4 text-[11px] text-text-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <kbd className="category-browser-kbd-sm">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="category-browser-kbd-sm">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="category-browser-kbd-sm">ESC</kbd> Close
                </span>
              </div>
              <span className="text-[11px] text-text-muted font-bold">
                {categories.length} categories
              </span>
            </div>
          </motion.div>

          {/* Mobile: bottom sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="category-browser-sheet md:hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-border-strong" />
            </div>

            {/* Search */}
            <div className="category-browser-search-wrap mx-4 mb-3">
              <Search className="w-5 h-5 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search categories..."
                className="category-browser-search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFocusIndex(0);
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="category-browser-list custom-scrollbar flex-1 px-2" data-lenis-prevent>
              {(() => {
                // Reset for mobile rendering
                let mobileSelectableIdx = -1;

                return noResults ? (
                  <div className="flex flex-col items-center justify-center py-16 select-none">
                    <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
                      <Inbox className="w-6 h-6 text-text-muted opacity-50" />
                    </div>
                    <p className="text-[14px] font-semibold text-text-primary mb-1">
                      No categories found
                    </p>
                    <p className="text-[12px] text-text-muted">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  sections.map((section, i) => {
                    if (section.type === "header") {
                      return (
                        <div key={`mh-${i}`} className="category-browser-section-header">
                          {section.label}
                        </div>
                      );
                    }

                    mobileSelectableIdx++;
                    const idx = mobileSelectableIdx;
                    const cat = section.category!;
                    const isActive = activeCategory === cat.name;
                    const isFav = isFavorite(cat.name);
                    const icon = getCategoryIcon(cat.name);

                    return (
                      <button
                        key={`m-${cat.name}-${i}`}
                        onClick={() => {
                          onSelect(cat.name);
                          onClose();
                        }}
                        className={`category-browser-item ${
                          isActive ? "category-browser-item-active" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-[20px] shrink-0 leading-none" role="img">
                            {icon}
                          </span>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[15px] font-semibold text-text-primary truncate max-w-full">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-text-muted font-medium">
                              {cat.count} {cat.count === 1 ? "item" : "items"}
                            </span>
                          </div>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleFavorite(cat.name);
                          }}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isFav
                              ? "text-amber-500 bg-amber-500/10"
                              : "text-text-muted/30"
                          }`}
                          title={isFav ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={isFav ? "currentColor" : "none"}
                          />
                        </div>
                      </button>
                    );
                  })
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
