"use client";

import { useBlogStats } from "@/stores/use-blog-stats";
import { PostStatsViewProps } from "@/types/blog";
import { useEffect } from "react";
import { ArticleStats } from "./article-stats";
import { SocialInteractions } from "./social-interactions";

export function PostStatsView({
  slug,
  readingTime,
  className,
  initialStats,
}: PostStatsViewProps) {
  const { setViews, setLikes, setShares } = useBlogStats();

  // Initialize the store with SSR data once — no polling
  useEffect(() => {
    setViews(initialStats.views);
    setLikes(initialStats.likes);
    setShares(initialStats.shares);
  }, [slug, initialStats, setViews, setLikes, setShares]);

  return (
    <div className={className}>
      <ArticleStats
        readingTime={readingTime}
        views={initialStats.views}
        likes={initialStats.likes}
        shares={initialStats.shares}
      />
      <SocialInteractions
        slug={slug}
        initialLikes={initialStats.likes}
        shareCount={initialStats.shares}
      />
    </div>
  );
}
