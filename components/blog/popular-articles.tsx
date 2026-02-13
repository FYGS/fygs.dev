import { TrendingUp } from "lucide-react";
import { BlogPostCard } from "./blog-post-card";
import { getPopularBlogPosts } from "@/app/[locale]/(main)/blog/actions/popular-posts";

const POPULAR_TITLE = {
  en: "Popular Articles",
  fr: "Articles populaires",
  es: "Artículos populares",
} as const;

interface PopularArticlesProps {
  currentSlug: string;
  maxArticles?: number;
  excludeSlugs?: string[];
  locale?: string;
}

export async function PopularArticles({
  currentSlug,
  maxArticles = 3,
  excludeSlugs = [],
  locale = "fr",
}: PopularArticlesProps) {
  // Get popular posts using our server action with fallback
  const { posts: popularPosts, stats: postsStats } = await getPopularBlogPosts(
    currentSlug,
    maxArticles,
    excludeSlugs,
  );

  if (popularPosts.length === 0) return null;

  const title =
    POPULAR_TITLE[locale as keyof typeof POPULAR_TITLE] ?? POPULAR_TITLE.en;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        {title}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {popularPosts.map((post) => {
          const postStats = postsStats[post.slug];
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
