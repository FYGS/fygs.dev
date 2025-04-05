import { Skeleton } from "@/components/ui/skeleton";
import { getBlogPostsMeta } from "@/lib/mdx";
import { getLikeCount, getShareCount, getViewCount } from "@/lib/reading-stats";
import { Suspense } from "react";
import BlogClientPage from "./page.client";

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-40" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function BlogPage() {
  const posts = await getBlogPostsMeta();

  // Fetch initial stats for all posts
  const stats = await Promise.all(
    posts.map(async (post) => ({
      slug: post.slug,
      views: await getViewCount(post.slug),
      likes: await getLikeCount(post.slug),
      shares: await getShareCount(post.slug),
    }))
  );

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BlogClientPage posts={posts} initialStats={stats} />
    </Suspense>
  );
}
