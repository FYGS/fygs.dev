"use client";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { fadeIn, scaleIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useBlogStats } from "@/stores/use-blog-stats";
import { motion, useAnimation } from "framer-motion";
import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SocialInteractionsClientProps {
  slug: string;
  initialLikes: number;
  shareCount: number;
  onLike: (userId: string) => Promise<boolean>;
  onShare: () => Promise<number>;
  variant?: "default" | "large";
}

export function SocialInteractionsClient({
  slug,
  initialLikes,
  shareCount,
  onLike,
  onShare,
  variant = "default",
}: SocialInteractionsClientProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const controls = useAnimation();
  const {
    likes,
    shares,
    setLikes,
    setShares,
    incrementLikes,
    decrementLikes,
    incrementShares,
  } = useBlogStats();

  useEffect(() => {
    const liked = localStorage.getItem(`blog-like-${slug}`);
    setHasLiked(liked === "true");
  }, [slug]);

  const { syncStats } = useBlogStats();

  useEffect(() => {
    // Initialize with the provided values
    setLikes(initialLikes);
    setShares(shareCount);

    // Then sync with the latest values from the server
    syncStats(slug);

    // Set up an interval to periodically sync stats
    const intervalId = setInterval(() => {
      syncStats(slug);
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(intervalId);
  }, [initialLikes, shareCount, setLikes, setShares, syncStats, slug]);

  const handleLike = async () => {
    try {
      await controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.3 },
      });

      const userId = "anonymous"; // Replace with actual user ID when auth is added
      const isLiked = await onLike(userId);

      // Update the local state immediately for a responsive feel
      if (isLiked) {
        incrementLikes();
      } else {
        decrementLikes();
      }
      setHasLiked(isLiked);
      localStorage.setItem(`blog-like-${slug}`, String(isLiked));

      // Then sync with the server to get the accurate count
      await syncStats(slug);

      toast.success(isLiked ? "Article liked!" : "Like removed", {
        description: isLiked
          ? "Thank you for your appreciation."
          : "You've removed your like.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Could not process your like. Please try again.");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        await onShare();
        incrementShares();

        // Sync with the server to get the accurate count
        await syncStats(slug);
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error(error);
        toast.error("Could not share the article. Please try again.");
      }
    }
  };

  const buttonClasses =
    variant === "large" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";

  const iconClasses = variant === "large" ? "h-6 w-6" : "h-5 w-5";

  return (
    <Card
      className={cn(
        "p-4 backdrop-blur-sm bg-card/80 border-muted/50",
        variant === "large" && "p-6"
      )}
    >
      <motion.div
        className="flex justify-center sm:justify-around gap-8 sm:gap-4"
        {...fadeIn}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                {...scaleIn}
                className={cn(
                  "inline-flex items-center justify-center gap-3 rounded-md font-medium transition-colors",
                  "hover:bg-primary/10 active:bg-primary/20",
                  buttonClasses,
                  hasLiked && "text-red-500"
                )}
                onClick={handleLike}
              >
                <motion.div animate={controls} whileTap={{ scale: 0.9 }}>
                  <Heart
                    className={cn(
                      "transition-all",
                      iconClasses,
                      hasLiked && "fill-red-500 text-red-500"
                    )}
                  />
                </motion.div>
                <span className="font-semibold">{likes}</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasLiked ? "You liked this" : "Like this article"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                {...scaleIn}
                className={cn(
                  "inline-flex items-center justify-center gap-3 rounded-md font-medium transition-colors",
                  "hover:bg-primary/10 active:bg-primary/20",
                  buttonClasses
                )}
                onClick={handleShare}
              >
                <Share2 className={iconClasses} />
                <span className="font-semibold">{shares}</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this article</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </Card>
  );
}
