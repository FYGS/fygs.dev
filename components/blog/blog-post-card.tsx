"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BlogPostMeta } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Eye,
  FileEdit,
  Flame,
  Heart,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useIntlayer, useLocale } from "next-intlayer";
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
  const { read, draft, shareSuccess, shareDescription } =
    useIntlayer("blog-card");
  const { locale } = useLocale();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: `${window.location.origin}/blog/${post.slug}`,
        });
        toast.success(shareSuccess, {
          description: shareDescription,
        });
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error(error);
      }
    }
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block w-full group">
      <Card className="overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full flex flex-col">
        {/* Image wrapper */}
        <div className="relative w-full overflow-hidden">
          <div className="transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <CoverImage
              src={post.coverImage}
              alt={post.title}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 45vw, 400px"
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

          {/* Trending badge */}
          {initialStats && initialStats.views >= 100 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold text-orange-100 bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-1 rounded-full shadow-lg">
              <Flame className="h-3 w-3" />
              <span>Trending</span>
            </div>
          )}

          {/* Floating read indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium text-white bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-lg">
            <span>{read}</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {post.draft && (
              <Badge
                variant="destructive"
                className="text-[10px] flex items-center gap-1 px-2 py-0.5"
              >
                <FileEdit className="h-2.5 w-2.5" />
                {draft}
              </Badge>
            )}
            {post.categories.slice(0, 3).map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="text-[10px] font-medium bg-primary/8 text-primary/90 border-primary/15 hover:bg-primary/15 transition-colors px-2 py-0.5"
              >
                {category}
              </Badge>
            ))}
            {post.categories.length > 3 && (
              <Badge
                variant="secondary"
                className="text-[10px] font-medium bg-muted/60 text-muted-foreground px-2 py-0.5"
              >
                +{post.categories.length - 3}
              </Badge>
            )}
          </div>

          {/* Title & Excerpt */}
          <div className="space-y-2 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.readingTime}</span>
            </div>
            {initialStats && (
              <>
                <span className="text-border/50">·</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{initialStats.views.toLocaleString()}</span>
                </div>
                <span className="text-border/50">·</span>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{initialStats.likes.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 border-t border-border/30 pt-3 mt-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 hover:text-primary transition-colors rounded-full hover:bg-primary/10"
              aria-label="Share article"
            >
              <Share2 className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
