"use server";

import { getLikeCount, getShareCount, getViewCount } from "@/lib/reading-stats";

export async function getPostStats(slug: string) {
  const [views, likes, shares] = await Promise.all([
    getViewCount(slug),
    getLikeCount(slug),
    getShareCount(slug),
  ]);

  return { views, likes, shares };
}
