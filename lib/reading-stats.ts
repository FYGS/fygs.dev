import { kv } from "@vercel/kv";

export async function incrementViewCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:views`;
    const newCount = await kv.incr(key);
    return newCount;
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return 0;
  }
}

export async function getViewCount(slug: string): Promise<number> {
  try {
    const key = `blog:${slug}:views`;
    const count = await kv.get<number>(key);
    return count || 0;
  } catch (error) {
    console.error("Error getting view count:", error);
    return 0;
  }
}

export async function getPopularPosts(limit = 5): Promise<string[]> {
  try {
    const keys = await kv.keys("blog:*:views");
    const counts = await Promise.all(
      keys.map(async (key) => ({
        slug: key.split(":")[1],
        views: await kv.get<number>(key),
      }))
    );

    return counts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit)
      .map((item) => item.slug);
  } catch (error) {
    console.error("Error getting popular posts:", error);
    return [];
  }
}
