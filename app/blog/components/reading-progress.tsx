"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";
import { motion } from "framer-motion";

export function ReadingProgress() {
  const { progress, timeSpent, isComplete } = useReadingProgress();

  return (
    <div className="fixed top-16 left-0 right-0 h-1 bg-muted z-50">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
      {isComplete && (
        <div className="fixed bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg">
          <p className="text-sm text-muted-foreground">
            Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
          </p>
        </div>
      )}
    </div>
  );
}
