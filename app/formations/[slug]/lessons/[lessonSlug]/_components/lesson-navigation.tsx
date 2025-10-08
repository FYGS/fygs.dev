import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
}

interface LessonNavigationProps {
  lessons: Lesson[];
  currentLessonIndex: number;
  courseSlug: string;
}

export function LessonNavigation({ lessons, currentLessonIndex, courseSlug }: LessonNavigationProps) {
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {previousLesson ? (
              <Button variant="outline" asChild className="group">
                <Link href={`/formations/${courseSlug}/lessons/${previousLesson.slug}`}>
                  <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Précédent</div>
                    <div className="text-sm font-medium">{previousLesson.title}</div>
                  </div>
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div className="px-4">
            <Button variant="outline" asChild>
              <Link href={`/formations/${courseSlug}`}>
                Retour au cours
              </Link>
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            {nextLesson ? (
              <Button asChild className="group">
                <Link href={`/formations/${courseSlug}/lessons/${nextLesson.slug}`}>
                  <div className="text-right">
                    <div className="text-xs opacity-80">Suivant</div>
                    <div className="text-sm font-medium">{nextLesson.title}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/formations/${courseSlug}`}>
                  <div className="text-right">
                    <div className="text-xs opacity-80">Terminé</div>
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
