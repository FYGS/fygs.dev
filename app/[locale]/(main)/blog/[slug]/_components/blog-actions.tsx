"use client";

import { ShareButtons } from "@/components/blog/share-buttons";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface BlogActionsProps {
  slug: string;
  title: string;
  url: string;
}

export function BlogActions({ slug, title, url }: BlogActionsProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(slug);

  const handleBookmark = () => {
    toggleBookmark(slug);
    toast.success(bookmarked ? "Bookmark removed" : "Article bookmarked!", {
      description: bookmarked
        ? "Removed from your reading list"
        : "Added to your reading list",
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <ShareButtons url={url} title={title} compact />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={bookmarked ? "border-primary/50 text-primary" : ""}
            onClick={handleBookmark}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {bookmarked ? "Remove bookmark" : "Bookmark this article"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}