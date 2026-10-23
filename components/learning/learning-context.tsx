"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  computeProgress,
  type CourseOutline,
  type CourseProgress,
  type OutlineItem,
} from "@/lib/learning/outline";
import type { LearnerMode } from "@/lib/learning/access";

export interface LearningContextValue {
  courseSlug: string;
  courseTitle: string;
  mode: LearnerMode;
  outline: CourseOutline;
  /** Ids of the items this visitor may open (all of them unless the course is only previewed). */
  openableIds: ReadonlySet<string>;
  completedLessonIds: ReadonlySet<string>;
  passedQuizIds: ReadonlySet<string>;
  examPassed: boolean;
  progress: CourseProgress;
  hasSupports: boolean;
  /** Shows a lesson as done at once; the server refresh confirms it. */
  markLessonDone: (lessonId: string) => void;
  isDone: (item: OutlineItem) => boolean;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function useLearning(): LearningContextValue {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearning must be used inside <LearningProvider>");
  return value;
}

interface LearningProviderProps {
  courseSlug: string;
  courseTitle: string;
  mode: LearnerMode;
  outline: CourseOutline;
  openableIds: string[];
  completedLessonIds: string[];
  passedQuizIds: string[];
  examPassed: boolean;
  hasSupports: boolean;
  children: React.ReactNode;
}

export function LearningProvider({
  courseSlug,
  courseTitle,
  mode,
  outline,
  openableIds,
  completedLessonIds,
  passedQuizIds,
  examPassed,
  hasSupports,
  children,
}: LearningProviderProps) {
  // Lessons completed in this tab before the server has sent its new state back
  const [optimistic, setOptimistic] = useState<ReadonlySet<string>>(new Set());

  const markLessonDone = useCallback((lessonId: string) => {
    setOptimistic((prev) => (prev.has(lessonId) ? prev : new Set(prev).add(lessonId)));
  }, []);

  const value = useMemo<LearningContextValue>(() => {
    const completed = new Set([...completedLessonIds, ...optimistic]);
    const passed = new Set(passedQuizIds);
    const progress = computeProgress(outline, {
      completedLessonIds: completed,
      passedQuizIds: passed,
      examPassed,
    });
    return {
      courseSlug,
      courseTitle,
      mode,
      outline,
      openableIds: new Set(openableIds),
      completedLessonIds: completed,
      passedQuizIds: passed,
      examPassed,
      progress,
      hasSupports,
      markLessonDone,
      isDone: (item) =>
        item.kind === "lesson" ? completed.has(item.id) : item.kind === "quiz" ? passed.has(item.id) : examPassed,
    };
  }, [
    courseSlug,
    courseTitle,
    mode,
    outline,
    openableIds,
    completedLessonIds,
    passedQuizIds,
    examPassed,
    hasSupports,
    optimistic,
    markLessonDone,
  ]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}
