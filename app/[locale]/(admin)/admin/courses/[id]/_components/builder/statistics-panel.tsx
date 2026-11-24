"use client";

import { useEffect, useState } from "react";
import { FileQuestion, GraduationCap, PlayCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseStatistics, StepStatistic } from "@/lib/curriculum/insights";
import { loadCourseStatistics } from "../../_actions/insights-actions";

const KIND = {
  lesson: { label: "Leçon", icon: PlayCircle },
  quiz: { label: "Quiz", icon: FileQuestion },
  exam: { label: "Examen final", icon: GraduationCap },
} as const;

const percent = (value: number | null) => (value === null ? "—" : `${value} %`);

/** How the course is followed: who is in it, who is active, who finishes, and where learners stop. */
export function StatisticsPanel({ courseId }: { courseId: string }) {
  const [statistics, setStatistics] = useState<CourseStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadCourseStatistics(courseId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setStatistics(result.statistics);
        setError(null);
      } else setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [courseId, reload]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Statistiques</h2>
          <p className="text-sm text-muted-foreground">La progression est celle que voient les apprenants : leçons terminées, quiz réussis (70 %), examen réussi.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setReload((n) => n + 1)}>
          <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
          Actualiser
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {!statistics && !error && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {statistics && (
        <>
          <section aria-labelledby="stats-overview" className="space-y-3">
            <h3 id="stats-overview" className="font-medium">
              Vue d&apos;ensemble
            </h3>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["Inscrits", statistics.enrollments],
                  ["Actifs (7 jours)", statistics.activeLast7Days],
                  ["Actifs (30 jours)", statistics.activeLast30Days],
                  ["Progression moyenne", `${statistics.averageProgress} %`],
                  ["Ont terminé", `${statistics.completed} (${statistics.completionRate} %)`],
                  ["Certificats délivrés", statistics.certificates],
                  ["Score moyen aux quiz", percent(statistics.averageQuizScore)],
                  ["Score moyen à l'examen", percent(statistics.averageExamScore)],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">Les scores moyens prennent le meilleur résultat de chaque apprenant.</p>
          </section>

          <section aria-labelledby="stats-steps" className="space-y-3">
            <div>
              <h3 id="stats-steps" className="font-medium">
                Parcours des apprenants, étape par étape
              </h3>
              <p className="text-sm text-muted-foreground">
                Part des inscrits qui ont terminé chaque étape, dans l&apos;ordre de la formation. Une forte baisse signale l&apos;étape où l&apos;on
                décroche.
              </p>
            </div>
            {statistics.steps.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Aucune étape publiée pour l&apos;instant.</p>
            ) : statistics.enrollments === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Personne n&apos;est encore inscrit : les étapes se rempliront avec les premiers apprenants.</p>
            ) : (
              <ol className="space-y-2">
                {statistics.steps.map((step, index) => (
                  <StepRow key={step.id} step={step} index={index} previous={statistics.steps[index - 1]} />
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StepRow({ step, index, previous }: { step: StepStatistic; index: number; previous?: StepStatistic }) {
  const { label, icon: Icon } = KIND[step.kind];
  const drop = previous ? previous.rate - step.rate : 0;
  return (
    <li className="rounded-md border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="w-6 shrink-0 text-right text-muted-foreground">{index + 1}.</span>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">{label} :</span>
        <span className="min-w-0 flex-1 truncate font-medium">{step.title}</span>
        {step.moduleTitle && <span className="hidden truncate text-xs text-muted-foreground sm:inline">{step.moduleTitle}</span>}
        <span className="shrink-0 tabular-nums">
          {step.rate} % <span className="text-muted-foreground">({step.done})</span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-8">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full rounded-full bg-primary" style={{ width: `${step.rate}%` }} />
        </div>
        {drop >= 15 && <span className="shrink-0 text-xs font-medium text-amber-800 dark:text-amber-300">−{drop} pts</span>}
      </div>
    </li>
  );
}
