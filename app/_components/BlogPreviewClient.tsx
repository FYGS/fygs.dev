"use client";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { useIntlayer } from "next-intlayer";
import type { BlogPostMeta } from "@/lib/types";

interface BlogPreviewClientProps {
  posts: BlogPostMeta[];
}

export function BlogPreviewClient({ posts }: BlogPreviewClientProps) {
  const content = useIntlayer("blog-preview");

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-muted/30 via-background to-muted/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container max-w-7xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="h-4 w-4">📰</span>
            {content.badge.value}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-4">
            {content.title.value}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description.value}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {content.seeAllButton.value}
            <span className="h-5 w-5">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
