// Internal helper (not a "use server" file).
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

/** Writes (posts, replies, votes, follows...) are limited per signed-in user. */
export async function isCommunityWriteLimited(userId: string): Promise<boolean> {
  const result = await checkRateLimit(await headers(), "community-write", {
    subject: `user:${userId}`,
    limit: 30,
    windowSeconds: 60,
  });
  return !result.allowed;
}

/**
 * Why this user may not write in the community right now, or null when they may: a ban set by a moderator
 * (User.isBanned) or the write limit above. The messages are what the actions return.
 */
export async function communityWriteBlock(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { isBanned: true } });
  if (user?.isBanned) return "Your account is suspended from the community";
  if (await isCommunityWriteLimited(userId)) return "Too many requests";
  return null;
}
