"use client";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { useIntlayer } from "next-intlayer";
import type { BlogPostMeta } from "@/lib/types";
import type { PostStats } from "@/types/blog";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface BlogPreviewClientProps {
  posts: BlogPostMeta[];
  statsMap: Record<string, PostStats>;
}

export function BlogPreviewClient({ posts, statsMap }: BlogPreviewClientProps) {
  const content = useIntlayer("blog-preview");

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

      <div className="container max-w-7xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium tracking-wide uppercase">
            {content.badge.value}
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gradient-heading">
            {content.title.value}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {content.description.value}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={post}
              initialStats={statsMap[post.slug]}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            {content.seeAllButton.value}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
