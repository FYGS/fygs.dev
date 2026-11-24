"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { AREAS, PATH } from "../_catalog";
import { useProgress } from "../_hooks/use-progress";
import { areaProgress, nextToLearn, pathProgress } from "../_utils/catalog-progress";

/** The learner's place on the path: what to do next, how far along they are, and every area with its own progress. */
export function LearningHome() {
  const { progress } = useProgress();
  const total = pathProgress(progress);
  const next = nextToLearn(progress);
  const started = progress.completedTopics.length > 0 || progress.visitedPages.length > 0;
  const nextArea = next ? AREAS.find((area) => area.topics.includes(next)) : undefined;

  return (
    <section aria-labelledby="learning-home-title" className="space-y-8">
      <div className="flex flex-col gap-4 rounded-xl border bg-card/60 p-6 sm:flex-row sm:items-center">
        <Compass className="h-8 w-8 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <h2 id="learning-home-title" className="text-xl font-semibold">
            {started ? "Votre parcours" : "Par où commencer ?"}
          </h2>
          {next ? (
            <p className="text-muted-foreground">
              {started ? "Prochain sujet conseillé" : "Premier sujet conseillé"} : <span className="font-medium text-foreground">{next.title}</span>
              {nextArea && ` (${nextArea.title}, environ ${next.minutes} min)`}
            </p>
          ) : (
            <p className="text-muted-foreground">Vous avez terminé tous les sujets. Revoyez ceux que vous voulez consolider.</p>
          )}
          <p className="text-sm text-muted-foreground">
            {total.done} sujet{total.done > 1 ? "s" : ""} terminé{total.done > 1 ? "s" : ""} sur {PATH.length}
            {total.selfCheckAverage !== null && ` · moyenne des auto-évaluations : ${total.selfCheckAverage} %`}
          </p>
        </div>
        {next && (
          <Button asChild>
            <Link href={next.route}>
              {started ? "Continuer" : "Commencer"}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.filter((area) => area.id !== "tools").map((area) => {
          const stats = areaProgress(progress, area);
          const first = area.topics.find((topic) => topic.kind !== "hub");
          return (
            <li key={area.id}>
              <Card className="h-full space-y-3 p-4 transition-colors hover:border-primary">
                <Link href={area.route ?? first?.route ?? "/tech-mastry"} className="block space-y-1">
                  <span className="font-semibold">{area.title}</span>
                  <span className="block text-sm text-muted-foreground">{area.description}</span>
                </Link>
                <div
                  role="progressbar"
                  aria-label={`${area.title} : ${stats.percent} % terminé`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stats.percent}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${stats.percent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.done} / {stats.total} sujets · environ {stats.minutesLeft} min restantes
                </p>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
