"use client";

import { BlogPost } from "@/lib/mdx";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

interface ArticleRecommendationsProps {
  currentSlug: string;
  posts: BlogPost[];
}

export function ArticleRecommendations({
  currentSlug,
  posts,
}: ArticleRecommendationsProps) {
  const recommendations = posts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recommended Articles</h3>
      <div className="space-y-4">
        {recommendations.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/blog/${post.slug}`}>
              <Card className="p-4 hover:bg-accent/50 transition-colors">
                <h4 className="font-medium">{post.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.categories.map((category) => (
                    <span
                      key={category}
                      className="text-xs text-muted-foreground"
                    >
                      #{category}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
