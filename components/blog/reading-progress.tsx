"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";
import { formatReadingTime } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Timer } from "lucide-react";
import { useLocale } from "next-intlayer";

export function ReadingProgress() {
  const { progress, timeSpent, isComplete } = useReadingProgress();
  const { locale } = useLocale();

  const label =
    locale === "fr"
      ? "Temps de lecture :"
      : locale === "es"
        ? "Tiempo de lectura:"
        : "Time spent reading:";

  return (
    <>
      <div className="fixed top-16 left-0 right-0 h-1 bg-muted z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        />
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-xs p-4 rounded-lg shadow-lg border border-muted/50"
          >
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-primary" />
              <p className="text-muted-foreground">
                {label} {formatReadingTime(timeSpent)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
