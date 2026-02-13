"use server";

import { getBlogPostsMeta } from "@/lib/mdx";
import { BlogPostMeta } from "@/lib/types";
import { PostStats } from "@/types/blog";
import { getPostStats } from "./stats";

// Fallback function that returns posts sorted by date (most recent first)
// This is used during build time when Redis is not available
async function getFallbackPopularPosts(
  limit = 5,
  excludeSlugs: string[] = [],
): Promise<{ posts: BlogPostMeta[]; stats: Record<string, PostStats> }> {
  const allPosts = await getBlogPostsMeta();

  const filteredPosts = allPosts
    .filter((post) => !excludeSlugs.includes(post.slug))
    .slice(0, limit);

  // Create default stats for each post
  const stats: Record<string, PostStats> = {};
  for (const post of filteredPosts) {
    stats[post.slug] = { views: 0, likes: 0, shares: 0 };
  }

  return { posts: filteredPosts, stats };
}

export async function getPopularBlogPosts(
  currentPostSlug: string,
  limit = 5,
  excludeSlugs: string[] = [],
): Promise<{ posts: BlogPostMeta[]; stats: Record<string, PostStats> }> {
  // During static generation (build time), return fallback data
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return getFallbackPopularPosts(limit, [...excludeSlugs, currentPostSlug]);
  }

  // At runtime, dynamically import the reading-stats module
  try {
    const { getPopularPosts } = await import("@/lib/reading-stats");
    const allPosts = await getBlogPostsMeta();

    // Get popular slugs from Redis
    const popularSlugs = await getPopularPosts(limit * 2);

    // Filter and get the popular posts
    const allExcludeSlugs = [...excludeSlugs, currentPostSlug];
    const popularPosts = allPosts
      .filter(
        (post) =>
          popularSlugs.includes(post.slug) &&
          !allExcludeSlugs.includes(post.slug),
      )
      .slice(0, limit);

    // Fetch stats for all posts in parallel
    const stats: Record<string, PostStats> = {};
    await Promise.all(
      popularPosts.map(async (post) => {
        stats[post.slug] = await getPostStats(post.slug);
      }),
    );

    return { posts: popularPosts, stats };
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    return getFallbackPopularPosts(limit, [...excludeSlugs, currentPostSlug]);
  }
}
