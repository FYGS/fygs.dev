"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { askLessonQuestion } from "@/app/actions/lesson-questions";

export interface LessonQuestion {
  id: string;
  title: string;
  authorName: string;
  replyCount: number;
  isSolved: boolean;
  createdAt: string;
}

interface LessonQuestionsProps {
  lessonId: string;
  questions: LessonQuestion[];
  /** Only the course's learners can ask (a preview visitor reads). */
  canAsk: boolean;
}

/** Questions asked from this lesson: community discussions tied to it, answered by the instructor and other learners. */
export function LessonQuestions({ lessonId, questions: initial, canAsk }: LessonQuestionsProps) {
  const [questions, setQuestions] = useState(initial);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await askLessonQuestion({ lessonId, title, content });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setQuestions((prev) => [
        { id: result.discussion.id, title: result.discussion.title, authorName: "Vous", replyCount: 0, isSolved: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setTitle("");
      setContent("");
      setOpen(false);
      toast.success("Question publiée");
    });
  };

  return (
    <section aria-label="Questions sur la leçon" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Questions sur cette leçon ({questions.length})</h3>
        {canAsk && !open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <MessageCircle className="mr-1 h-4 w-4" aria-hidden /> Poser une question
          </Button>
        )}
      </div>

      {!canAsk && (
        <p className="text-sm text-muted-foreground">Inscrivez-vous à la formation pour poser une question à la communauté.</p>
      )}

      {open && (
        <form onSubmit={submit} className="space-y-3 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1.5">
            <Label htmlFor="question-title">Votre question en une phrase</Label>
            <Input id="question-title" value={title} onChange={(e) => setTitle(e.target.value)} minLength={5} maxLength={200} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="question-content">Détails (ce que vous avez essayé, le message d’erreur…)</Label>
            <Textarea id="question-content" value={content} onChange={(e) => setContent(e.target.value)} minLength={20} maxLength={10000} required className="min-h-24" />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              Publier
            </Button>
          </div>
        </form>
      )}

      {questions.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {questions.map((q) => (
            <li key={q.id}>
              <Link href={`/community/discussions/${q.id}`} className="flex items-start justify-between gap-3 p-3 hover:bg-accent/40">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{q.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {q.authorName} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(q.createdAt))}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {q.isSolved && (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Résolue
                    </span>
                  )}
                  {q.replyCount} réponse{q.replyCount > 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        !open && <p className="py-4 text-center text-sm text-muted-foreground">Aucune question pour cette leçon pour le moment.</p>
      )}
    </section>
  );
}
