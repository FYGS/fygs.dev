"use server";

import {
  incrementShareCount,
  toggleLike,
  incrementViewCount,
} from "@/lib/reading-stats";

export async function handleLike(slug: string, userId: string) {
  return toggleLike(slug, userId);
}

export async function handleShare(slug: string) {
  return incrementShareCount(slug);
}

export async function handleView(slug: string) {
  return incrementViewCount(slug);
}
