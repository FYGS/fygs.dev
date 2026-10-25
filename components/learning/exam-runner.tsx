"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, GraduationCap, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startFinalExam, submitFinalExam, type StartExamResult, type SubmitExamResult } from "@/app/actions/exam-actions";
import { EXAM_RETAKE_COOLDOWN_MINUTES } from "@/lib/learning/exam";
import { cn } from "@/lib/utils";
import { ItemNavigation } from "./item-navigation";
import { useLearning } from "./learning-context";

type Started = Extract<StartExamResult, { success: true }>;
type Graded = Extract<SubmitExamResult, { success: true }>;

interface ExamRunnerProps {
  courseId: string;
  exam: { id: string; title: string; description: string | null; passingScore: number; timeLimit: number | null; questionCount: number };
  last: { percentage: number; passed: boolean } | null;
  /** Why a sitting cannot start now (already passed, waiting period), or null. */
  blockedMessage: string | null;
}

function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(h > 0 ? 2 : 1, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ExamRunner({ courseId, exam, last, blockedMessage }: ExamRunnerProps) {
  const { courseSlug, mode } = useLearning();
  const [session, setSession] = useState<Started | null>(null);
  // The questions of the last sitting, kept for the correction once the session is over
  const [paper, setPaper] = useState<Started["exam"]["questions"]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<Graded | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const submitted = useRef(false);

  const remaining = session?.exam.timeLimit ? session.exam.timeLimit * 60 - (now - session.startedAt) / 1000 : null;

  const submit = useCallback(
    async (auto = false) => {
      if (!session || submitted.current) return;
      submitted.current = true;
      setSubmitting(true);
      try {
        const response = await submitFinalExam({ examId: session.exam.id, token: session.token, answers });
        if (!response.success) {
          submitted.current = false;
          toast.error(response.error);
          return;
        }
        if (auto) toast.info("Temps écoulé : vos réponses ont été envoyées.");
        setPaper(session.exam.questions);
        setResult(response);
        setSession(null);
      } catch {
        submitted.current = false;
        toast.error("L’examen n’a pas pu être envoyé. Réessayez.");
      } finally {
        setSubmitting(false);
      }
    },
    [session, answers],
  );

  // Leaving or reloading the page during a sitting would lose the answers: the browser asks first
  useEffect(() => {
    if (!session) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [session]);

  // Clock and automatic submission at the end of the time limit
  useEffect(() => {
    if (!session?.exam.timeLimit) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!session?.exam.timeLimit) return;
    const end = session.startedAt + session.exam.timeLimit * 60_000;
    const timer = setTimeout(() => void submit(true), Math.max(0, end - Date.now()));
    return () => clearTimeout(timer);
  }, [session, submit]);

  const begin = async () => {
    setStarting(true);
    try {
      const response = await startFinalExam({ courseId });
      if (!response.success) {
        toast.error(response.error);
        return;
      }
      submitted.current = false;
      setAnswers(response.exam.questions.map(() => null));
      setNow(Date.now());
      setSession(response);
      setResult(null);
    } catch {
      toast.error("L’examen n’a pas pu démarrer. Réessayez.");
    } finally {
      setStarting(false);
    }
  };

  // --- Result
  if (result) {
    return (
      <section className="space-y-6" aria-labelledby="exam-result">
        <div className="space-y-3 rounded-lg border p-6 text-center">
          <GraduationCap className={cn("mx-auto h-10 w-10", result.passed ? "text-amber-500" : "text-muted-foreground")} aria-hidden />
          <h2 id="exam-result" className="text-2xl font-bold">
            {result.passed ? "Examen réussi !" : "Examen non réussi"}
          </h2>
          <p className="text-4xl font-bold">{result.percentage} %</p>
          <p className="text-muted-foreground">
            {result.score} / {result.total} bonnes réponses · seuil {result.passingScore} %
          </p>
          {!result.passed && mode === "full" && (
            <p className="text-sm text-muted-foreground">
              Relisez la correction ci-dessous. Vous pourrez repasser l’examen dans {EXAM_RETAKE_COOLDOWN_MINUTES} min.
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

        <section aria-labelledby="exam-review" className="space-y-3">
          <h3 id="exam-review" className="text-lg font-semibold">
            Correction
          </h3>
          <ol className="space-y-3">
            {result.review.map((r, i) => {
              const q = paper[r.index];
              const chosen = r.selected === null ? null : q?.options[r.selected];
              return (
                <li key={r.index} className={cn("space-y-2 rounded-lg border p-4 text-sm", r.isCorrect ? "border-emerald-600/40" : "border-red-600/40")}>
                  <p className="flex items-start gap-2 font-medium">
                    {r.isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400" aria-hidden />
                    )}
                    <span>
                      <span className="sr-only">{r.isCorrect ? "Bonne réponse. " : "Mauvaise réponse. "}</span>
                      {i + 1}. {q?.question ?? `Question ${i + 1}`}
                    </span>
                  </p>
                  <p className={r.isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}>
                    {chosen === null || chosen === undefined ? "Pas de réponse." : `Votre réponse : ${chosen}`}
                  </p>
                  {!r.isCorrect && q && <p>Bonne réponse : {q.options[r.correctOption]}</p>}
                  {r.explanation && <p className="text-muted-foreground">{r.explanation}</p>}
                </li>
              );
            })}
          </ol>
        </section>

        <ItemNavigation currentId={exam.id} emphasizeNext={result.passed} />
      </section>
    );
  }

  // --- Taking the exam
  if (session) {
    const answered = answers.filter((a) => a !== null).length;
    const low = remaining !== null && remaining < 60;
    return (
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-md md:border">
          <span className="text-sm">
            {answered} / {session.exam.questions.length} réponses
          </span>
          {remaining !== null && (
            <span
              role="timer"
              aria-label={`Temps restant : ${clock(remaining)}`}
              className={cn("flex items-center gap-1 text-sm font-semibold tabular-nums", low && "text-red-700 dark:text-red-400")}
            >
              <Clock className="h-4 w-4" aria-hidden /> {clock(remaining)}
            </span>
          )}
        </div>
        {remaining !== null && (
          <p aria-live="polite" className="sr-only">
            {Math.floor(remaining) === 300 ? "Il reste 5 minutes." : Math.floor(remaining) === 60 ? "Il reste une minute." : ""}
          </p>
        )}

        {session.exam.questions.map((q, qi) => (
          <fieldset key={qi} className="space-y-3 rounded-lg border p-4">
            <legend className="px-1 font-medium">
              {qi + 1}. {q.question}
            </legend>
            {q.options.map((option, oi) => (
              <label
                key={oi}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm hover:bg-accent/40",
                  answers[qi] === oi && "border-primary bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                  className="mt-1 accent-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {answered < session.exam.questions.length ? (
            <p className="text-sm text-muted-foreground">Les questions sans réponse comptent comme fausses.</p>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Envoyer l’examen
          </Button>
        </div>
      </form>
    );
  }

  // --- Before starting
  return (
    <section className="space-y-4 rounded-lg border p-6" aria-labelledby="exam-intro">
      <h2 id="exam-intro" className="text-lg font-semibold">
        Avant de commencer
      </h2>
      {exam.description && <p className="text-muted-foreground">{exam.description}</p>}
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          {exam.questionCount} question{exam.questionCount > 1 ? "s" : ""}, une seule bonne réponse chacune.
        </li>
        <li>Seuil de réussite : {exam.passingScore} %.</li>
        <li>{exam.timeLimit ? `Durée : ${exam.timeLimit} minutes. L’examen est envoyé automatiquement à la fin du temps.` : "Pas de limite de temps."}</li>
        <li>La correction s’affiche après l’envoi. En cas d’échec, vous pourrez repasser l’examen après {EXAM_RETAKE_COOLDOWN_MINUTES} minutes.</li>
      </ul>
      {last && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant={last.passed ? "default" : "secondary"}>{last.passed ? "Réussi" : "Non réussi"}</Badge>
          Dernier résultat : <strong>{last.percentage} %</strong>
        </div>
      )}
      {blockedMessage ? (
        <p role="status" className="rounded-md bg-muted p-3 text-sm">
          {blockedMessage}
        </p>
      ) : (
        <Button onClick={() => void begin()} disabled={starting}>
          {starting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />} Commencer l’examen
        </Button>
      )}
      <div className="border-t pt-4">
        <ItemNavigation currentId={exam.id} emphasizeNext={!!last?.passed} />
      </div>
    </section>
  );
}
