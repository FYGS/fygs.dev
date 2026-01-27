import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Target, Play } from "lucide-react";
import Link from "next/link";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  type: "lesson" | "quiz"; // Can be lesson or quiz in the navigation flow
  url: string;
}

interface LessonNavigationProps {
  lessons: CourseItem[];
  currentLessonIndex: number;
  courseSlug: string;
}

export function LessonNavigation({
  lessons,
  currentLessonIndex,
  courseSlug,
}: LessonNavigationProps) {
  const previousItem =
    currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextItem =
    currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

  return (
    <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/90 border-gray-700/50 shadow-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {previousItem ? (
              <Button
                variant="outline"
                asChild
                className={`group h-auto py-3 px-4 border-gray-700 hover:bg-gray-800 transition-all ${
                  previousItem.type === "quiz"
                    ? "hover:border-violet-500/50"
                    : "hover:border-blue-500/50"
                }`}
              >
                <Link href={previousItem.url}>
                  <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                      {previousItem.type === "quiz" ? (
                        <>
                          <Target className="h-3 w-3" />
                          Quiz précédent
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Leçon précédente
                        </>
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium line-clamp-1 ${
                        previousItem.type === "quiz"
                          ? "text-violet-300"
                          : "text-white"
                      }`}
                    >
                      {previousItem.title}
                    </div>
                  </div>
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div className="px-2 hidden md:block">
            <Button
              variant="ghost"
              asChild
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Link href={`/formations/${courseSlug}`}>Retour au cours</Link>
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            {nextItem ? (
              <Button
                variant="outline"
                asChild
                className={`group h-auto py-3 px-4 border-gray-700 hover:bg-gray-800 transition-all ${
                  nextItem.type === "quiz"
                    ? "hover:border-violet-500/50"
                    : "hover:border-blue-500/50"
                }`}
              >
                <Link href={nextItem.url}>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1 justify-end">
                      {nextItem.type === "quiz" ? (
                        <>
                          Quiz suivant
                          <Target className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Leçon suivante
                          <Play className="h-3 w-3" />
                        </>
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium line-clamp-1 ${
                        nextItem.type === "quiz"
                          ? "text-violet-300"
                          : "text-white"
                      }`}
                    >
                      {nextItem.title}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="h-auto py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
              >
                <Link href={`/formations/${courseSlug}`}>
                  <div className="text-right">
                    <div className="text-xs opacity-90 mb-0.5">Terminé !</div>
                    <div className="text-sm font-medium">Retour au cours</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
