"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion, useAnimation } from "framer-motion";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SocialInteractionsProps {
  slug: string;
  initialLikes: number;
  initialBookmarks: number;
}

export function SocialInteractions({
  slug,
  initialLikes,
  initialBookmarks,
}: SocialInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const { toast } = useToast();
  const controls = useAnimation();

  useEffect(() => {
    // Charger l'état des interactions depuis localStorage
    const interactions = localStorage.getItem(`blog-interactions-${slug}`);
    if (interactions) {
      const { liked, bookmarked } = JSON.parse(interactions);
      setHasLiked(liked);
      setHasBookmarked(bookmarked);
    }
  }, [slug]);

  const saveInteractions = (liked: boolean, bookmarked: boolean) => {
    localStorage.setItem(
      `blog-interactions-${slug}`,
      JSON.stringify({ liked, bookmarked })
    );
  };

  const handleLike = async () => {
    try {
      await controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.3 },
      });

      if (!hasLiked) {
        setLikes((prev) => prev + 1);
        setHasLiked(true);
        saveInteractions(true, hasBookmarked);
        toast({
          title: "Article liked!",
          description: "Thank you for your appreciation.",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Could not process your like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    try {
      if (!hasBookmarked) {
        setBookmarks((prev) => prev + 1);
        setHasBookmarked(true);
        saveInteractions(hasLiked, true);
        toast({
          title: "Article bookmarked!",
          description: "Added to your reading list.",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Could not bookmark the article. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-around">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="space-x-2"
                onClick={handleLike}
              >
                <motion.div animate={controls}>
                  <Heart
                    className={`h-5 w-5 ${
                      hasLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </motion.div>
                <span>{likes}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasLiked ? "You liked this" : "Like this article"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="space-x-2"
                onClick={handleBookmark}
              >
                <Bookmark
                  className={`h-5 w-5 ${
                    hasBookmarked ? "fill-primary text-primary" : ""
                  }`}
                />
                <span>{bookmarks}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasBookmarked ? "Bookmarked" : "Save for later"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="space-x-2"
                onClick={() => {
                  // Ouvrir la boîte de dialogue de partage native
                  if (navigator.share) {
                    navigator.share({
                      title: document.title,
                      url: window.location.href,
                    });
                  }
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this article</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
