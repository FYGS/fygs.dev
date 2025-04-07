"use client";

import { useEffect } from "react";
import { SocialInteractions } from "../../components/social-interactions";
import { useStats } from "../../providers/stats-provider";

interface BlogFooterProps {
  slug: string;
}

export function BlogFooter({ slug }: BlogFooterProps) {
  const { getStats, stats } = useStats();

  useEffect(() => {
    if (!stats[slug]) {
      getStats(slug).catch(console.error);
    }
  }, [slug, getStats, stats]);

  const postStats = stats[slug];

  if (!postStats) return null;

  return (
    <SocialInteractions
      slug={slug}
      initialLikes={postStats.likes}
      shareCount={postStats.shares}
      variant="large"
    />
  );
}
