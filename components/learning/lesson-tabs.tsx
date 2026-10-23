"use client";

import { Download, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonNotes, type LessonNote } from "./lesson-notes";
import { LessonQuestions, type LessonQuestion } from "./lesson-questions";

export interface LessonResourceItem {
  id: string;
  title: string;
  url: string;
  kind: "FILE" | "LINK";
  sizeBytes: number | null;
}

interface LessonTabsProps {
  lessonId: string;
  hasVideo: boolean;
  notes: LessonNote[];
  resources: LessonResourceItem[];
  questions: LessonQuestion[];
  canAsk: boolean;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Notes, resources and questions of the lesson, under the content. */
export function LessonTabs({ lessonId, hasVideo, notes, resources, questions, canAsk }: LessonTabsProps) {
  return (
    <Tabs defaultValue={resources.length > 0 ? "resources" : "notes"} className="rounded-lg border bg-card p-4">
      <TabsList>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="resources">Ressources ({resources.length})</TabsTrigger>
        <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="pt-3">
        <LessonNotes lessonId={lessonId} initialNotes={notes} hasVideo={hasVideo} />
      </TabsContent>

      <TabsContent value="resources" className="pt-3">
        {resources.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Aucune ressource pour cette leçon.</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  {...(r.kind === "FILE" ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                  className="flex items-center gap-3 p-3 text-sm hover:bg-accent/40"
                >
                  {r.kind === "FILE" ? (
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium">{r.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {r.kind === "FILE" ? formatSize(r.sizeBytes) || "Fichier" : "Lien externe"}
                  </span>
                  {r.kind === "LINK" && <span className="sr-only">(s’ouvre dans un nouvel onglet)</span>}
                </a>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="questions" className="pt-3">
        <LessonQuestions lessonId={lessonId} questions={questions} canAsk={canAsk} />
      </TabsContent>
    </Tabs>
  );
}
