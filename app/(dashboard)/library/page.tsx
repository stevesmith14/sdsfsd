"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  LayoutGrid,
  List,
  Inbox,
  Play,
  Camera,
  Link as LinkIcon,
  FileText,
  Code,
  Layers,
  Star,
  Clock,
  ChevronDown,
} from "lucide-react";
import ContentCard from "@/components/ContentCard";
import ScrollReveal from "@/components/ScrollReveal";
import CategoryBrowser, {
  type EnrichedCategory,
} from "@/components/CategoryBrowser";
import { useCategoryPreferences } from "@/lib/hooks/useCategoryPreferences";
import { getCategoryIcon } from "@/lib/utils/categoryIcons";
import { useLenis } from "@/contexts/LenisContext";

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */
const TYPE_TABS = [
  { key: "all", label: "All", icon: Layers },
  { key: "youtube", label: "YouTube", icon: Play },
  { key: "instagram", label: "Instagram", icon: Camera },
  { key: "link", label: "Links", icon: LinkIcon },
  { key: "note", label: "Notes", icon: FileText },
  { key: "snippet", label: "Snippets", icon: Code },
];

const TOP_CATEGORIES_COUNT = 6; // Max visible in the quick bar

/* ═══════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════ */
export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [enrichedCategories, setEnrichedCategories] = useState<EnrichedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("list");
  const [browserOpen, setBrowserOpen] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const { resize: lenisResize } = useLenis();

  const {
    favorites,
    recents,
    toggleFavorite,
    isFavorite,
    addRecent,
  } = useCategoryPreferences();

  /* ── Fetch enriched categories ── */
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setEnrichedCategories(data.categories);
      } else if (data.success && Array.isArray(data.data)) {
        // Fallback for old API shape
        setEnrichedCategories(
          data.data.map((name: string) => ({ name, count: 0 }))
        );
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ── Fetch library items ── */
  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      // When searching, ignore the type filter to search across all types
      if (search) {
        query.append("search", search);
      } else if (typeFilter !== "all") {
        query.append("type", typeFilter);
      }
      if (category !== "all") query.append("category", category);

      const res = await fetch(`/api/content?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
      }
    } catch (err) {
      console.error("Library fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchLibrary, 350);
    return () => clearTimeout(timer);
  }, [search, category, typeFilter]);

  // After content loads, tell Lenis to recalculate the scrollable height
  useEffect(() => {
    if (!loading) {
      lenisResize();
    }
  }, [loading, lenisResize]);

  // Keyboard shortcut: '/' focuses search, 'k' opens category browser
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K should ALWAYS open the category browser and prevent default
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBrowserOpen((prev) => !prev);
        return;
      }

      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  /* ── Category selection handler ── */
  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    addRecent(cat);
  };

  /* ── Build top bar categories ── */
  const topBarItems = useMemo(() => {
    // Get the top N most-used categories
    const sorted = [...enrichedCategories].sort((a, b) => b.count - a.count);
    const topCats = sorted.slice(0, TOP_CATEGORIES_COUNT);

    // If the active category isn't in the top categories, pin it
    if (
      category !== "all" &&
      !topCats.some((c) => c.name === category)
    ) {
      const activeCat = enrichedCategories.find((c) => c.name === category);
      if (activeCat) {
        // Replace the last top category with the active one
        if (topCats.length >= TOP_CATEGORIES_COUNT) {
          topCats[topCats.length - 1] = activeCat;
        } else {
          topCats.push(activeCat);
        }
      }
    }

    return topCats;
  }, [enrichedCategories, category]);

  const remainingCount = Math.max(0, enrichedCategories.length - TOP_CATEGORIES_COUNT);

  // Check if favorites exist
  const hasFavorites = favorites.length > 0;
  const hasRecents = recents.length > 0;

  /* ── Dynamic Category Overflow Observer ── */
  useEffect(() => {
    if (!categoryBarRef.current) return;
    
    // We use a ResizeObserver to detect when the container width changes
    // which causes the flex-wrap to push items to the second row (offsetTop > 20px).
    const observer = new ResizeObserver(() => {
      const container = categoryBarRef.current;
      if (!container) return;
      
      const innerWrap = container.children[0];
      if (!innerWrap) return;

      let hidden = 0;
      const chips = innerWrap.children;
      for (let i = 0; i < chips.length; i++) {
        const chip = chips[i] as HTMLElement;
        // If the chip's top offset is greater than ~10px, it has wrapped to the next line.
        if (chip.offsetTop > 10) {
          hidden++;
        }
      }
      setHiddenCount(hidden);
    });

    observer.observe(categoryBarRef.current);
    
    return () => observer.disconnect();
  }, [topBarItems, hasRecents, hasFavorites]);

  /* ── Group items by category/subcategory ── */
  const groupedItems = items.reduce(
    (acc: Record<string, Record<string, any[]>>, item: any) => {
      const catName = item.category || "Uncategorized";
      const subCatName = item.subcategory || "General";

      if (!acc[catName]) acc[catName] = {};
      if (!acc[catName][subCatName]) acc[catName][subCatName] = [];

      acc[catName][subCatName].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto page-transition select-none space-y-6 sm:space-y-8">
      {/* Header and Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary leading-tight mt-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Library
          </h1>
          <p className="text-text-secondary text-[13px] font-medium mt-1 leading-normal max-w-lg">
            Browse, search, and manage your saved content.
          </p>
        </div>

        {/* Segmented View Switcher */}
        <div className="flex p-1 rounded-lg bg-bg-surface border border-border w-fit select-none">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              view === "grid"
                ? "bg-bg-elevated text-text-primary border border-border shadow-sm"
                : "text-text-muted hover:text-text-secondary border border-transparent"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              view === "list"
                ? "bg-bg-elevated text-text-primary border border-border shadow-sm"
                : "text-text-muted hover:text-text-secondary border border-transparent"
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </section>

      {/* ═══ TYPE TABS ═══ */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TYPE_TABS.map((tab) => {
          const isActive = typeFilter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Category Filters Bar */}
      <div className="bg-bg-root rounded-2xl flex flex-col gap-3 sm:gap-4 py-2">
        {/* Search */}
        <div className="relative flex items-center flex-1 w-full group">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search your knowledge base..."
            className="w-full bg-bg-surface border border-transparent hover:border-border focus:border-primary/30 focus:bg-bg-root transition-all duration-300 rounded-xl pl-5 pr-12 h-14 text-[15px] font-medium text-text-primary placeholder:text-text-muted outline-none shadow-sm focus:shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-6 h-6 bg-bg-elevated border border-border rounded-md text-[11px] font-bold text-text-muted uppercase shadow-sm select-none">
            /
          </div>
        </div>

        {/* ═══ SMART CATEGORY BAR ═══ */}
        <div className="flex items-center gap-2 w-full relative">
          
          <div ref={categoryBarRef} className="flex-1 h-14 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Filter icon */}
              <div className="w-14 h-14 rounded-xl bg-bg-surface border border-transparent flex items-center justify-center shrink-0">
                <Filter className="w-5 h-5 text-text-muted" />
              </div>

              {/* ALL chip (always first) */}
              <button
                onClick={() => handleCategorySelect("all")}
                className={`px-6 h-14 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer flex items-center ${
                  category === "all"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                ALL
              </button>

              {/* Recent chip (if recents exist) */}
              {hasRecents && (
                <button
                  onClick={() => setBrowserOpen(true)}
                  className="category-quick-chip shrink-0"
                  title="View recent categories"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Recent
                </button>
              )}

              {/* Favorites chip (if favorites exist) */}
              {hasFavorites && (
                <button
                  onClick={() => setBrowserOpen(true)}
                  className="category-quick-chip shrink-0"
                  title="View favorite categories"
                >
                  <Star className="w-3.5 h-3.5" />
                  Favorites
                </button>
              )}

              {/* Top N most-used categories */}
              {topBarItems.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-6 h-14 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer flex items-center gap-2 ${
                    category === cat.name
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  }`}
                >
                  <span className="text-[14px] leading-none">{getCategoryIcon(cat.name)}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* +XX More button */}
          {(remainingCount + hiddenCount) > 0 && (
            <div className="shrink-0 flex items-center pb-2 md:pb-0 pl-1">
              <button
                onClick={() => setBrowserOpen(true)}
                className="category-more-chip"
                aria-label={`Browse all ${enrichedCategories.length} categories`}
              >
                +{remainingCount + hiddenCount}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Browser Overlay */}
      <CategoryBrowser
        isOpen={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onSelect={handleCategorySelect}
        activeCategory={category}
        categories={enrichedCategories}
        favorites={favorites}
        recents={recents}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />

      {/* Content Area */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[220px] w-full skeleton-shimmer border border-border rounded-xl"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-12">
            <AnimatePresence>
              {Object.entries(groupedItems).map(
                ([catName, subcategories]) => (
                  <motion.div
                    key={catName}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Category Typographic Divider */}
                    <div className="flex items-center gap-4">
                      <h2
                        className="text-[16px] font-bold text-text-primary uppercase tracking-wider shrink-0"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {catName}
                      </h2>
                      <div className="flex-1 h-[1px] bg-border"></div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest shrink-0">
                        {Object.values(subcategories).flat().length} items
                      </span>
                    </div>

                    {/* Subcategories List */}
                    <div className="space-y-8">
                      {Object.entries(subcategories).map(
                        ([subCatName, subItems]) => (
                          <div
                            key={`${catName}-${subCatName}`}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-3.5 bg-primary/80 rounded-full" />
                              <h3 className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
                                {subCatName}
                              </h3>
                            </div>

                            <div
                              className={`grid gap-6 ${
                                view === "grid"
                                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                  : "grid-cols-1"
                              }`}
                            >
                              {subItems.map((item: any) => (
                                <motion.div
                                  key={item._id}
                                  layout
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.98 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ContentCard item={item} layout={view} />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty Library State */
          <div className="flex flex-col items-center justify-center py-20 bg-bg-surface border border-dashed border-border rounded-xl space-y-4 select-none shadow-sm">
            <div className="w-16 h-16 bg-bg-root rounded-xl flex items-center justify-center border border-border">
              <Inbox className="w-6 h-6 text-text-muted opacity-60" />
            </div>
            <div className="space-y-1.5 text-center">
              <h3
                className="text-[16px] font-bold text-text-primary tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No items found
              </h3>
              <p className="text-[12px] text-text-muted font-medium max-w-xs leading-normal px-6">
                We couldn&apos;t find anything matching your search. Try
                adjusting your filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setTypeFilter("all");
              }}
              className="btn-ghost mt-2"
            >
               Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
