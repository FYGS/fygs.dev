import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Play, Lock } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
}

interface ProgressData {
  lessonId: string;
  completed: boolean;
}

interface LessonProgressProps {
  lessons: Lesson[];
  currentLessonId: string;
  courseSlug: string;
  progressData: ProgressData[];
}

export function LessonProgress({ lessons, currentLessonId, courseSlug, progressData }: LessonProgressProps) {
  const progressMap = progressData.reduce((acc, p) => {
    acc[p.lessonId] = p;
    return acc;
  }, {} as Record<string, ProgressData>);

  const completedLessons = progressData.filter(p => p.completed).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <Card className="bg-gray-900 border-gray-800 sticky top-4">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Progression du cours</span>
          <Badge variant="secondary">
            {completedLessons}/{lessons.length}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-gray-400">
            {progressPercentage}% terminé
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {lessons.map((lesson, index) => {
          const lessonProgress = progressMap[lesson.id];
          const isCompleted = lessonProgress?.completed || false;
          const isCurrent = lesson.id === currentLessonId;
          const isAccessible = index === 0 || progressMap[lessons[index - 1]?.id]?.completed;

          return (
            <div
              key={lesson.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isCurrent 
                  ? 'bg-primary/20 border-primary' 
                  : isAccessible 
                    ? 'border-gray-700 hover:bg-gray-800' 
                    : 'border-gray-800 opacity-50'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                  <Play className="h-4 w-4 text-primary" />
                ) : isAccessible ? (
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                {isAccessible ? (
                  <Link 
                    href={`/formations/${courseSlug}/lessons/${lesson.slug}`}
                    className="block"
                  >
                    <p className={`text-sm font-medium truncate ${
                      isCurrent ? 'text-primary' : 'text-white hover:text-primary'
                    }`}>
                      {lesson.order}. {lesson.title}
                    </p>
                  </Link>
                ) : (
                  <p className="text-sm font-medium truncate text-gray-500">
                    {lesson.order}. {lesson.title}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
