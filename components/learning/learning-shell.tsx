"use client";

import { useState, useEffect } from "react";
import { LearningTopBar } from "./learning-top-bar";
import { LearningSidebar } from "./learning-sidebar";
import { cn } from "@/lib/utils";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  type: "lesson" | "quiz";
  url: string;
}

interface Module {
  id: string;
  title: string;
  items: CourseItem[];
}

interface ProgressData {
  itemId: string;
  completed: boolean;
  type: "lesson" | "quiz";
}

interface LearningShellProps {
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
  progressPercentage: number;
  lessons: CourseItem[];
  modules: Module[];
  currentLessonId: string;
  progressData: ProgressData[];
  children: React.ReactNode;
}

export function LearningShell({
  courseTitle,
  courseSlug,
  lessonTitle,
  progressPercentage,
  lessons,
  modules,
  currentLessonId,
  progressData,
  children,
}: LearningShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and set sidebar default state
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(!e.matches);
      if (e.matches) setSidebarOpen(true);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((o) => !o);
  };

  // Close sidebar on mobile when navigating
  const handleMobileClose = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      <LearningTopBar
        courseTitle={courseTitle}
        courseSlug={courseSlug}
        lessonTitle={lessonTitle}
        progressPercentage={progressPercentage}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={handleMobileClose}
          aria-hidden
        />
      )}

      <LearningSidebar
        lessons={lessons}
        modules={modules}
        currentLessonId={currentLessonId}
        progressData={progressData}
        open={sidebarOpen}
      />

      <main
        className={cn(
          "transition-[margin] duration-300 ease-in-out",
          "pt-4 pb-20 px-4 md:pt-6 md:pb-12 md:px-8",
          sidebarOpen && !isMobile ? "md:ml-80" : "ml-0",
        )}
      >
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t p-3 safe-area-pb">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            {progressPercentage}%
          </span>
        </div>
      </div>
    </>
  );
}
