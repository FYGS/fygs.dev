import { getPopularBlogPosts } from "@/app/blog/actions/popular-posts";
import { BlogPost } from "@/lib/types";
import { TrendingUp } from "lucide-react";
import { BlogPostCard } from "./blog-post-card";

interface PopularArticlesProps {
  currentPost: BlogPost;
  maxArticles?: number;
  excludeSlugs?: string[]; // Add this prop
}

export async function PopularArticles({
  currentPost,
  maxArticles = 3,
  excludeSlugs = [],
}: PopularArticlesProps) {
  // Get popular posts using our server action with fallback
  const { posts: popularPosts, stats: postsStats } = await getPopularBlogPosts(
    currentPost.slug,
    maxArticles,
    excludeSlugs
  );

  if (popularPosts.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        Popular Articles
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
