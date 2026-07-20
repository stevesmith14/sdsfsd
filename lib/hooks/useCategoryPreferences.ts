"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY_FAVORITES = "recallify_category_favorites";
const STORAGE_KEY_RECENTS = "recallify_category_recents";
const MAX_RECENTS = 10;

interface CategoryPreferences {
  favorites: string[];
  recents: string[];
  toggleFavorite: (category: string) => void;
  isFavorite: (category: string) => boolean;
  addRecent: (category: string) => void;
  clearRecents: () => void;
}

function loadFromStorage(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(key: string, data: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useCategoryPreferences(): CategoryPreferences {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(loadFromStorage(STORAGE_KEY_FAVORITES));
    setRecents(loadFromStorage(STORAGE_KEY_RECENTS));
  }, []);

  const toggleFavorite = useCallback((category: string) => {
    setFavorites((prev) => {
      const next = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      saveToStorage(STORAGE_KEY_FAVORITES, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (category: string) => favorites.includes(category),
    [favorites]
  );

  const addRecent = useCallback((category: string) => {
    if (category === "all") return; // Don't track "all"
    setRecents((prev) => {
      const filtered = prev.filter((c) => c !== category);
      const next = [category, ...filtered].slice(0, MAX_RECENTS);
      saveToStorage(STORAGE_KEY_RECENTS, next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    saveToStorage(STORAGE_KEY_RECENTS, []);
  }, []);

  return { favorites, recents, toggleFavorite, isFavorite, addRecent, clearRecents };
}
