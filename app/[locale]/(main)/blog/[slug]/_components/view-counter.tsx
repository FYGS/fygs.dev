"use client";

import { useBlogStats } from "@/stores/use-blog-stats";
import { useEffect } from "react";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const { incrementViews } = useBlogStats();

  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        const response = await fetch(`/api/blog/views/${slug}`, {
          method: "POST",
          cache: "no-store",
        });

        if (response.ok) {
          incrementViews();
        }
      } catch (error) {
        console.error("Failed to increment view count:", error);
      }
    };

    incrementViewCount();
  }, [slug, incrementViews]);

  return null;
}
