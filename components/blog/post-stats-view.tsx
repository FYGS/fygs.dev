"use client";

import { PostStatsViewProps } from "@/types/blog";
import { ArticleStats } from "./article-stats";
import { SocialInteractions } from "./social-interactions";

export function PostStatsView({
  slug,
  readingTime,
  className,
  initialStats,
}: PostStatsViewProps) {
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
