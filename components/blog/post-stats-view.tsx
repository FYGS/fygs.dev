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
  const { views, likes, shares, initForSlug } = useBlogStats();

  // Initialize (or reset) the store when slug changes
  useEffect(() => {
    initForSlug(slug, initialStats);
  }, [slug, initialStats, initForSlug]);

  // Use Zustand store values, fall back to SSR initial props until store is initialized for this slug
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
      <SocialInteractions slug={slug} />
    </div>
  );
}
