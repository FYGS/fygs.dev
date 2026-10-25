import Link from "next/link";
import { BookOpen, MessageCircleQuestion, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { countQuestionsToAnswer } from "@/lib/curriculum/lesson-questions";

const percent = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

/**
 * The back office home of an instructor: their own courses and what waits for them. No platform figures, no other
 * instructor's learners.
 */
async function loadInstructorHome(userId: string, now: Date) {
  const courses = await db.course.findMany({
    where: { instructorId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      published: true,
      _count: { select: { enrollments: true, lessons: { where: { published: true } } } },
    },
  });
  const ids = courses.map((c) => c.id);
  const [completed, recent, questions] = await Promise.all([
    ids.length
      ? db.enrollment.groupBy({ by: ["courseId"], where: { courseId: { in: ids }, completedAt: { not: null } }, _count: { _all: true } })
      : Promise.resolve([]),
    ids.length
      ? db.enrollment.count({ where: { courseId: { in: ids }, enrolledAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } })
      : Promise.resolve(0),
    countQuestionsToAnswer({ id: userId, role: "INSTRUCTOR" }),
  ]);
  return { courses, completed, recent, questions };
}

export async function InstructorHome({ userId, name, now }: { userId: string; name: string; now: Date }) {
  const { courses, completed, recent, questions } = await loadInstructorHome(userId, now);
  const completedOf = new Map(completed.map((row) => [row.courseId, row._count._all]));
  const learners = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bonjour {name}</h1>
          <p className="text-muted-foreground">Vos formations et ce qui attend votre réponse.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Nouvelle formation
          </Link>
        </Button>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" aria-hidden /> Formations
          </dt>
          <dd className="mt-1 text-2xl font-semibold">
            {courses.length}
            <span className="ml-2 text-sm font-normal text-muted-foreground">dont {courses.filter((c) => c.published).length} en ligne</span>
          </dd>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden /> Apprenants inscrits
          </dt>
          <dd className="mt-1 text-2xl font-semibold">
            {learners}
            <span className="ml-2 text-sm font-normal text-muted-foreground">+{recent} sur 30 jours</span>
          </dd>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircleQuestion className="h-4 w-4" aria-hidden /> Questions sans réponse
          </dt>
          <dd className="mt-1 flex items-baseline gap-3 text-2xl font-semibold">
            {questions}
            {questions > 0 && (
              <Link href="/admin/questions" className="text-sm font-normal text-primary underline-offset-4 hover:underline">
                Répondre
              </Link>
            )}
          </dd>
        </div>
      </dl>

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-lg">
            Mes formations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">Vous n&apos;avez pas encore de formation</p>
              <p className="mt-1 text-sm text-muted-foreground">Un titre suffit pour commencer : le reste se construit pas à pas dans l&apos;éditeur.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/courses/new">Créer ma première formation</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {courses.map((course) => {
                const done = completedOf.get(course.id) ?? 0;
                return (
                  <li key={course.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/courses/${course.id}`} className="font-medium hover:underline">
                        {course.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {course._count.lessons} leçon{course._count.lessons > 1 ? "s" : ""} publiée{course._count.lessons > 1 ? "s" : ""} · {course._count.enrollments} inscrit
                        {course._count.enrollments > 1 ? "s" : ""} · {percent(done, course._count.enrollments)} % ont terminé
                      </p>
                    </div>
                    <Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Publiée" : "Brouillon"}</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}?section=statistiques`}>Statistiques</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
