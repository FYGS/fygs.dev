"use client";

import { useBlogStats } from "@/stores/use-blog-stats";
import { useEffect, useRef } from "react";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const { setViews } = useBlogStats();
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Prevent double-increment in StrictMode / re-renders
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    const incrementViewCount = async () => {
      try {
        const response = await fetch(`/api/blog/views/${slug}`, {
          method: "POST",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          // Use actual server count to keep UI in sync
          if (data.count) {
            setViews(data.count);
          }
        }
      } catch (error) {
        console.error("Failed to increment view count:", error);
      }
    };

    incrementViewCount();
  }, [slug, setViews]);

  return null;
}
