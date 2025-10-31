"use server";

import { PostStats } from "@/types/blog";

// Use a static fallback for build time and real data at runtime
export async function getPostStats(slug: string): Promise<PostStats> {
  // During static generation (build time), return default values
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return { views: 0, likes: 0, shares: 0 };
  }

  // At runtime, dynamically import the reading-stats module
  try {
    const { getLikeCount, getShareCount, getViewCount } = await import(
      "@/lib/reading-stats"
    );

    const [views, likes, shares] = await Promise.all([
      getViewCount(slug),
      getLikeCount(slug),
      getShareCount(slug),
    ]);

    return { views, likes, shares };
  } catch (error) {
    console.error("Error fetching post stats:", error);
    return { views: 0, likes: 0, shares: 0 };
  }
}
