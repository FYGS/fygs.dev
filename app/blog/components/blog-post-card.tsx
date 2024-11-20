import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BlogPost } from "@/lib/mdx";
import { Calendar, Clock, FileEdit } from "lucide-react";
import Link from "next/link";
import { CoverImage } from "./cover-image";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
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

          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              {post.readingTime}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
