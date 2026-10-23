import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Award, BookOpen, Clock, Crown, Play } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { formatMinutes } from "@/lib/learning/curriculum-view";
import { getUserCoursesProgress } from "@/lib/progress-summary";

export const metadata: Metadata = {
  title: "Mes formations | FYGS",
  description: "Reprenez vos formations là où vous les avez laissées.",
};

const CATEGORY_LABELS: Record<string, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Fullstack",
  CLOUD: "Cloud",
  AI: "IA",
  DEVOPS: "DevOps",
  PRODUCTIVITY: "Productivité",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

const FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "in-progress", label: "En cours" },
  { value: "completed", label: "Terminées" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

interface MyCoursesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function MyCoursesPage({ searchParams }: MyCoursesPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=/dashboard/my-courses");

  const { status } = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.value === status) ? (status as Filter) : "all";

  const [courses, purchases] = await Promise.all([
    getUserCoursesProgress(session.user.id),
    db.payment.findMany({
      where: { userId: session.user.id, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED },
      select: { courseId: true },
    }),
  ]);
  const lifetime = new Set(purchases.flatMap((p) => (p.courseId ? [p.courseId] : [])));

  const completed = courses.filter((c) => c.isComplete);
  const visible = courses.filter((c) => (filter === "completed" ? c.isComplete : filter === "in-progress" ? !c.isComplete : true));
  const count = (value: Filter) => (value === "all" ? courses.length : value === "completed" ? completed.length : courses.length - completed.length);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Mes formations</h1>
        <p className="text-muted-foreground">Reprenez là où vous vous êtes arrêté. Les formations récemment suivies sont en premier.</p>
      </header>

      <nav aria-label="Filtrer les formations" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f.value} asChild size="sm" variant={filter === f.value ? "default" : "outline"}>
            <Link href={f.value === "all" ? "/dashboard/my-courses" : `/dashboard/my-courses?status=${f.value}`} aria-current={filter === f.value ? "page" : undefined}>
              {f.label} ({count(f.value)})
            </Link>
          </Button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <Card className="border-2 border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-xl font-bold">{courses.length === 0 ? "Aucune formation" : "Rien dans cette liste"}</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {courses.length === 0
              ? "Vous n’êtes inscrit à aucune formation pour le moment. Explorez le catalogue pour commencer."
              : filter === "completed"
                ? "Vous n’avez pas encore terminé de formation."
                : "Toutes vos formations sont terminées."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/formations">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden /> Découvrir les formations
            </Link>
          </Button>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <li key={course.courseId}>
              <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-40 bg-muted">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground" aria-hidden />
                    </div>
                  )}
                  {lifetime.has(course.courseId) && (
                    <Badge className="absolute right-3 top-3 gap-1">
                      <Crown className="h-3 w-3" aria-hidden /> À vie
                    </Badge>
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col gap-4 p-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{CATEGORY_LABELS[course.category] ?? course.category}</Badge>
                      <Badge variant="secondary">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
                    </div>
                    <h2 className="text-lg font-bold leading-snug">
                      <Link href={`/formations/${course.slug}`} className="hover:underline">
                        {course.title}
                      </Link>
                    </h2>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {course.done}/{course.total} étapes
                      </span>
                      <span className="font-medium">{course.percent}%</span>
                    </div>
                    <Progress value={course.percent} aria-label={`Progression de ${course.title}`} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {course.totalDurationSec > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden /> {formatMinutes(Math.max(1, Math.round(course.totalDurationSec / 60)))}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span>Dernière activité : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(course.lastActivityAt)}</span>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Button asChild className="flex-1" variant={course.isComplete ? "outline" : "default"}>
                      <Link href={course.continueHref}>
                        <Play className="mr-2 h-4 w-4" aria-hidden />
                        {course.isComplete ? "Revoir" : course.done === 0 ? "Commencer" : "Continuer"}
                      </Link>
                    </Button>
                    {course.hasCertificate && (
                      <Button asChild variant="outline" size="icon">
                        <Link href={`/certificates/${course.courseId}`} aria-label={`Certificat de ${course.title}`}>
                          <Award className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
