import { getBlogPostsMeta } from "@/lib/mdx";
import {
  getLikeCount,
  getPopularPosts,
  getShareCount,
  getViewCount,
} from "@/lib/reading-stats";
import { TrendingUp } from "lucide-react";
import { BlogPostCard } from "@/components/blog/blog-post-card";

interface PopularArticlesProps {
  currentSlug: string;
  maxArticles?: number;
  excludeSlugs?: string[];
}

export async function PopularArticles({
  currentSlug,
  maxArticles = 3,
  excludeSlugs = [],
}: PopularArticlesProps) {
  const popularSlugs = await getPopularPosts(maxArticles * 2);
  const allPosts = await getBlogPostsMeta();

  const popularPosts = allPosts
    .filter((post) => popularSlugs.includes(post.slug))
    .filter(
      (post) => post.slug !== currentSlug && !excludeSlugs.includes(post.slug),
    )
    .slice(0, maxArticles);

  if (popularPosts.length === 0) return null;

  // Fetch stats for all posts in parallel
  const stats = await Promise.all(
    popularPosts.map(async (post) => ({
      slug: post.slug,
      views: await getViewCount(post.slug),
      likes: await getLikeCount(post.slug),
      shares: await getShareCount(post.slug),
    })),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        Popular Articles
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {popularPosts.map((post) => {
          const postStats = stats.find((s) => s.slug === post.slug);
          return (
            <BlogPostCard
              key={post.slug}
              post={post}
              initialStats={
                postStats && {
                  views: postStats.views,
                  likes: postStats.likes,
                  shares: postStats.shares,
                }
              }
            />
          );
        })}
      </div>
    </section>
  );
}
