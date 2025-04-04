// "use server";

import { getBlogPostsMeta } from "@/lib/mdx";
import BlogClientPage from "./page.client";
import { Suspense } from "react";

export default function BlogPage() {
  // Don't await the data fetching function
  const posts = getBlogPostsMeta();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogClientPage posts={posts} />;
    </Suspense>
  );
}
