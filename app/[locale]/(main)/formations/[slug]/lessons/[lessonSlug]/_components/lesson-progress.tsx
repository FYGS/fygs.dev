"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Check,
  Play,
  Lock,
  Target,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

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

interface LessonProgressProps {
  lessons: CourseItem[]; // Standalone lessons
  modules?: Module[];
  currentLessonId: string;
  progressData: ProgressData[];
}

export function LessonProgress({
  lessons,
  modules = [],
  currentLessonId,
  progressData,
}: LessonProgressProps) {
  const progressMap = progressData.reduce(
    (acc, p) => {
      acc[p.itemId] = p;
      return acc;
    },
    {} as Record<string, ProgressData>,
  );

  // Create a linear list for calculating accessibility and total progress
  const allItems = [...lessons, ...modules.flatMap((m) => m.items)];

  const completedItems = progressData.filter((p) => p.completed).length;
  const progressPercentage =
    allItems.length > 0
      ? Math.round((completedItems / allItems.length) * 100)
      : 0;

  // Find which module contains the current lesson to open it by default
  const currentModuleIndex = modules.findIndex((m) =>
    m.items.some((item) => item.id === currentLessonId),
  );

  const [openModules, setOpenModules] = useState<Record<number, boolean>>(
    currentModuleIndex >= 0 ? { [currentModuleIndex]: true } : { 0: true },
  );

  const toggleModule = (moduleIndex: number) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex],
    }));
  };

  const renderLesson = (
    item: CourseItem,
    globalIndex: number,
    displayNumber: number,
  ) => {
    const itemProgress = progressMap[item.id];
    const isCompleted = itemProgress?.completed || false;
    const isCurrent = item.id === currentLessonId;
    const isAccessible =
      globalIndex === 0 ||
      progressMap[allItems[globalIndex - 1]?.id]?.completed ||
      false;

    const content = (
      <div
        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
          isCurrent
            ? "bg-primary/15 border-primary/40"
            : isAccessible
              ? "border-border hover:bg-accent/50"
              : "border-border/50 opacity-50"
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium shrink-0">
            {displayNumber}
          </div>
          <p
            className={`text-sm font-medium truncate ${
              isCurrent
                ? "text-primary"
                : isAccessible
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            {item.title}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isCurrent ? (
            <Play className="h-4 w-4 text-primary" />
          ) : isAccessible ? (
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground/60" />
          )}
        </div>
      </div>
    );

    return isAccessible ? (
      <Link
        key={item.id}
        href={item.url}
        className="block hover:scale-[1.01] transition-transform"
      >
        {content}
      </Link>
    ) : (
      <div key={item.id} className="cursor-not-allowed">
        {content}
      </div>
    );
  };

  const renderQuiz = (item: CourseItem) => {
    const itemProgress = progressMap[item.id];
    const isCompleted = itemProgress?.completed || false;
    const isCurrent = item.id === currentLessonId;

    return (
      <Link
        key={item.id}
        href={item.url}
        className="block hover:scale-[1.01] transition-transform"
      >
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            isCurrent
              ? "bg-violet-500/20 border-violet-500/50"
              : "bg-gradient-to-r from-violet-950/50 to-purple-950/50 border-violet-700/50 hover:from-violet-900/50 hover:to-purple-900/50"
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 shrink-0">
              <Target className="h-3 w-3 text-white" />
            </div>
            <p className="text-sm font-medium truncate text-violet-200">
              {item.title}
            </p>
          </div>
          <div className="shrink-0">
            {isCompleted ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Play className="h-4 w-4 text-violet-400" />
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/90 border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-lg flex items-center justify-between">
          <span>Progression</span>
          <Badge
            variant="secondary"
            className="bg-primary/15 text-primary border-primary/30"
          >
            {completedItems}/{allItems.length}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {progressPercentage}% terminé
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-1 px-4 pb-4">
            {/* Standalone Lessons */}
            {lessons.length > 0 &&
              lessons.map((lesson, index) => {
                const globalIndex = index;
                return renderLesson(lesson, globalIndex, index + 1);
              })}

            {/* Modules */}
            {modules.map((module, moduleIndex) => {
              const isOpen = openModules[moduleIndex];

              // Count lessons before this module (standalone + previous modules)
              let lessonNumberOffset = lessons.length;
              for (let i = 0; i < moduleIndex; i++) {
                lessonNumberOffset += modules[i].items.filter(
                  (item) => item.type === "lesson",
                ).length;
              }

              // Separate lessons and quizzes
              const moduleLessons = module.items.filter(
                (item) => item.type === "lesson",
              );
              const moduleQuizzes = module.items.filter(
                (item) => item.type === "quiz",
              );

              const moduleLessonCount = moduleLessons.length;

              return (
                <Collapsible
                  key={module.id}
                  open={isOpen}
                  onOpenChange={() => toggleModule(moduleIndex)}
                >
                  <CollapsibleTrigger className="w-full text-left hover:bg-accent/50 transition-colors rounded-lg">
                    <div className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {moduleIndex + 1}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {module.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {moduleLessonCount}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="space-y-1 pl-3 pr-1 py-1">
                      {/* Lessons */}
                      {moduleLessons.map((lesson, lessonIndex) => {
                        const globalIndex = allItems.findIndex(
                          (i) => i.id === lesson.id,
                        );
                        const displayNumber =
                          lessonNumberOffset + lessonIndex + 1;
                        return renderLesson(lesson, globalIndex, displayNumber);
                      })}

                      {/* Quizzes */}
                      {moduleQuizzes.length > 0 && (
                        <div className="pt-1 space-y-1">
                          {moduleQuizzes.map(renderQuiz)}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
