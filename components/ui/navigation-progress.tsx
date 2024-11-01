"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigationProgress } from "@/hooks/use-navigation-progress";

interface NavigationProgressProps {
  className?: string;
}

export function NavigationProgress({ className }: NavigationProgressProps) {
  const { progress, isNavigating } = useNavigationProgress();

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 h-0.5 bg-border/50 z-50",
        className
      )}
    >
      <motion.div
        className="h-full bg-primary origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      />
    </div>
  );
}
