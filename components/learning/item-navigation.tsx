"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, GraduationCap, HelpCircle, PlayCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { itemHref, neighbours, type OutlineItem } from "@/lib/learning/outline";
import { cn } from "@/lib/utils";
import { useLearning } from "./learning-context";

const NEXT_LABEL = { lesson: "Leçon suivante", quiz: "Quiz du module", exam: "Examen final" } as const;
const PREVIOUS_LABEL = { lesson: "Leçon précédente", quiz: "Quiz précédent", exam: "Examen final" } as const;

function KindIcon({ kind }: { kind: OutlineItem["kind"] }) {
  const className = "h-3.5 w-3.5";
  if (kind === "quiz") return <HelpCircle className={className} aria-hidden />;
  if (kind === "exam") return <GraduationCap className={className} aria-hidden />;
  return <PlayCircle className={className} aria-hidden />;
}

/**
 * Where to go from an item: the item before and after in course order. After the last item the way
 * on is the completion screen. `emphasizeNext` makes "next" the main button (the item is done).
 */
export function ItemNavigation({ currentId, emphasizeNext = false }: { currentId: string; emphasizeNext?: boolean }) {
  const { outline, courseSlug, openableIds, mode } = useLearning();
  const { previous, next } = neighbours(outline, currentId);

  const nextOpenable = next ? openableIds.has(next.id) : true;
  const nextHref = !next
    ? mode === "full"
      ? `/learn/${courseSlug}/completed`
      : `/formations/${courseSlug}`
    : nextOpenable
      ? itemHref(courseSlug, next)
      : `/formations/${courseSlug}`;
  const nextLabel = !next
    ? mode === "full"
      ? "Terminer la formation"
      : "Retour à la formation"
    : nextOpenable
      ? NEXT_LABEL[next.kind]
      : "S’inscrire pour continuer";

  return (
    <nav aria-label="Navigation dans la formation" className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
      {previous ? (
        <Button variant="outline" asChild className="h-auto justify-start px-4 py-3">
          <Link href={openableIds.has(previous.id) ? itemHref(courseSlug, previous) : `/formations/${courseSlug}`}>
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 text-left">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <KindIcon kind={previous.kind} />
                {PREVIOUS_LABEL[previous.kind]}
              </span>
              <span className="block truncate text-sm font-medium">{previous.title}</span>
            </span>
          </Link>
        </Button>
      ) : (
        <span />
      )}

      <Button
        variant={emphasizeNext || !next ? "default" : "outline"}
        asChild
        className={cn("h-auto px-4 py-3", !emphasizeNext && next && "justify-end")}
      >
        <Link href={nextHref} prefetch>
          <span className="min-w-0 text-right">
            <span className={cn("flex items-center justify-end gap-1 text-xs", emphasizeNext || !next ? "" : "text-muted-foreground")}>
              {next ? <KindIcon kind={next.kind} /> : <Trophy className="h-3.5 w-3.5" aria-hidden />}
              {nextLabel}
            </span>
            {next && nextOpenable && <span className="block truncate text-sm font-medium">{next.title}</span>}
          </span>
          <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
