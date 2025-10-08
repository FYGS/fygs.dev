"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BlogPostMeta } from "@/lib/types";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, FileEdit, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { CoverImage } from "./cover-image";

interface BlogPostCardProps {
  post: BlogPostMeta;
  initialStats?: {
    views: number;
    likes: number;
    shares: number;
  };
}

export function BlogPostCard({ post, initialStats }: BlogPostCardProps) {

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: `${window.location.origin}/blog/${post.slug}`,
        });
        toast.success("Shared successfully", {
          description: "Thank you for sharing!",
        });
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error(error);
      }
    }
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block w-full">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="w-full">
          <CoverImage
            src={post.coverImage}
            alt={post.title}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 45vw, 400px"
          />
        </div>

        <div className="p-4 sm:p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {post.draft && (
              <Badge
                variant="destructive"
                className="text-xs sm:text-sm flex items-center gap-1"
              >
                <FileEdit className="h-3 w-3" />
                Draft
              </Badge>
            )}
            {post.categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="text-xs sm:text-sm"
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{post.readingTime}</span>
            </div>
            {initialStats && (
              <>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>{initialStats.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>{initialStats.likes.toLocaleString()} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <span>{initialStats.shares.toLocaleString()} shares</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-muted pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
