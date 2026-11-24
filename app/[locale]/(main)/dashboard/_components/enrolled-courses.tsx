import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courseStatusLabel } from "@/components/dashboard/my-course-card";
import { getUserCoursesProgressOnce } from "@/lib/progress-summary";

/**
 * The first block of the dashboard: the courses to resume, most recently worked on first (the first one is where
 * the learner left off), with their next step.
 */
export async function EnrolledCourses({ userId }: { userId: string }) {
  const all = await getUserCoursesProgressOnce(userId);
  // In progress and open first; finished or closed ones are in « Mon apprentissage »
  const resume = all.filter((c) => c.hasAccess && !c.isComplete && !c.hasCertificate);
  const shown = (resume.length > 0 ? resume : all).slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle as="h2" className="text-lg">
          {resume.length > 0 ? "Reprendre" : "Mes formations"}
        </CardTitle>
        {all.length > 0 && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/my-courses">Mon apprentissage</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {shown.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">Vous ne suivez aucune formation pour le moment.</p>
            <Button asChild>
              <Link href="/formations">Découvrir les formations</Link>
            </Button>
          </div>
        ) : (
          shown.map((course, index) => {
            const status = courseStatusLabel(course);
            return (
              <div key={course.courseId} className="flex flex-wrap items-center gap-4 rounded-lg border p-4 sm:flex-nowrap">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="text-sm font-medium leading-tight">
                    <Link href={`/formations/${course.slug}`} className="hover:underline">
                      {course.title}
                    </Link>
                    {status && <span className="ml-2 text-xs font-normal text-muted-foreground">· {status}</span>}
                  </h3>
                  <Progress value={course.percent} aria-label={`Progression dans ${course.title}`} className="h-2" />
                  <p className="truncate text-xs text-muted-foreground">
                    {course.nextStepTitle ? `Prochaine étape : ${course.nextStepTitle}` : `${course.done} / ${course.total} étapes`}
                    {course.total > 0 && ` · ${course.percent} %`}
                  </p>
                </div>

                <Button size="sm" variant={index === 0 && resume.length > 0 ? "default" : "outline"} asChild className="shrink-0">
                  <Link href={course.continueHref}>
                    {!course.hasAccess ? "Reprendre l’accès" : course.isComplete || course.hasCertificate ? "Revoir" : course.done === 0 ? "Commencer" : "Continuer"}
                    <span className="sr-only"> : {course.title}</span>
                  </Link>
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
