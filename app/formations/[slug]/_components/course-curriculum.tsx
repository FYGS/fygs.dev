import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Lock, CheckCircle } from "lucide-react";
import { SerializedLesson } from "../types";
import Link from "next/link";

interface CourseCurriculumProps {
  lessons: SerializedLesson[];
  courseSlug: string;
  isEnrolled?: boolean;
  userProgress?: { lessonId: string; completed: boolean }[];
  isAuthenticated?: boolean;
  canPreview?: boolean;
  lastPosition?: { lessonId: string; slug: string } | null;
  nextLesson?: { lessonId: string; slug: string } | null;
}

export function CourseCurriculum({ lessons, courseSlug, isEnrolled = false, userProgress = [], isAuthenticated = false, canPreview = false }: CourseCurriculumProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "À venir";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  const getLessonStatus = (lesson: SerializedLesson, index: number) => {
    const progress = userProgress.find(p => p.lessonId === lesson.id);
    
    if (progress?.completed) {
      return { icon: CheckCircle, color: "text-green-600", accessible: true };
    }
    
    if (!isAuthenticated) {
      return { icon: Lock, color: "text-muted-foreground", accessible: false };
    }
    if (!isEnrolled) {
      // Allow preview of first lesson if preview flag enabled
      if (index === 0 && canPreview) {
        return { icon: Play, color: "text-blue-600", accessible: true, preview: true } as any;
      }
      return { icon: Lock, color: "text-muted-foreground", accessible: false };
    }
    
    // First lesson is always accessible if enrolled
    if (index === 0) {
      return { icon: Play, color: "text-blue-600", accessible: true };
    }
    
    // Check if previous lesson is completed
    const previousLesson = lessons[index - 1];
    const previousProgress = userProgress.find(p => p.lessonId === previousLesson.id);
    
    if (previousProgress?.completed) {
      return { icon: Play, color: "text-blue-600", accessible: true };
    }
    
    return { icon: Lock, color: "text-muted-foreground", accessible: false };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Contenu de la formation</span>
          <Badge variant="secondary">
            {lessons.length} leçons • {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}min
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lessons.map((lesson, index) => {
          const status = getLessonStatus(lesson, index);
          const LessonContent = (
            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                  {lesson.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(lesson.duration)}</span>
                <status.icon className={`h-4 w-4 ${status.color}`} />
              </div>
            </div>
          );

          if (status.accessible && isAuthenticated && (isEnrolled || (index === 0 && canPreview))) {
            return (
              <Link
                key={lesson.id}
                href={`/formations/${courseSlug}/lessons/${lesson.slug}${!isEnrolled && canPreview && index === 0 ? '?preview=1' : ''}`}
                className="block hover:scale-[1.02] transition-transform"
              >
                {LessonContent}
              </Link>
            );
          }

          return (
            <div key={lesson.id} className={status.accessible ? "cursor-pointer" : "cursor-not-allowed opacity-60"}>
              {LessonContent}
            </div>
          );
        })}
        
        {lessons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Le contenu de cette formation sera bientôt disponible.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
