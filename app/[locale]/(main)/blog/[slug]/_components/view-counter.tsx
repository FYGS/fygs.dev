"use client";

import { useBlogStats } from "@/stores/use-blog-stats";
import { useEffect } from "react";

// Module-level guards prevent duplicate API calls across React lifecycle events
// (StrictMode double-mounts, dev-mode re-renders, hydration cycles)
const mountedSlugs = new Set<string>();
const cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>();

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  useEffect(() => {
    // Cancel any pending cleanup timer (handles StrictMode remount)
    const pendingTimer = cleanupTimers.get(slug);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      cleanupTimers.delete(slug);
    }

    // If already counted for this slug in this navigation, skip
    if (mountedSlugs.has(slug)) return;
    mountedSlugs.add(slug);

    fetch(`/api/blog/views/${slug}`, {
      method: "POST",
      cache: "no-store",
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((data) => {
        if (data?.count) {
          useBlogStats.getState().setViews(data.count);
        }
      })
      .catch((error) => {
        console.error("Failed to increment view count:", error);
      });

    return () => {
      // Delayed cleanup: StrictMode remount cancels this timer,
      // preventing duplicate increments. Genuine unmounts (navigation away)
      // let the timer fire, allowing future visits to count again.
      const timer = setTimeout(() => {
        mountedSlugs.delete(slug);
        cleanupTimers.delete(slug);
      }, 2000);
      cleanupTimers.set(slug, timer);
    };
  }, [slug]);

  return null;
}
