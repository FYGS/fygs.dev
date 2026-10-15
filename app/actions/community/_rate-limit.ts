// Internal helper (not a "use server" file).
import { headers } from "next/headers";
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
