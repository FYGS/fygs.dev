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
  const { setViews, setLikes, setShares, syncStats } = useBlogStats();

  // Initialize the store with the initial stats
  useEffect(() => {
    setViews(initialStats.views);
    setLikes(initialStats.likes);
    setShares(initialStats.shares);

    // Sync with the server immediately
    syncStats(slug);

    // Set up an interval to periodically sync stats
    const intervalId = setInterval(() => {
      syncStats(slug);
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(intervalId);
  }, [slug, initialStats, setViews, setLikes, setShares, syncStats]);

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
