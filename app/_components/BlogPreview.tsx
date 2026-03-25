import { getBlogPostsMeta } from "@/lib/mdx";
import { BlogPreviewClient } from "./BlogPreviewClient";
import { getAllPostsStats } from "@/app/[locale]/(main)/blog/actions/stats";
import { connection } from "next/server";

interface BlogPreviewProps {
  maxPosts?: number;
}

export async function BlogPreview({ maxPosts = 3 }: BlogPreviewProps) {
  // Opt into dynamic rendering so stats come from Redis at runtime, not build time
  await connection();

  const allPosts = await getBlogPostsMeta();
  const latestPosts = allPosts.slice(0, maxPosts);

  if (latestPosts.length === 0) return null;

  const statsMap = await getAllPostsStats(latestPosts.map((p) => p.slug));

  return <BlogPreviewClient posts={latestPosts} statsMap={statsMap} />;
}
