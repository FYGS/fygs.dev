"use server";

import { getLikeCount, getShareCount, getViewCount } from "@/lib/reading-stats";
import { PostStats } from "@/types/blog";

export async function getPostStats(slug: string): Promise<PostStats> {
  const [views, likes, shares] = await Promise.all([
    getViewCount(slug),
    getLikeCount(slug),
    getShareCount(slug),
  ]);

  return { views, likes, shares };
}
