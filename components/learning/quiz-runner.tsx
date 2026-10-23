"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, RotateCcw, Trophy, XCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { checkQuizAnswer, submitQuizAnswers, type QuizFeedback, type SubmitQuizAnswersResult } from "@/app/actions/quiz-actions";
import { QUIZ_COOLDOWN_MINUTES } from "@/lib/quiz-attempt-policy";
import { PASSING_SCORE } from "@/lib/learning/outline";
import { cn } from "@/lib/utils";
import { ItemNavigation } from "./item-navigation";
import { useLearning } from "./learning-context";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface QuizRunnerProps {
  quiz: { id: string; title: string; questions: QuizQuestion[] };
  courseId: string;
  /** Best result so far, shown before starting. */
  best: { percentage: number; score: number; total: number } | null;
  /** Set when a new sitting cannot start yet (cooldown or daily limit): said before the learner answers. */
  blockedMessage: string | null;
}

type Answered = { selected: number; feedback: QuizFeedback };
type SuccessResult = Extract<SubmitQuizAnswersResult, { success: true }>;

export function QuizRunner({ quiz, courseId, best, blockedMessage }: QuizRunnerProps) {
  const { courseSlug, mode } = useLearning();
  const total = quiz.questions.length;

  const [started, setStarted] = useState(best === null && blockedMessage === null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answered>>({});
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SuccessResult | null>(null);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const feedbackRef = useRef<HTMLDivElement>(null);

  const question = quiz.questions[index];
  const answered = question ? answers[question.id] : undefined;
  const score = useMemo(() => Object.values(answers).filter((a) => a.feedback.isCorrect).length, [answers]);

  // The retake button waits for the cooldown announced by the server
  useEffect(() => {
    if (retryAt === null || now >= retryAt) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(retryAt - now, 30_000) + 50);
    return () => clearTimeout(timer);
  }, [retryAt, now]);

  useEffect(() => {
    if (answered) feedbackRef.current?.focus();
  }, [answered]);

  const choose = async (option: number) => {
    if (!question || answered || checking) return;
    setChecking(true);
    try {
      const response = await checkQuizAnswer({ quizId: quiz.id, questionId: question.id, selectedOption: option });
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      setAnswers((prev) => ({ ...prev, [question.id]: { selected: option, feedback: response } }));
    } catch {
      toast.error("La réponse n’a pas pu être vérifiée. Réessayez.");
    } finally {
      setChecking(false);
    }
  };

  const finish = async () => {
    setSubmitting(true);
    try {
      const response = await submitQuizAnswers({
        quizId: quiz.id,
        courseId,
        answers: quiz.questions.map((q) => ({ questionId: q.id, selectedOption: answers[q.id].selected })),
      });
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      setResult(response);
      const done = Date.now();
      setNow(done);
      setRetryAt(mode === "full" ? done + QUIZ_COOLDOWN_MINUTES * 60_000 : done);
      if (response.reward) toast.success(`+${response.reward.xp} XP`, { description: "Quiz réussi" });
    } catch {
      toast.error("Le résultat n’a pas pu être enregistré. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setRetryAt(null);
    setStarted(true);
  };

  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="font-medium">Ce quiz n’a pas encore de questions.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href={`/learn/${courseSlug}`}>Revenir à la formation</Link>
        </Button>
      </div>
    );
  }

  // --- Before starting: previous result, or why a new sitting must wait
  if (!started) {
    return (
      <section className="space-y-4 rounded-lg border p-6" aria-labelledby="quiz-intro">
        <h2 id="quiz-intro" className="text-lg font-semibold">
          {best ? "Votre résultat" : quiz.title}
        </h2>
        {best && (
          <p className="flex flex-wrap items-center gap-2">
            <Badge variant={best.percentage >= PASSING_SCORE ? "default" : "secondary"}>
              {best.percentage >= PASSING_SCORE ? "Réussi" : "Non réussi"}
            </Badge>
            <span>
              Meilleur score : <strong>{best.percentage}%</strong> ({best.score} / {best.total})
            </span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {total} question{total > 1 ? "s" : ""}. Seuil de réussite : {PASSING_SCORE}%. La correction s’affiche après chaque réponse, qui est définitive.
        </p>
        {blockedMessage ? (
          <p role="status" className="rounded-md bg-muted p-3 text-sm">
            {blockedMessage}
          </p>
        ) : (
          <Button onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> {best ? "Refaire le quiz" : "Commencer"}
          </Button>
        )}
        {best && best.percentage >= PASSING_SCORE && (
          <div className="border-t pt-4">
            <ItemNavigation currentId={quiz.id} emphasizeNext />
          </div>
        )}
      </section>
    );
  }

  // --- Results
  if (result) {
    const canRetake = retryAt !== null && now >= retryAt;
    return (
      <section className="space-y-6" aria-labelledby="quiz-result">
        <div className="space-y-3 rounded-lg border p-6 text-center">
          <Trophy className={cn("mx-auto h-10 w-10", result.passed ? "text-amber-500" : "text-muted-foreground")} aria-hidden />
          <h2 id="quiz-result" className="text-2xl font-bold">
            {result.passed ? "Quiz réussi !" : "Quiz non réussi"}
          </h2>
          <p className="text-4xl font-bold">{result.percentage}%</p>
          <p className="text-muted-foreground">
            {result.score} / {result.total} bonnes réponses
            {result.bestPercentage > result.percentage && ` · meilleur score conservé : ${result.bestPercentage}%`}
          </p>
          {!result.passed && (
            <p className="text-sm text-muted-foreground">Il faut {PASSING_SCORE}% pour valider ce quiz. Relisez la correction, puis réessayez.</p>
          )}
          {result.reward && (
            <p className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400">
              <Zap className="h-4 w-4" aria-hidden /> +{result.reward.xp} XP
            </p>
          )}
          {mode === "full" && result.course.justIssued && (
            <p className="rounded-md bg-primary/10 p-3 text-sm">
              Formation terminée ! Votre certificat est prêt.{" "}
              <Link href={`/learn/${courseSlug}/completed`} className="font-medium underline">
                Le voir
              </Link>
            </p>
          )}
          {mode === "staff" && <p className="text-sm text-muted-foreground">Aperçu auteur : ce résultat n’est pas enregistré.</p>}
        </div>

        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium">Revoir la correction</summary>
          <ol className="mt-3 space-y-4">
            {quiz.questions.map((q, i) => {
              const a = answers[q.id];
              return (
                <li key={q.id} className="space-y-1 text-sm">
                  <p className="font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <p className={a.feedback.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
                    Votre réponse : {q.options[a.selected]}
                  </p>
                  {!a.feedback.isCorrect && <p>Bonne réponse : {q.options[a.feedback.correctOption]}</p>}
                  {a.feedback.explanation && <p className="text-muted-foreground">{a.feedback.explanation}</p>}
                </li>
              );
            })}
          </ol>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {mode === "full" && !canRetake && retryAt !== null && (
              <span role="status">Vous pourrez refaire ce quiz dans {QUIZ_COOLDOWN_MINUTES} min.</span>
            )}
          </div>
          <Button variant="outline" onClick={restart} disabled={mode === "full" && !canRetake}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Refaire le quiz
          </Button>
        </div>
        <ItemNavigation currentId={quiz.id} emphasizeNext={result.passed} />
      </section>
    );
  }

  // --- A question
  const isLast = index === total - 1;
  return (
    <section className="space-y-5" aria-labelledby="quiz-question">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} sur {total}
          </span>
          <span>
            {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
          </span>
        </div>
        <Progress value={((index + (answered ? 1 : 0)) / total) * 100} aria-label="Avancement dans le quiz" className="h-2" />
      </div>

      <h2 id="quiz-question" className="text-xl font-semibold leading-snug">
        {question.question}
      </h2>

      <ul className="space-y-2" aria-label="Choix de réponse">
        {question.options.map((option, i) => {
          const isSelected = answered?.selected === i;
          const isRight = answered && answered.feedback.correctOption === i;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => void choose(i)}
                disabled={!!answered || checking}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors",
                  !answered && "hover:border-primary hover:bg-accent/50",
                  isRight && "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-50",
                  isSelected && !isRight && "border-red-600 bg-red-50 text-red-950 dark:border-red-500 dark:bg-red-950/40 dark:text-red-50",
                  answered && !isRight && !isSelected && "opacity-60",
                )}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold" aria-hidden>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {isRight && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-label="Bonne réponse" />}
                {isSelected && !isRight && <XCircle className="h-5 w-5 shrink-0 text-red-700 dark:text-red-400" aria-label="Votre réponse, incorrecte" />}
              </button>
            </li>
          );
        })}
      </ul>

      <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {checking && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Vérification…
          </p>
        )}
        {answered && (
          <div
            className={cn(
              "rounded-lg border p-4",
              answered.feedback.isCorrect
                ? "border-emerald-600/40 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50"
                : "border-red-600/40 bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-50",
            )}
          >
            <p className="font-semibold">{answered.feedback.isCorrect ? "Bonne réponse" : "Mauvaise réponse"}</p>
            {answered.feedback.explanation && <p className="mt-1 text-sm">{answered.feedback.explanation}</p>}
          </div>
        )}
      </div>

      {answered && (
        <div className="flex justify-end">
          {isLast ? (
            <Button onClick={() => void finish()} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Terminer le quiz
            </Button>
          ) : (
            <Button onClick={() => setIndex((i) => i + 1)}>Question suivante</Button>
          )}
        </div>
      )}
    </section>
  );
}
