"use client";

import { Card } from "@/components/ui/card";
import { fadeIn } from "@/lib/animations";
import { useBlogStats } from "@/stores/use-blog-stats";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Eye, ThumbsUp, Users } from "lucide-react";
import { useRef } from "react";

interface ArticleStatsProps {
  readingTime: string;
  views: number;
  likes: number;
  shares: number;
}

export function ArticleStats({ readingTime, views }: ArticleStatsProps) {
  const { likes: currentLikes, shares: currentShares } = useBlogStats();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="md:sticky md:top-20 mb-6 md:mb-0"
      {...fadeIn}
    >
      <Card className="p-4 backdrop-blur-sm bg-card/80 border-muted/50">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Clock className="h-4 w-4 text-primary transition-colors group-hover:text-primary/80" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {readingTime}
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Eye className="h-4 w-4 text-primary transition-colors group-hover:text-primary/80" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {views.toLocaleString()} views
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <ThumbsUp className="h-4 w-4 text-primary transition-colors group-hover:text-primary/80" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {currentLikes.toLocaleString()} likes
            </span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Users className="h-4 w-4 text-primary transition-colors group-hover:text-primary/80" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {currentShares.toLocaleString()} shares
            </span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
