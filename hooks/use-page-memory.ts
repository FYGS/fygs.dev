"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PageMemory {
  path: string;
  scroll: number;
  timestamp: number;
}

const PAGE_MEMORY_KEY = "page-memory";
const MEMORY_DURATION = 30 * 60 * 1000; // 30 minutes

export function usePageMemory() {
  const [lastVisitedPages, setLastVisitedPages] = useState<PageMemory[]>([]);
  const isInitialized = useRef(false);

  // Charger les pages mémorisées une seule fois au montage
  useEffect(() => {
    if (isInitialized.current) return;

    const stored = localStorage.getItem(PAGE_MEMORY_KEY);
    if (stored) {
      try {
        const pages: PageMemory[] = JSON.parse(stored);
        const now = Date.now();
        const validPages = pages.filter(
          (page) => now - page.timestamp < MEMORY_DURATION
        );
        setLastVisitedPages(validPages);
      } catch (error) {
        console.error("Error loading page memory:", error);
      }
    }
    isInitialized.current = true;
  }, []);

  // Sauvegarder la page actuelle de manière optimisée
  const savePage = useCallback((path: string) => {
    const now = Date.now();
    const scroll = window.scrollY;

    setLastVisitedPages((prev) => {
      const existing = prev.find((p) => p.path === path);
      if (existing && existing.scroll === scroll) {
        return prev; // Éviter les mises à jour inutiles
      }

      const updated = [
        { path, scroll, timestamp: now },
        ...prev.filter((p) => p.path !== path).slice(0, 8),
      ];

      try {
        localStorage.setItem(PAGE_MEMORY_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving page memory:", error);
      }

      return updated;
    });
  }, []);

  // Récupérer la position de défilement de manière optimisée
  const getPageScroll = useCallback(
    (path: string) => {
      return lastVisitedPages.find((p) => p.path === path)?.scroll || 0;
    },
    [lastVisitedPages]
  );

  // Récupérer la dernière page visitée de manière optimisée
  const getLastVisitedPage = useCallback(() => {
    return lastVisitedPages[0]?.path;
  }, [lastVisitedPages]);

  return {
    savePage,
    getPageScroll,
    getLastVisitedPage,
    lastVisitedPages,
  };
}
