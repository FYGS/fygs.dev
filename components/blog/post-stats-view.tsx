"use client";

import { useBlogStats } from "@/stores/use-blog-stats";
import { PostStatsViewProps } from "@/types/blog";
import { useEffect, useRef } from "react";
import { ArticleStats } from "./article-stats";
import { SocialInteractions } from "./social-interactions";

export function PostStatsView({
  slug,
  readingTime,
  className,
  initialStats,
}: PostStatsViewProps) {
  const { views, likes, shares, setViews, setLikes, setShares } =
    useBlogStats();
  const hasInitialized = useRef(false);

  // Initialize the store with SSR data once — avoid overwriting live updates
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      setViews(initialStats.views);
      setLikes(initialStats.likes);
      setShares(initialStats.shares);
    }
  }, [slug, initialStats, setViews, setLikes, setShares]);

  // Use Zustand store values (updated by ViewCounter & interactions)
  const displayViews = views || initialStats.views;
  const displayLikes = likes || initialStats.likes;
  const displayShares = shares || initialStats.shares;

  return (
    <div className={className}>
      <ArticleStats
        readingTime={readingTime}
        views={displayViews}
        likes={displayLikes}
        shares={displayShares}
      />
      <SocialInteractions
        slug={slug}
        initialLikes={displayLikes}
        shareCount={displayShares}
      />
    </div>
  );
}
