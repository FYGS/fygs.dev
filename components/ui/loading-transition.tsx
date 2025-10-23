"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingTransitionProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingTransition({
  isLoading,
  className,
}: LoadingTransitionProps) {
  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-xs",
        className
      )}
      initial={false}
      animate={{
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? "auto" : "none",
      }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
          animate={{
            rotate: isLoading ? 360 : 0,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}
