import Image from "next/image";
import Link from "next/link";
import { Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserCoursesProgressOnce } from "@/lib/progress-summary";

interface EnrolledCoursesProps {
  userId: string;
}

/** The courses in progress, most recently worked on first: the top row is where to resume. */
export async function EnrolledCourses({ userId }: EnrolledCoursesProps) {
  const courses = (await getUserCoursesProgressOnce(userId)).slice(0, 6);

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes formations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">Vous n&apos;êtes inscrit à aucune formation pour le moment.</p>
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
          <Link href="/dashboard/my-courses">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course, index) => (
          <div
            key={course.courseId}
            className="flex flex-wrap items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-nowrap"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              {course.thumbnail ? (
                <Image src={course.thumbnail} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                  <Play className="h-6 w-6 text-primary/50" aria-hidden />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-sm font-medium leading-tight">
                <Link href={`/formations/${course.slug}`} className="hover:underline">
                  {course.title}
                </Link>
              </h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {course.done}/{course.total} étapes
                  </span>
                  <span>{course.percent}%</span>
                </div>
                <Progress value={course.percent} aria-label={`Progression de ${course.title}`} className="h-2" />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {course.hasCertificate && (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link href={`/certificates/${course.courseId}`} aria-label={`Certificat de ${course.title}`}>
                    <Award className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              )}
              <Button size="sm" variant={course.isComplete ? "outline" : index === 0 ? "default" : "secondary"} asChild>
                <Link href={course.continueHref}>{course.isComplete ? "Revoir" : course.done === 0 ? "Commencer" : "Continuer"}</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
