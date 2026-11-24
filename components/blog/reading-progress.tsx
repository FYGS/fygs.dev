"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";
import { formatReadingTime } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Timer } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { useEffect, useState } from "react";

interface SectionMarker {
  id: string;
  title: string;
  position: number; // percentage position on the page
}

export function ReadingProgress() {
  const { progress, timeSpent, isComplete } = useReadingProgress();
  const { timeSpent: label } = useIntlayer("blog-stats");
  const [sections, setSections] = useState<SectionMarker[]>([]);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const headings = document.querySelectorAll(".mdx-content h2[id]");
    const totalHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const markers: SectionMarker[] = Array.from(headings).map((heading) => {
      const rect = heading.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      return {
        id: heading.id,
        title: heading.textContent?.replace("#", "").trim() || "",
        position: Math.min(
          (absoluteTop / (totalHeight + window.innerHeight)) * 100,
          100,
        ),
      };
    });

    const frame = requestAnimationFrame(() => setSections(markers));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <div className="fixed top-16 left-0 right-0 h-1 sm:h-1.5 bg-muted/60 z-50 group">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        />

        {/* Section markers — hidden on small mobile, visible on sm+ */}
        {sections.map((section) => (
          <button
            key={section.id}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer hidden sm:flex h-6 w-6 items-center justify-center"
            style={{ left: `${section.position}%` }}
            onClick={() => {
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            aria-label={section.title}
          >
            <div
              className={`h-2.5 w-2.5 rounded-full border-2 transition-all duration-200 ${
                progress >= section.position
                  ? "bg-primary border-primary scale-100"
                  : "bg-background border-muted-foreground/30 scale-75 group-hover:scale-100"
              }`}
            />
            <AnimatePresence>
              {hoveredSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md border border-border/50 z-[60] pointer-events-none max-w-48 truncate"
                >
                  {section.title}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-card/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-muted/50"
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
