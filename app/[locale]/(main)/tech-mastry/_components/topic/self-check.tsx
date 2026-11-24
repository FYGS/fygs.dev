"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Brain, CheckCircle2, RotateCcw, Target, Trophy, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TopicQuestion } from "../../_catalog/quizzes";
import { useProgress } from "../../_hooks/use-progress";
import { selfCheckId } from "../../_utils/catalog-progress";

const DIFFICULTY_LABEL = { easy: "Facile", medium: "Moyen", hard: "Difficile" } as const;
const LETTERS = ["A", "B", "C", "D"];

/** Fisher-Yates on the option order of one question; `correctIndex` follows the option it designates. */
function shuffled(question: TopicQuestion): TopicQuestion {
  const order = question.options.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...question, options: order.map((index) => question.options[index]), correctIndex: order.indexOf(question.correctIndex) };
}

function verdict(percent: number): string {
  if (percent === 100) return "Sans faute. Le sujet est solide.";
  if (percent >= 80) return "Très bien : l'essentiel est acquis, relisez les points manqués.";
  if (percent >= 60) return "Correct, mais il reste des zones floues : reprenez les explications ci-dessous.";
  return "Ce n'est pas encore acquis. Relisez le sujet, puis refaites les questions manquées.";
}

/**
 * Self-check of a topic: questions one by one, an explanation after each answer, a score at the end, a retry of the
 * missed questions. The score of a full pass is saved (best one kept) and shown on the dashboard.
 */
export function SelfCheck({ route, questions, completed }: { route: string; questions: TopicQuestion[]; completed: boolean }) {
  const { progress, trackQuizScore, completeTopic } = useProgress();
  const best = progress.quizScores[selfCheckId(route)];

  // The first pass keeps the authored order (the server and the browser must render the same page);
  // retries mix the options so that the position of the answer cannot be learned.
  const [round, setRound] = useState<TopicQuestion[]>(questions);
  const [fullPass, setFullPass] = useState(true);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [missed, setMissed] = useState<TopicQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const question = round[index];
  const answered = picked !== null;

  // after an answer the explanation appears: keyboard users land on "Suivant"
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  function start(next: TopicQuestion[], isFullPass: boolean, mix: boolean) {
    setRound(mix ? next.map(shuffled) : next);
    setFullPass(isFullPass);
    setIndex(0);
    setPicked(null);
    setMissed([]);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }

  function answer(option: number) {
    if (answered) return;
    setPicked(option);
    if (option === question.correctIndex) setScore((value) => value + 1);
    else setMissed((list) => [...list, question]);
  }

  function next() {
    if (index + 1 < round.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    if (fullPass) trackQuizScore(selfCheckId(route), score, round.length);
    headingRef.current?.focus();
  }

  const percent = round.length === 0 ? 0 : Math.round((score / round.length) * 100);

  return (
    <Card className="p-6 space-y-5" aria-labelledby="self-check-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 id="self-check-title" ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-hidden">
              Vérifiez vos connaissances
            </h2>
            <p className="text-sm text-muted-foreground">
              {questions.length} questions, avec explication après chaque réponse
            </p>
          </div>
        </div>
        {best && (
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            Meilleur score : {best.score}/{best.total}
          </Badge>
        )}
      </div>

      {!started && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => start(questions, true, Boolean(best))}>
            <Target className="mr-2 h-4 w-4" aria-hidden="true" />
            {best ? "Refaire le questionnaire" : "Commencer"}
          </Button>
          <p className="text-sm text-muted-foreground">Environ {Math.max(2, Math.round(questions.length * 0.7))} minutes.</p>
        </div>
      )}

      {started && !finished && question && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground" aria-live="polite">
            <span>
              Question {index + 1} sur {round.length}
              {!fullPass && " (questions manquées)"}
            </span>
            <Badge variant="outline">{DIFFICULTY_LABEL[question.difficulty]}</Badge>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(index / round.length) * 100}%` }} />
          </div>

          <p className="whitespace-pre-line text-base font-medium leading-relaxed" id={`self-check-question-${index}`}>
            {question.question}
          </p>

          <ul className="space-y-2" aria-labelledby={`self-check-question-${index}`}>
            {question.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === question.correctIndex;
              const isPicked = optionIndex === picked;
              return (
                <li key={optionIndex}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => answer(optionIndex)}
                    aria-pressed={isPicked}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                      !answered && "hover:border-primary hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      answered && isCorrect && "border-green-600 bg-green-600/10",
                      answered && isPicked && !isCorrect && "border-red-600 bg-red-600/10",
                      answered && !isCorrect && !isPicked && "opacity-70",
                    )}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                      {LETTERS[optionIndex]}
                    </span>
                    <span className="flex-1">{option}</span>
                    {answered && isCorrect && (
                      <span className="flex shrink-0 items-center gap-1 font-medium text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Bonne réponse
                      </span>
                    )}
                    {answered && isPicked && !isCorrect && (
                      <span className="flex shrink-0 items-center gap-1 font-medium text-red-700 dark:text-red-400">
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Votre réponse
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div aria-live="polite">
            {answered && (
              <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
                <p className="font-semibold">{picked === question.correctIndex ? "Exact." : "Pas tout à fait."}</p>
                <p className="leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>

          {answered && (
            <Button ref={nextRef} onClick={next}>
              {index + 1 < round.length ? "Question suivante" : "Voir le résultat"}
            </Button>
          )}
        </div>
      )}

      {started && finished && (
        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-2xl font-bold">
              {score} / {round.length}
              <span className="ml-2 text-base font-medium text-muted-foreground">({percent} %)</span>
            </p>
            <p className="mt-1 text-sm">{verdict(percent)}</p>
            {!fullPass && <p className="mt-1 text-xs text-muted-foreground">Cette série de rattrapage ne remplace pas votre meilleur score.</p>}
          </div>

          {missed.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">À revoir ({missed.length})</h3>
              <ul className="space-y-3">
                {missed.map((item) => (
                  <li key={item.id} className="rounded-lg border p-3 text-sm">
                    <p className="whitespace-pre-line font-medium">{item.question}</p>
                    <p className="mt-2">
                      <span className="font-semibold">Réponse : </span>
                      {item.options[item.correctIndex]}
                    </p>
                    <p className="mt-1 text-muted-foreground">{item.explanation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {missed.length > 0 && (
              <Button onClick={() => start(missed, false, true)}>
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Refaire les questions manquées
              </Button>
            )}
            <Button variant="outline" onClick={() => start(questions, true, true)}>
              Tout refaire
            </Button>
            {!completed && fullPass && percent >= 60 && (
              <Button variant="secondary" onClick={() => completeTopic(route)}>
                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Marquer le sujet comme terminé
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
