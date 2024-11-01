"use client";

import { BlogPost } from "@/lib/mdx";
import { useCallback, useRef } from "react";

interface SearchCache {
  [key: string]: {
    results: BlogPost[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSearchCache() {
  const cacheRef = useRef<SearchCache>({});

  const getCachedResults = useCallback((term: string, posts: BlogPost[]) => {
    const cached = cacheRef.current[term];
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.results;
    }

    const results = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(term.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(term.toLowerCase()) ||
        post.categories.some((category) =>
          category.toLowerCase().includes(term.toLowerCase())
        )
    );

    cacheRef.current[term] = {
      results,
      timestamp: now,
    };

    return results;
  }, []);

  return { getCachedResults };
}
