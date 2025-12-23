import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, Play, Lock, FileQuestion } from "lucide-react";
import Link from "next/link";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  type: 'lesson' | 'quiz';
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
  type: 'lesson' | 'quiz';
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
  const progressMap = progressData.reduce((acc, p) => {
    acc[p.itemId] = p;
    return acc;
  }, {} as Record<string, ProgressData>);

  // Create a linear list for calculating accessibility and total progress
  const allItems = [
    ...lessons,
    ...modules.flatMap((m) => m.items),
  ];

  const completedItems = progressData.filter((p) => p.completed).length;
  const progressPercentage =
    allItems.length > 0
      ? Math.round((completedItems / allItems.length) * 100)
      : 0;

  const renderItem = (item: CourseItem, globalIndex: number, displayNumber?: number) => {
    const itemProgress = progressMap[item.id];
    const isCompleted = itemProgress?.completed || false;
    const isCurrent = item.id === currentLessonId;

    // Accessibility logic:
    // - First item is always accessible
    // - Quiz is accessible if all lessons in its module are completed
    // - Lesson is accessible if previous lesson is completed
    let isAccessible = false;
    if (globalIndex === 0) {
      isAccessible = true;
    } else if (item.type === 'quiz') {
      // Quiz is always accessible (user can attempt anytime)
      // But we can make it conditional on module completion if needed
      isAccessible = true;
    } else {
      // Lesson: check if previous item is completed
      isAccessible = progressMap[allItems[globalIndex - 1]?.id]?.completed || false;
    }

    const Icon = item.type === 'quiz' ? FileQuestion : Play;

    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCurrent
          ? "bg-primary/20 border-primary"
          : isAccessible
            ? "border-gray-700 hover:bg-gray-800"
            : "border-gray-800 opacity-50"
          }`}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full shrink-0">
          {isCompleted ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isCurrent ? (
            <Icon className="h-4 w-4 text-primary" />
          ) : isAccessible ? (
            <div className="w-2 h-2 rounded-full bg-gray-500" />
          ) : (
            <Lock className="h-4 w-4 text-gray-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isAccessible ? (
            <Link
              href={item.url}
              className="block"
            >
              <p
                className={`text-sm font-medium truncate ${isCurrent
                  ? "text-primary"
                  : "text-white hover:text-primary"
                  }`}
              >
                {item.type === 'quiz' ? (
                  <span className="flex items-center gap-1">
                    <FileQuestion className="h-3 w-3 inline" />
                    {item.title}
                  </span>
                ) : (
                  `${displayNumber !== undefined ? `${displayNumber}. ` : ''}${item.title}`
                )}
              </p>
            </Link>
          ) : (
            <p className="text-sm font-medium truncate text-gray-500">
              {item.type === 'quiz' ? (
                <span className="flex items-center gap-1">
                  <FileQuestion className="h-3 w-3 inline" />
                  {item.title}
                </span>
              ) : (
                `${displayNumber !== undefined ? `${displayNumber}. ` : ''}${item.title}`
              )}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-900 border-gray-800 sticky top-4">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Progression</span>
          <Badge variant="secondary">
            {completedItems}/{allItems.length}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-gray-400">{progressPercentage}% terminé</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 px-6 py-2 min-w-max">
            {/* Standalone Lessons */}
            {lessons.length > 0 && (
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const globalIndex = index;
                  return renderItem(lesson, globalIndex, index + 1);
                })}
              </div>
            )}

            {/* Modules */}
            {modules.map((module, moduleIndex) => {
              // Count lessons before this module (standalone + previous modules)
              let lessonNumberOffset = lessons.length;
              for (let i = 0; i < moduleIndex; i++) {
                lessonNumberOffset += modules[i].items.filter(item => item.type === 'lesson').length;
              }

              return (
                <div key={module.id} className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-900 py-2 z-10">
                    {module.title}
                  </h3>
                  <div className="space-y-2">
                    {module.items.map((item, itemIndex) => {
                      const globalIndex = allItems.findIndex(
                        (i) => i.id === item.id
                      );

                      // Calculate display number for lessons only
                      let displayNumber: number | undefined = undefined;
                      if (item.type === 'lesson') {
                        const lessonsBeforeInModule = module.items
                          .slice(0, itemIndex)
                          .filter(i => i.type === 'lesson').length;
                        displayNumber = lessonNumberOffset + lessonsBeforeInModule + 1;
                      }

                      return renderItem(item, globalIndex, displayNumber);
                    })}
                  </div>
                </div>
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
