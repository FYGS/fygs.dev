import { getBlogPostsMeta } from "@/lib/mdx";
import { BlogPreviewClient } from "./BlogPreviewClient";

interface BlogPreviewProps {
  maxPosts?: number;
}

export async function BlogPreview({ maxPosts = 3 }: BlogPreviewProps) {
  const allPosts = await getBlogPostsMeta();
  const latestPosts = allPosts.slice(0, maxPosts);

  if (latestPosts.length === 0) return null;

  return <BlogPreviewClient posts={latestPosts} />;
}
