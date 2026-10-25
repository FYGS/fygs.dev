import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Award, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MyCourseCard } from "@/components/dashboard/my-course-card";
import { MyPaths } from "@/components/paths/my-paths";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { certificatePdfPath, listUserCertificates } from "@/lib/learning/certificates";
import { getUserCoursesProgress } from "@/lib/progress-summary";

export const metadata: Metadata = {
  title: "Mon apprentissage | FYGS",
  description: "Vos formations en cours et terminées, vos parcours et vos certificats.",
  robots: { index: false },
};

const TABS = [
  { value: "en-cours", label: "En cours" },
  { value: "terminees", label: "Terminées" },
  { value: "parcours", label: "Parcours" },
  { value: "certificats", label: "Certificats" },
] as const;
type Tab = (typeof TABS)[number]["value"];

// Older links (?status=completed) still land on the right tab
const LEGACY_STATUS: Record<string, Tab> = { "in-progress": "en-cours", completed: "terminees", all: "en-cours" };

interface MyLearningPageProps {
  searchParams: Promise<{ tab?: string; status?: string }>;
}

const longDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

/**
 * « Mon apprentissage »: the one place where a learner finds their courses (in progress, finished), their paths and
 * their certificates (course and path).
 */
export default async function MyLearningPage({ searchParams }: MyLearningPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/auth/login?callbackUrl=${encodeURIComponent("/dashboard/my-courses")}`);
  const userId = session.user.id;

  const { tab: rawTab, status } = await searchParams;
  const tab: Tab = TABS.some((t) => t.value === rawTab) ? (rawTab as Tab) : (LEGACY_STATUS[status ?? ""] ?? "en-cours");

  const [courses, purchases, certificates, pathCount] = await Promise.all([
    getUserCoursesProgress(userId),
    db.payment.findMany({
      where: { userId, kind: PaymentKind.COURSE, status: PaymentStatus.COMPLETED },
      select: { courseId: true },
    }),
    listUserCertificates(userId),
    db.pathEnrollment.count({ where: { userId, path: { published: true } } }),
  ]);
  const lifetime = new Set(purchases.flatMap((p) => (p.courseId ? [p.courseId] : [])));
  const finished = (c: (typeof courses)[number]) => c.isComplete || c.hasCertificate;
  const inProgress = courses.filter((c) => !finished(c));
  const done = courses.filter(finished);
  const counts: Record<Tab, number> = {
    "en-cours": inProgress.length,
    terminees: done.length,
    parcours: pathCount,
    certificats: certificates.length,
  };
  const list = tab === "terminees" ? done : inProgress;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Mon apprentissage</h1>
        <p className="text-muted-foreground">Reprenez là où vous vous êtes arrêté : les formations suivies récemment sont en premier.</p>
      </header>

      <nav aria-label="Sections de mon apprentissage" className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map((t) => (
          <Button key={t.value} asChild size="sm" variant={tab === t.value ? "default" : "ghost"}>
            <Link href={`/dashboard/my-courses?tab=${t.value}`} aria-current={tab === t.value ? "page" : undefined}>
              {t.label} ({counts[t.value]})
            </Link>
          </Button>
        ))}
      </nav>

      {(tab === "en-cours" || tab === "terminees") &&
        (list.length === 0 ? (
          <EmptyState
            title={courses.length === 0 ? "Aucune formation pour l’instant" : tab === "terminees" ? "Pas encore de formation terminée" : "Rien en cours"}
            text={
              courses.length === 0
                ? "Inscrivez-vous à une formation du catalogue : elle apparaîtra ici avec votre progression."
                : tab === "terminees"
                  ? "Les formations que vous terminez s’affichent ici, avec leur certificat."
                  : "Toutes vos formations sont terminées. Envie d’en commencer une autre ?"
            }
          />
        ) : (
          <section aria-labelledby="my-courses-list">
            {/* the cards title their course with an h3: the list needs its h2 */}
            <h2 id="my-courses-list" className="sr-only">
              {tab === "terminees" ? "Formations terminées" : "Formations en cours"}
            </h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((course) => (
                <li key={course.courseId}>
                  <MyCourseCard course={course} lifetime={lifetime.has(course.courseId)} />
                </li>
              ))}
            </ul>
          </section>
        ))}

      {tab === "parcours" && <MyPaths userId={userId} />}

      {tab === "certificats" &&
        (certificates.length === 0 ? (
          <EmptyState
            title="Pas encore de certificat"
            text="Un certificat est délivré quand toutes les leçons, tous les quiz et l’examen final d’une formation (ou toutes les formations d’un parcours) sont terminés."
          />
        ) : (
          <ul className="divide-y rounded-lg border">
            {certificates.map((c) => (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.kind === "path" ? "Certificat de parcours" : "Certificat de formation"} · délivré le {longDate.format(c.issuedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={c.holderHref}>
                      Voir<span className="sr-only"> le certificat {c.title}</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <a href={certificatePdfPath(c.code)} download>
                      PDF<span className="sr-only"> du certificat {c.title}</span>
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="border-2 border-dashed p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{text}</p>
      <Button asChild className="mt-6">
        <Link href="/formations">Découvrir les formations</Link>
      </Button>
    </Card>
  );
}
