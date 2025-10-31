import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EnrolledCoursesProps {
  userId: string;
}

export async function EnrolledCourses({ userId }: EnrolledCoursesProps) {
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" },
            select: { id: true, duration: true, slug: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
    take: 6,
  });

  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment: any) => {
      const progress = await db.progress.findMany({
        where: {
          userId,
          lesson: {
            courseId: enrollment.course.id,
          },
        },
      });

      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = progress.filter((p: any) => p.completed).length;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // Determine next lesson to continue
      const completedSet = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.lessonId));
      const nextLesson = enrollment.course.lessons.find((l: any) => !completedSet.has(l.id)) || enrollment.course.lessons[0];

      return {
        ...enrollment,
        progressPercentage: Math.round(progressPercentage),
        completedLessons,
        totalLessons,
        nextLessonSlug: nextLesson?.slug || null,
      };
    })
  );

  if (coursesWithProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes formations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Vous n&apos;êtes inscrit à aucune formation pour le moment.
            </p>
            <Button asChild>
              <Link href="/formations">Découvrir les formations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mes formations</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/formations">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {coursesWithProgress.map((enrollment: any) => (
          <div
            key={enrollment.id}
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
              {enrollment.course.thumbnail ? (
                <Image
                  src={enrollment.course.thumbnail}
                  alt={enrollment.course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary/50" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <h4 className="font-medium text-sm leading-tight">
                {enrollment.course.title}
              </h4>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {enrollment.completedLessons}/{enrollment.totalLessons} leçons
                  </span>
                  <span>{enrollment.progressPercentage}%</span>
                </div>
                <Progress value={enrollment.progressPercentage} className="h-2" />
              </div>
            </div>
            
            <Button size="sm" asChild>
              <Link href={enrollment.nextLessonSlug ? `/formations/${enrollment.course.slug}/lessons/${enrollment.nextLessonSlug}` : `/formations/${enrollment.course.slug}`}>
                {enrollment.progressPercentage > 0 ? "Continuer" : "Commencer"}
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
