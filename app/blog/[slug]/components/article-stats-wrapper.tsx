"use client";

import { ArticleStats } from "@/app/blog/components/article-stats";
import { SocialInteractions } from "@/app/blog/components/social-interactions";
import { cn } from "@/lib/utils";
import { useBlogStats } from "@/stores/use-blog-stats";
import { useEffect } from "react";

interface ArticleStatsWrapperProps {
  slug: string;
  readingTime: string;
  className?: string;
  initialStats: {
    views: number;
    likes: number;
    shares: number;
  };
}

export function ArticleStatsWrapper({
  slug,
  readingTime,
  className,
  initialStats,
}: ArticleStatsWrapperProps) {
  const { likes, shares, setLikes, setShares, syncStats } = useBlogStats();

  // Initialize store with initial values
  useEffect(() => {
    setLikes(initialStats.likes);
    setShares(initialStats.shares);
  }, [initialStats.likes, initialStats.shares, setLikes, setShares]);

  // Sync stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      syncStats(slug).catch(console.error);
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(interval);
  }, [slug, syncStats]);

  return (
    <div className={cn("space-y-6", className)}>
      <ArticleStats
        readingTime={readingTime}
        views={initialStats.views}
        likes={likes}
        shares={shares}
      />
      <SocialInteractions
        slug={slug}
        initialLikes={likes}
        shareCount={shares}
      />
    </div>
  );
}
