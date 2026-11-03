"use server";

import { PostStats } from "@/types/blog";
import { isValidBlogSlug } from "@/lib/blog-slug";

const EMPTY_STATS: PostStats = { views: 0, likes: 0, shares: 0 };
const MAX_SLUGS = 60;

export async function getAllPostsStats(
  requested: string[],
): Promise<Record<string, PostStats>> {
  // The slugs of a server action come from the browser: a bounded list of plain blog slugs, nothing else becomes a key
  const slugs = (Array.isArray(requested) ? requested : []).filter(isValidBlogSlug).slice(0, MAX_SLUGS);
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return Object.fromEntries(
      slugs.map((s) => [s, { views: 0, likes: 0, shares: 0 }]),
    );
  }

  try {
    const { getAllStats } = await import("@/lib/reading-stats");
    return await getAllStats(slugs);
  } catch (error) {
    console.error("Error fetching all posts stats:", error);
    return Object.fromEntries(
      slugs.map((s) => [s, { views: 0, likes: 0, shares: 0 }]),
    );
  }
}

// Use a static fallback for build time and real data at runtime
export async function getPostStats(slug: string): Promise<PostStats> {
  if (!isValidBlogSlug(slug)) return { ...EMPTY_STATS };
  // During static generation (build time), return default values
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return { views: 0, likes: 0, shares: 0 };
  }

  // At runtime, dynamically import the reading-stats module
  try {
    const { getLikeCount, getShareCount, getViewCount } =
      await import("@/lib/reading-stats");

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
