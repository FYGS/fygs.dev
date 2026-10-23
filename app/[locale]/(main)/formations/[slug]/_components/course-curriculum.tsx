"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Clock, Eye, FileText, GraduationCap, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatMinutes, type CurriculumSectionView, type CurriculumStats } from "@/lib/learning/curriculum-view";

interface CourseCurriculumProps {
  sections: CurriculumSectionView[];
  stats: CurriculumStats;
  /** Downloadable files and links attached to the published lessons. */
  resourceCount: number;
  /** Index of the section to open first (the one holding the next step). */
  initiallyOpen: number;
}

const KIND_LABEL = { lesson: "Leçon", quiz: "Quiz", exam: "Examen final" } as const;

function ItemIcon({ kind, done }: { kind: "lesson" | "quiz" | "exam"; done: boolean }) {
  if (done) return <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />;
  if (kind === "quiz") return <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
  if (kind === "exam") return <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

export function CourseCurriculum({ sections, stats, resourceCount, initiallyOpen }: CourseCurriculumProps) {
  const [closed, setClosed] = useState<Record<number, boolean>>({});
  const isOpen = (index: number) => {
    const explicit = closed[index];
    return explicit === undefined ? index === initiallyOpen : !explicit;
  };

  const summary = [
    stats.modules > 0 && `${stats.modules} module${stats.modules > 1 ? "s" : ""}`,
    `${stats.lessons} leçon${stats.lessons > 1 ? "s" : ""}`,
    stats.quizzes > 0 && `${stats.quizzes} quiz`,
    stats.hasExam && "examen final",
    resourceCount > 0 && `${resourceCount} ressource${resourceCount > 1 ? "s" : ""}`,
    stats.minutes > 0 && formatMinutes(stats.minutes),
  ].filter(Boolean);

  return (
    <Card id="programme">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Programme de la formation</CardTitle>
        {sections.length > 0 && <p className="text-sm text-muted-foreground">{summary.join(" · ")}</p>}
      </CardHeader>
      <CardContent className="p-0">
        {sections.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Le contenu de cette formation sera bientôt disponible.</p>
        ) : (
          sections.map((section, index) => {
            const done = section.items.filter((i) => i.done).length;
            const list = (
              <ul className="space-y-1 bg-muted/30 p-3">
                {section.items.map((item) => {
                  const row = (
                    <div className="flex items-center gap-3 rounded-md border bg-card p-3 text-sm">
                      <ItemIcon kind={item.kind} done={item.done} />
                      <span className="min-w-0 flex-1">
                        <span className="sr-only">{KIND_LABEL[item.kind]} : </span>
                        <span className="font-medium">{item.title}</span>
                        {item.done && <span className="sr-only"> (terminé)</span>}
                      </span>
                      {item.isPreview && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Eye className="h-3 w-3" aria-hidden /> Aperçu
                        </Badge>
                      )}
                      {item.isNext && <Badge className="text-xs">Suivant</Badge>}
                      {item.questionCount !== null && (
                        <span className="shrink-0 text-xs text-muted-foreground">{item.questionCount} questions</span>
                      )}
                      {item.duration ? (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" aria-hidden /> {formatMinutes(Math.max(1, Math.round(item.duration / 60)))}
                        </span>
                      ) : null}
                    </div>
                  );
                  return (
                    <li key={item.id}>
                      {item.href ? (
                        <Link href={item.href} className="block rounded-md transition-colors hover:bg-accent/50">
                          {row}
                        </Link>
                      ) : (
                        row
                      )}
                    </li>
                  );
                })}
              </ul>
            );

            if (!section.title) return <div key={section.id}>{list}</div>;
            return (
              <Collapsible
                key={section.id}
                open={isOpen(index)}
                onOpenChange={(open) => setClosed((prev) => ({ ...prev, [index]: !open }))}
                className="border-b last:border-b-0"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/50">
                  <span className="flex min-w-0 items-center gap-2">
                    {isOpen(index) ? (
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    ) : (
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span className="truncate font-semibold">{section.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {done > 0 ? `${done}/${section.items.length}` : `${section.items.length} élément${section.items.length > 1 ? "s" : ""}`}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>{list}</CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
