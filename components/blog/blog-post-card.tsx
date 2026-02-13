"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BlogPostMeta } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  FileEdit,
  Heart,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intlayer";
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
        toast.success(
          locale === "fr"
            ? "Partagé avec succès"
            : locale === "es"
              ? "Compartido con éxito"
              : "Shared successfully",
          {
            description:
              locale === "fr"
                ? "Merci pour le partage !"
                : locale === "es"
                  ? "¡Gracias por compartir!"
                  : "Thank you for sharing!",
          },
        );
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error(error);
      }
    }
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block w-full group">
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
        {/* Image wrapper with gradient overlay */}
        <div className="relative w-full overflow-hidden">
          <div className="transition-transform duration-500 group-hover:scale-105">
            <CoverImage
              src={post.coverImage}
              alt={post.title}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 45vw, 400px"
            />
          </div>
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Read more indicator */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <span>
              {locale === "fr" ? "Lire" : locale === "es" ? "Leer" : "Read"}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {post.draft && (
              <Badge
                variant="destructive"
                className="text-xs flex items-center gap-1"
              >
                <FileEdit className="h-3 w-3" />
                {locale === "fr"
                  ? "Brouillon"
                  : locale === "es"
                    ? "Borrador"
                    : "Draft"}
              </Badge>
            )}
            {post.categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Title & Excerpt */}
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary/60" />
              <span>{post.readingTime}</span>
            </div>
            {initialStats && (
              <>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary/60" />
                  <span>{initialStats.views.toLocaleString()}</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-primary/60" />
                  <span>{initialStats.likes.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            >
              <Share2 className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
