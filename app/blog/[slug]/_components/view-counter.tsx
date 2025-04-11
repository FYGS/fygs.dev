"use client";

import { useBlogStats } from "@/stores/use-blog-stats";
import { useEffect } from "react";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const { syncStats, incrementViews } = useBlogStats();

  useEffect(() => {
    // Only run on the client side
    const incrementViewCount = async () => {
      try {
        // Increment the view count on the server immediately when the page loads
        const response = await fetch(`/api/blog/views/${slug}`, {
          method: "POST",
          cache: "no-store",
        });
        
        if (response.ok) {
          // Immediately update the view count in the store for a responsive feel
          incrementViews();
          
          // Then sync all stats to get the accurate counts
          await syncStats(slug);
        }
      } catch (error) {
        console.error("Failed to increment view count:", error);
      }
    };

    // Increment view count immediately on page visit
    incrementViewCount();
    
    // Set up an interval to periodically sync stats
    const intervalId = setInterval(() => {
      syncStats(slug);
    }, 10000); // Sync every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [slug, syncStats, incrementViews]);

  // This component doesn't render anything
  return null;
}
