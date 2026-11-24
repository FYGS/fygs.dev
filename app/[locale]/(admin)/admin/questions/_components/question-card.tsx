"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ANSWER_MAX_LENGTH, ANSWER_MIN_LENGTH, type LessonQuestion } from "@/lib/curriculum/lesson-questions-shared";
import { answerQuestion, markQuestionSolved } from "../_actions/question-actions";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });

/** One question, its thread, and the answer box. */
export function QuestionCard({ question }: { question: LessonQuestion }) {
  const router = useRouter();
  const answerId = useId();
  const solvedId = useId();
  const [answer, setAnswer] = useState("");
  const [solve, setSolve] = useState(true);
  const [pending, startTransition] = useTransition();
  const tooShort = answer.trim().length < ANSWER_MIN_LENGTH;

  const send = () =>
    startTransition(async () => {
      const result = await answerQuestion(question.id, answer, solve);
      if (!result.success) return void toast.error(result.error);
      toast.success("Réponse envoyée. L'apprenant est averti.");
      setAnswer("");
      router.refresh();
    });

  const toggleSolved = () =>
    startTransition(async () => {
      const result = await markQuestionSolved(question.id, !question.isSolved);
      if (!result.success) return void toast.error(result.error);
      router.refresh();
    });

  return (
    <article className="space-y-4 rounded-lg border bg-card p-4" aria-labelledby={`${answerId}-title`}>
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={`${answerId}-title`} className="min-w-0 flex-1 font-semibold">
            {question.title}
          </h2>
          {question.isSolved ? (
            <Badge>Résolue</Badge>
          ) : question.answeredByTeam ? (
            <Badge variant="secondary">Répondue</Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/50 text-amber-900 dark:text-amber-200">
              Sans réponse
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {question.authorName} · {dateFormat.format(new Date(question.createdAt))} · {question.course.title} ›{" "}
          <Link
            href={`/learn/${question.course.slug}/lessons/${question.lesson.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            {question.lesson.title}
            <ExternalLink className="h-3 w-3" aria-hidden />
            <span className="sr-only">(ouvre la leçon dans un nouvel onglet)</span>
          </Link>
        </p>
      </header>

      <p className="whitespace-pre-line text-sm">{question.content}</p>

      {question.replies.length > 0 && (
        <ol className="space-y-3 border-l-2 pl-4" aria-label="Réponses">
          {question.replies.map((reply) => (
            <li key={reply.id} className="space-y-1">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{reply.authorName}</span>
                {reply.fromTeam && (
                  <Badge variant="secondary" className="ml-2 align-middle">
                    Équipe
                  </Badge>
                )}{" "}
                · {dateFormat.format(new Date(reply.createdAt))}
              </div>
              <p className="whitespace-pre-line text-sm">{reply.content}</p>
            </li>
          ))}
        </ol>
      )}

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!tooShort) send();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor={answerId}>Votre réponse</Label>
          <Textarea id={answerId} rows={3} maxLength={ANSWER_MAX_LENGTH} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id={solvedId} checked={solve} onCheckedChange={(checked) => setSolve(checked === true)} />
            <Label htmlFor={solvedId} className="text-sm font-normal">
              Marquer la question comme résolue
            </Label>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={toggleSolved} disabled={pending}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden />
              {question.isSolved ? "Rouvrir" : "Résolue sans répondre"}
            </Button>
            <Button type="submit" size="sm" disabled={pending || tooShort}>
              {pending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />}
              Répondre
            </Button>
          </div>
        </div>
      </form>
    </article>
  );
}
