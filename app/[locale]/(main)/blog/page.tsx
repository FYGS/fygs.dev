import { Skeleton } from "@/components/ui/skeleton";
import { getBlogPostsMeta } from "@/lib/mdx";
import { Suspense } from "react";
import BlogClientPage from "./page.client";
import { getAllPostsStats } from "./actions/stats";

export const dynamic = "force-dynamic";

function LoadingSkeleton() {
  return (
    <div className="space-y-8 container-xl">
      {/* Header Section */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" /> {/* Title */}
        <Skeleton className="h-16 max-w-2xl" /> {/* Description */}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-64" /> {/* Search bar */}
        <Skeleton className="h-10 w-40" /> {/* Category filter */}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group">
            <Skeleton className="aspect-video w-full rounded-t-lg" />{" "}
            {/* Image */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" /> {/* Category badge */}
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-7 w-[90%]" /> {/* Title */}
              <Skeleton className="h-10 w-full" /> {/* Excerpt */}
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-5 w-20" /> {/* Reading time */}
                <Skeleton className="h-5 w-24" /> {/* View count */}
                <Skeleton className="h-5 w-20" /> {/* Like count */}
                <Skeleton className="h-5 w-24" /> {/* Share count */}
              </div>
              <div className="pt-4 flex justify-between items-center border-t">
                <Skeleton className="h-5 w-32" /> {/* Date */}
                <Skeleton className="h-8 w-8 rounded-full" />{" "}
                {/* Share button */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-72" />
      </div>
    </div>
  );
}

export default async function BlogPage() {
  const postsPromise = getBlogPostsMeta();
  const statsPromise = postsPromise.then((posts) =>
    getAllPostsStats(posts.map((p) => p.slug)),
  );

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BlogClientPage postsPromise={postsPromise} statsPromise={statsPromise} />
    </Suspense>
  );
}
