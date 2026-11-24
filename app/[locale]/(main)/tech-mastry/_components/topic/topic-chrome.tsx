"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, Lightbulb, Undo2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEVEL_LABEL, getArea, getTopic, lessonsOf, neighbours, relatedTo, type Topic } from "../../_catalog";
import { exercisesFor } from "../../_catalog/exercises";
import { questionsFor } from "../../_catalog/quizzes";
import { useProgress } from "../../_hooks/use-progress";
import { areaProgress, missingPrerequisites, topicStatus } from "../../_utils/catalog-progress";
import { Exercises } from "./exercises";
import { SelfCheck } from "./self-check";

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: ReturnType<typeof topicStatus> }) {
  if (status === "done") {
    return (
      <Badge className="gap-1 bg-green-700 text-white hover:bg-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Terminé
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Circle className="h-3.5 w-3.5" aria-hidden="true" />
      {status === "started" ? "En cours" : "Pas encore commencé"}
    </Badge>
  );
}

/** What a learner needs before reading: where this is, how long it takes, what to know first, how far along they are. */
export function TopicHeader() {
  const pathname = usePathname();
  const topic = getTopic(pathname ?? "");
  const area = getArea(pathname ?? "");
  const { progress } = useProgress();
  if (!topic || !area) return null;

  if (topic.kind === "hub") {
    const stats = areaProgress(progress, area);
    return (
      <aside aria-label="Votre progression dans ce domaine" className="mb-6 space-y-2 rounded-lg border bg-card/50 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">
            {stats.done} sujet{stats.done > 1 ? "s" : ""} terminé{stats.done > 1 ? "s" : ""} sur {stats.total}
          </span>
          <span className="text-muted-foreground">
            {stats.minutesLeft > 0 ? `Environ ${stats.minutesLeft} min restantes` : "Domaine terminé"}
            {stats.selfCheckAverage !== null && ` · moyenne des auto-évaluations : ${stats.selfCheckAverage} %`}
          </span>
        </div>
        <ProgressBar percent={stats.percent} label={`${area.title} : ${stats.percent} % terminé`} />
      </aside>
    );
  }

  const missing = missingPrerequisites(progress, topic.route);
  const needed = (topic.prerequisites ?? []).map((route) => getTopic(route)).filter((other): other is Topic => Boolean(other));

  return (
    <aside aria-label="À propos de ce sujet" className="mb-6 space-y-3 rounded-lg border bg-card/50 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {area.route ? (
          <Link href={area.route} className="font-medium text-primary hover:underline">
            {area.title}
          </Link>
        ) : (
          <span className="font-medium">{area.title}</span>
        )}
        <Badge variant="secondary">{LEVEL_LABEL[topic.level]}</Badge>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Environ {topic.minutes} min
        </span>
        <StatusBadge status={topicStatus(progress, topic.route)} />
      </div>

      {needed.length > 0 && (
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">{missing.length > 0 ? "À voir d'abord :" : "Prérequis vus :"}</span>
          {needed.map((other) => {
            const done = progress.completedTopics.includes(other.route);
            return (
              <Link
                key={other.route}
                href={other.route}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs hover:bg-muted",
                  done ? "border-green-700 text-green-800 dark:text-green-400" : "border-amber-700 text-amber-800 dark:text-amber-300",
                )}
              >
                {done ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
                {other.title}
                <span className="sr-only">{done ? " (terminé)" : " (pas encore terminé)"}</span>
              </Link>
            );
          })}
        </p>
      )}
    </aside>
  );
}

function TopicLink({ topic, direction }: { topic: Topic; direction: "previous" | "next" }) {
  const previous = direction === "previous";
  return (
    <Link
      href={topic.route}
      rel={previous ? "prev" : "next"}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50",
        previous ? "items-start text-left" : "items-end text-right sm:col-start-2",
      )}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {previous && <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />}
        {previous ? "Sujet précédent" : "Sujet suivant"}
        {!previous && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      <span className="font-medium group-hover:text-primary">{topic.title}</span>
    </Link>
  );
}

/** Below the page: what to remember, a self-check, "mark as done", the next topic, related topics, the area's progress. */
export function TopicFooter() {
  const pathname = usePathname();
  const topic = getTopic(pathname ?? "");
  const area = getArea(pathname ?? "");
  const { progress, completeTopic, reopenTopic } = useProgress();
  if (!topic || !area || topic.kind === "hub") return null;

  const questions = questionsFor(topic.route);
  const exercises = exercisesFor(topic.route);
  const { previous, next } = neighbours(topic.route);
  const related = relatedTo(topic.route, 3);
  const done = progress.completedTopics.includes(topic.route);
  const stats = areaProgress(progress, area);
  const position = lessonsOf(area).findIndex((lesson) => lesson.route === topic.route) + 1;

  return (
    <section aria-label="Pour aller plus loin" className="mt-14 space-y-10 border-t pt-10">
      {(topic.takeaways?.length ?? 0) > 0 && (
        <Card className="space-y-3 p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />À retenir
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {topic.takeaways!.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Card>
      )}

      {exercises.length > 0 && <Exercises exercises={exercises} />}

      {questions.length > 0 && <SelfCheck key={topic.route} route={topic.route} questions={questions} completed={done} />}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <p className="font-medium">{done ? "Vous avez terminé ce sujet." : "Vous avez fait le tour de ce sujet ?"}</p>
          <p className="text-sm text-muted-foreground">
            Sujet {position} sur {stats.total} dans « {area.title} » · {stats.done} terminé{stats.done > 1 ? "s" : ""}
          </p>
        </div>
        {done ? (
          <Button variant="outline" onClick={() => reopenTopic(topic.route)}>
            <Undo2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Reprendre
          </Button>
        ) : (
          <Button onClick={() => completeTopic(topic.route)}>
            <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Marquer comme terminé
          </Button>
        )}
      </div>
      <ProgressBar percent={stats.percent} label={`${area.title} : ${stats.percent} % terminé`} />

      <nav aria-label="Sujets voisins" className="grid gap-4 sm:grid-cols-2">
        {previous ? <TopicLink topic={previous} direction="previous" /> : <span className="hidden sm:block" />}
        {next && <TopicLink topic={next} direction="next" />}
      </nav>

      {related.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">À explorer ensuite</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {related.map((other) => (
              <li key={other.route}>
                <Link href={other.route} className="flex h-full flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:border-primary hover:bg-muted/50">
                  <span className="font-medium">{other.title}</span>
                  <span className="line-clamp-2 text-muted-foreground">{other.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
