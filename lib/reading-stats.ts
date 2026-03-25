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
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Error getting view count:", error);
    return 0;
  }
}

export async function getPopularPosts(limit = 5): Promise<string[]> {
  try {
    const keys = await redis.keys("blog:*:views");
    if (!keys.length) return [];

    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.get(key));

    const results = await pipeline.exec();
    if (!results) return [];

    return keys
      .map((key, index) => ({
        slug: key.split(":")[1],
        views: parseInt(String(results[index]?.[1] || 0), 10),
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
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Error getting like count:", error);
    return 0;
  }
}

export async function toggleLike(
  slug: string,
  userId: string,
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

export async function getAllStats(
  slugs: string[],
): Promise<Record<string, { views: number; likes: number; shares: number }>> {
  if (slugs.length === 0) return {};

  try {
    const pipeline = redis.pipeline();
    for (const slug of slugs) {
      pipeline.get(`blog:${slug}:views`);
      pipeline.get(`blog:${slug}:likes`);
      pipeline.get(`blog:${slug}:shares`);
    }

    const results = await pipeline.exec();
    if (!results) {
      return Object.fromEntries(
        slugs.map((s) => [s, { views: 0, likes: 0, shares: 0 }]),
      );
    }

    const statsMap: Record<
      string,
      { views: number; likes: number; shares: number }
    > = {};
    for (let i = 0; i < slugs.length; i++) {
      const base = i * 3;
      statsMap[slugs[i]] = {
        views: parseInt(String(results[base]?.[1] || 0), 10),
        likes: parseInt(String(results[base + 1]?.[1] || 0), 10),
        shares: parseInt(String(results[base + 2]?.[1] || 0), 10),
      };
    }
    return statsMap;
  } catch (error) {
    console.error("Error fetching all stats:", error);
    return Object.fromEntries(
      slugs.map((s) => [s, { views: 0, likes: 0, shares: 0 }]),
    );
  }
}

export async function getShareCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:shares`;
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Error getting share count:", error);
    return 0;
  }
}
