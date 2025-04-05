import { getAllBlogPosts } from "@/lib/mdx";
import { getPopularPosts } from "@/lib/reading-stats";
import { BlogPost } from "@/lib/types";
import { BlogPostCard } from "./blog-post-card";
import { TrendingUp } from "lucide-react";

interface PopularArticlesProps {
  currentPost: BlogPost;
  maxArticles?: number;
}

export async function PopularArticles({
  currentPost,
  maxArticles = 3,
}: PopularArticlesProps) {
  const popularSlugs = await getPopularPosts(maxArticles + 1);
  const allPosts = await getAllBlogPosts();

  const popularPosts = allPosts
    .filter((post) => popularSlugs.includes(post.slug))
    .filter((post) => post.slug !== currentPost.slug)
    .slice(0, maxArticles);

  if (popularPosts.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        Popular Articles
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {popularPosts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
