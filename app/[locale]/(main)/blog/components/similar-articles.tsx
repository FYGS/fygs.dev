"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  calculateContentSimilarity,
  extractKeywords,
} from "@/lib/content-analysis";
import { BlogPost, BlogPostMeta } from "@/lib/types";
import { motion } from "framer-motion";
import { Calendar, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArticlePreview } from "@/components/blog/article-preview";

interface SimilarArticlesProps {
  currentPost: BlogPost | BlogPostMeta;
  allPosts: BlogPostMeta[];
  maxArticles?: number;
}

function calculateSimilarityScore(
  post1: BlogPost | BlogPostMeta,
  post2: BlogPostMeta,
): number {
  let score = 0;

  // Score based on common categories (40% of total score)
  const commonCategories = post1.categories.filter((cat) =>
    post2.categories.includes(cat),
  );
  score +=
    (commonCategories.length /
      Math.max(post1.categories.length, post2.categories.length)) *
    0.4;

  // Score based on excerpt text similarity (40% of total score)
  const post1Text = post1.excerpt + " " + post1.title;
  const post2Text = post2.excerpt + " " + post2.title;
  const post1Keywords = extractKeywords(post1Text);
  const post2Keywords = extractKeywords(post2Text);
  const contentSimilarity = calculateContentSimilarity(
    post1Keywords,
    post2Keywords,
  );
  score += contentSimilarity * 0.4;

  // Score based on temporal proximity (20% of total score)
  const dateDiff = Math.abs(
    new Date(post1.date).getTime() - new Date(post2.date).getTime(),
  );
  const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
  const timeScore = Math.max(0, 1 - daysDiff / 365);
  score += timeScore * 0.2;

  return score;
}

export function SimilarArticles({
  currentPost,
  allPosts,
  maxArticles = 3,
}: SimilarArticlesProps) {
  const similarPosts = useMemo(() => {
    return allPosts
      .filter((post) => post.slug !== currentPost.slug)
      .map((post) => ({
        ...post,
        similarityScore: calculateSimilarityScore(currentPost, post),
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxArticles);
  }, [currentPost, allPosts, maxArticles]);

  const [previewPost, setPreviewPost] = useState<BlogPostMeta | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (post: BlogPostMeta, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 20, // 20px de marge à droite de l'article
      y: Math.min(
        rect.top,
        window.innerHeight - 400, // Éviter que la prévisualisation ne sorte de l'écran
      ),
    });
    setPreviewPost(post);
  };

  const handleMouseLeave = () => {
    setPreviewPost(null);
  };

  if (similarPosts.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Similar Articles
      </h2>
      <div className="grid gap-4">
        {similarPosts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={(e) => handleMouseEnter(post, e)}
            onMouseLeave={handleMouseLeave}
          >
            <Link href={`/blog/${post.slug}`}>
              <Card className="p-4 hover:bg-accent/50 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="group-hover:bg-primary/10"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readingTime}
                      </div>
                    </div>
                    <div className="text-xs">
                      {Math.round(post.similarityScore * 100)}% match
                    </div>
                  </div>

                  <div className="h-1 w-full bg-accent/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 group-hover:w-full"
                      style={{
                        width: `${post.similarityScore * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <ArticlePreview
        post={previewPost as BlogPostMeta}
        isVisible={previewPost !== null}
        position={previewPosition}
      />
    </div>
  );
}
