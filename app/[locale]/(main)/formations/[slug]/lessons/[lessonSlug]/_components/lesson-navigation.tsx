import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  type: 'lesson' | 'quiz';
  url: string;
}

interface LessonNavigationProps {
  lessons: CourseItem[];
  currentLessonIndex: number;
  courseSlug: string;
}

export function LessonNavigation({ lessons, currentLessonIndex, courseSlug }: LessonNavigationProps) {
  const previousItem = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextItem = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {previousItem ? (
              <Button variant="outline" asChild className="group h-auto py-4 px-6">
                <Link href={previousItem.url}>
                  <ChevronLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground mb-1">
                      {previousItem.type === 'quiz' ? 'Quiz précédent' : 'Leçon précédente'}
                    </div>
                    <div className="text-sm font-medium line-clamp-1">{previousItem.title}</div>
                  </div>
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div className="px-4 hidden md:block">
            <Button variant="ghost" asChild>
              <Link href={`/formations/${courseSlug}`}>
                Retour au cours
              </Link>
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            {nextItem ? (
              <Button variant="outline" asChild className="group h-auto py-4 px-6">
                <Link href={nextItem.url}>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">
                      {nextItem.type === 'quiz' ? 'Quiz suivant' : 'Leçon suivante'}
                    </div>
                    <div className="text-sm font-medium line-clamp-1">{nextItem.title}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="h-auto py-4 px-6">
                <Link href={`/formations/${courseSlug}`}>
                  <div className="text-right">
                    <div className="text-xs opacity-80 mb-1">Terminé</div>
                    <div className="text-sm font-medium">Retour au cours</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
