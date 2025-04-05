import { type Pipeline } from "@upstash/redis";
import redis from "./redis";

export async function incrementViewCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:views`;
    return await redis.incr(key);
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return 0;
  }
}

export async function getViewCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:views`;
    const count = await redis.get<number>(key);
    return count ?? 0;
  } catch (error) {
    console.error("Error getting view count:", error);
    return 0;
  }
}

export async function getPopularPosts(limit = 5): Promise<string[]> {
  try {
    const keys = await redis.keys("blog:*:views");
    if (!keys.length) return [];

    const pipeline = redis.pipeline() as Pipeline;
    keys.forEach((key) => pipeline.get(key));

    const counts = await pipeline.exec();
    if (!counts) return [];

    return keys
      .map((key, index) => ({
        slug: key.split(":")[1],
        views: (counts[index] as number) ?? 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map((item) => item.slug);
  } catch (error) {
    console.error("Error getting popular posts:", error);
    return [];
  }
}

export async function getLikeCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:likes`;
    const count = await redis.get<number>(key);
    return count ?? 0;
  } catch (error) {
    console.error("Error getting like count:", error);
    return 0;
  }
}

export async function toggleLike(
  slug: string,
  userId: string
): Promise<boolean> {
  try {
    const key = `blog:${slug}:likes`;
    const userLikeKey = `blog:${slug}:likes:users`;

    // Using the proper Redis command names in uppercase
    const hasLiked = await redis.sismember(userLikeKey, userId);

    if (hasLiked) {
      await redis.srem(userLikeKey, userId);
      await redis.decr(key);
      return false;
    } else {
      await redis.sadd(userLikeKey, userId);
      await redis.incr(key);
      return true;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return false;
  }
}

export async function incrementShareCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:shares`;
    return await redis.incr(key);
  } catch (error) {
    console.error("Error incrementing share count:", error);
    return 0;
  }
}

export async function getShareCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:shares`;
    const count = await redis.get<number>(key);
    return count ?? 0;
  } catch (error) {
    console.error("Error getting share count:", error);
    return 0;
  }
}
