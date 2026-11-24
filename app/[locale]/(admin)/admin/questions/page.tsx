import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listLessonQuestions, type QuestionFilter } from "@/lib/curriculum/lesson-questions";
import { cn } from "@/lib/utils";
import { firstParam, type SearchParams } from "../_lib/search-params";
import { QuestionCard } from "./_components/question-card";

export const metadata: Metadata = {
  title: "Questions des apprenants | Admin FYGS",
  description: "Les questions posées depuis les leçons, à traiter",
};

const FILTERS: { value: QuestionFilter; label: string }[] = [
  { value: "todo", label: "Sans réponse" },
  { value: "answered", label: "Répondues" },
  { value: "solved", label: "Résolues" },
  { value: "all", label: "Toutes" },
];

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login?callbackUrl=/admin/questions");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") redirect("/unauthorized");
  const user = { id: session.user.id, role } as const;

  const raw = await searchParams;
  const filter = (FILTERS.find((f) => f.value === firstParam(raw.filter))?.value ?? "todo") as QuestionFilter;
  const courseId = firstParam(raw.course);
  const page = Number(firstParam(raw.page)) || 1;

  const [courses, result] = await Promise.all([
    db.course.findMany({
      where: role === "ADMIN" ? { discussions: { some: { lessonId: { not: null } } } } : { instructorId: user.id },
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    listLessonQuestions(user, { filter, courseId, page }),
  ]);

  const href = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const next = { filter, course: courseId, page: 1, ...patch };
    if (next.filter && next.filter !== "todo") params.set("filter", String(next.filter));
    if (next.course) params.set("course", String(next.course));
    if (next.page && Number(next.page) > 1) params.set("page", String(next.page));
    const query = params.toString();
    return `/admin/questions${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Questions des apprenants</h1>
        <p className="text-muted-foreground">
          Les questions posées depuis les leçons {role === "ADMIN" ? "de toutes les formations" : "de vos formations"}. Votre réponse est signalée comme celle de
          l&apos;équipe et l&apos;apprenant en est averti.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filtrer les questions" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={href({ filter: f.value })}
              aria-current={f.value === filter ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                f.value === filter ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {f.label}
              {f.value === "todo" && result.todo > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{result.todo}</span>}
            </Link>
          ))}
        </nav>

        {courses.length > 1 && (
          <form method="get" action="/admin/questions" className="flex items-center gap-2">
            {filter !== "todo" && <input type="hidden" name="filter" value={filter} />}
            <label htmlFor="question-course" className="text-sm text-muted-foreground">
              Formation
            </label>
            <select id="question-course" name="course" defaultValue={courseId ?? ""} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              <option value="">Toutes</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button type="submit" className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
              Filtrer
            </button>
          </form>
        )}
      </div>

      {result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">{filter === "todo" ? "Aucune question en attente" : "Aucune question ici"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "todo" ? "Toutes les questions ont reçu une réponse de l'équipe." : "Les questions posées depuis les leçons apparaîtront ici."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {result.rows.map((question) => (
            <li key={question.id}>
              <QuestionCard question={question} />
            </li>
          ))}
        </ul>
      )}

      {result.pages > 1 && (
        <nav aria-label="Pages des questions" className="flex items-center justify-between text-sm">
          {result.page > 1 ? (
            <Link href={href({ page: result.page - 1 })} className="rounded-md border px-3 py-1.5 hover:bg-muted">
              Précédentes
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {result.page} sur {result.pages}
          </span>
          {result.page < result.pages ? (
            <Link href={href({ page: result.page + 1 })} className="rounded-md border px-3 py-1.5 hover:bg-muted">
              Suivantes
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
