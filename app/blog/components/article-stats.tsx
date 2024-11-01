"use client";

import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Eye, ThumbsUp, Users } from "lucide-react";
import { useRef } from "react";

interface ArticleStatsProps {
  readingTime: string;
  views: number;
  likes: number;
  shares: number;
}

export function ArticleStats({
  readingTime,
  views,
  likes,
  shares,
}: ArticleStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="sticky top-20">
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">{readingTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {views.toLocaleString()} views
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {likes.toLocaleString()} likes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {shares.toLocaleString()} shares
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
