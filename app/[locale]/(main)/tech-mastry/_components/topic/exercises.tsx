"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, CheckCircle2, Eye, Hammer, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import type { ClassifyExercise, FillExercise, MatchExercise, OrderExercise, TopicExercise } from "../../_catalog/exercises";
import { useProgress } from "../../_hooks/use-progress";
import {
  allRight,
  checkClassify,
  checkFill,
  checkMatch,
  checkOrder,
  mixedOrder,
  splitCode,
} from "../../_utils/exercise-logic";

const TYPE_LABEL: Record<TopicExercise["type"], string> = {
  order: "Remettre dans l'ordre",
  match: "Associer",
  fill: "Compléter le code",
  classify: "Classer",
};

function Verdict({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400">
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      Juste
    </span>
  ) : (
    <span className="flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
      <XCircle className="h-4 w-4" aria-hidden="true" />
      À revoir
    </span>
  );
}

interface Feedback {
  /** The checked answer, one flag per line; null while nothing was checked */
  results: boolean[] | null;
  explanation: string;
  onCheck: () => void;
  onReset: () => void;
  onReveal: () => void;
  canCheck: boolean;
  revealed: boolean;
}

function Actions({ results, explanation, onCheck, onReset, onReveal, canCheck, revealed }: Feedback) {
  const solved = results !== null && allRight(results);
  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onCheck} disabled={!canCheck || solved}>
          Vérifier
        </Button>
        {results && !solved && !revealed && (
          <Button variant="outline" onClick={onReveal}>
            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
            Voir la solution
          </Button>
        )}
        {results && (
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Recommencer
          </Button>
        )}
      </div>
      {results && (
        <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="font-semibold">
            {revealed ? "Voici la solution." : solved ? "Bravo, tout est juste." : `${results.filter(Boolean).length} élément(s) juste(s) sur ${results.length}.`}
          </p>
          <p className="leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}

function OrderView({ exercise, onSolved }: { exercise: OrderExercise; onSolved: () => void }) {
  const initial = () => mixedOrder(exercise.steps.length, exercise.id);
  const [arrangement, setArrangement] = useState<number[]>(initial);
  const [results, setResults] = useState<boolean[] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const move = (position: number, delta: -1 | 1) => {
    const target = position + delta;
    if (target < 0 || target >= arrangement.length) return;
    const next = [...arrangement];
    [next[position], next[target]] = [next[target], next[position]];
    setArrangement(next);
    setResults(null);
  };

  const shown = revealed ? exercise.steps.map((_, index) => index) : arrangement;

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {shown.map((step, position) => (
          <li key={step} className={cn("flex items-center gap-3 rounded-lg border p-3 text-sm", results && !revealed && (results[position] ? "border-green-600 bg-green-600/10" : "border-red-600 bg-red-600/10"))}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">{position + 1}</span>
            <span className="flex-1">{exercise.steps[step]}</span>
            {results && !revealed && <Verdict ok={results[position]} />}
            {!revealed && (
              <span className="flex shrink-0 gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={position === 0} onClick={() => move(position, -1)} aria-label={`Monter l'étape « ${exercise.steps[step]} »`}>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={position === shown.length - 1} onClick={() => move(position, 1)} aria-label={`Descendre l'étape « ${exercise.steps[step]} »`}>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </span>
            )}
          </li>
        ))}
      </ol>
      <Actions
        results={revealed ? checkOrder(exercise, exercise.steps.map((_, i) => i)) : results}
        explanation={exercise.explanation}
        canCheck={!revealed}
        revealed={revealed}
        onCheck={() => {
          const next = checkOrder(exercise, arrangement);
          setResults(next);
          if (allRight(next)) onSolved();
        }}
        onReveal={() => setRevealed(true)}
        onReset={() => {
          setArrangement(initial());
          setResults(null);
          setRevealed(false);
        }}
      />
    </div>
  );
}

function MatchView({ exercise, onSolved }: { exercise: MatchExercise; onSolved: () => void }) {
  const definitions = mixedOrder(exercise.pairs.length, exercise.id);
  const [choice, setChoice] = useState<Array<number | null>>(() => exercise.pairs.map(() => null));
  const [results, setResults] = useState<boolean[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const shownChoice = revealed ? exercise.pairs.map((_, i) => i) : choice;

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {exercise.pairs.map((pair, index) => (
          <li key={pair.term} className={cn("grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-center", results && !revealed && (results[index] ? "border-green-600 bg-green-600/10" : "border-red-600 bg-red-600/10"))}>
            <span className="font-medium">{pair.term}</span>
            <select
              value={shownChoice[index] ?? ""}
              disabled={revealed}
              aria-label={`Définition de « ${pair.term} »`}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              onChange={(event) => {
                const next = [...choice];
                next[index] = event.target.value === "" ? null : Number(event.target.value);
                setChoice(next);
                setResults(null);
              }}
            >
              <option value="">Choisir une définition…</option>
              {definitions.map((definitionIndex) => (
                <option key={definitionIndex} value={definitionIndex}>
                  {exercise.pairs[definitionIndex].definition}
                </option>
              ))}
            </select>
            {results && !revealed ? <Verdict ok={results[index]} /> : <span />}
          </li>
        ))}
      </ul>
      <Actions
        results={revealed ? exercise.pairs.map(() => true) : results}
        explanation={exercise.explanation}
        canCheck={!revealed && choice.every((value) => value !== null)}
        revealed={revealed}
        onCheck={() => {
          const next = checkMatch(exercise, choice);
          setResults(next);
          if (allRight(next)) onSolved();
        }}
        onReveal={() => setRevealed(true)}
        onReset={() => {
          setChoice(exercise.pairs.map(() => null));
          setResults(null);
          setRevealed(false);
        }}
      />
    </div>
  );
}

function FillView({ exercise, onSolved }: { exercise: FillExercise; onSolved: () => void }) {
  const [choice, setChoice] = useState<Array<number | null>>(() => exercise.blanks.map(() => null));
  const [results, setResults] = useState<boolean[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const shownChoice = revealed ? exercise.blanks.map((blank) => blank.answer) : choice;

  return (
    <div className="space-y-4">
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed" tabIndex={0}>
        <code>
          {splitCode(exercise.code).map((part, index) => {
            if ("text" in part) return <span key={index}>{part.text}</span>;
            const blank = exercise.blanks[part.blank - 1];
            const state = results && !revealed ? results[part.blank - 1] : undefined;
            return (
              <select
                key={index}
                value={shownChoice[part.blank - 1] ?? ""}
                disabled={revealed}
                aria-label={`Trou ${part.blank}`}
                className={cn(
                  "mx-0.5 h-8 rounded-md border bg-background px-1 font-mono text-sm",
                  state === true && "border-green-600",
                  state === false && "border-red-600",
                )}
                onChange={(event) => {
                  const next = [...choice];
                  next[part.blank - 1] = event.target.value === "" ? null : Number(event.target.value);
                  setChoice(next);
                  setResults(null);
                }}
              >
                <option value="">…</option>
                {blank.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={optionIndex}>
                    {option}
                  </option>
                ))}
              </select>
            );
          })}
        </code>
      </pre>
      {results && !revealed && (
        <ul className="flex flex-wrap gap-3 text-sm">
          {results.map((ok, index) => (
            <li key={index} className="flex items-center gap-1">
              Trou {index + 1} : <Verdict ok={ok} />
            </li>
          ))}
        </ul>
      )}
      <Actions
        results={revealed ? exercise.blanks.map(() => true) : results}
        explanation={exercise.explanation}
        canCheck={!revealed && choice.every((value) => value !== null)}
        revealed={revealed}
        onCheck={() => {
          const next = checkFill(exercise, choice);
          setResults(next);
          if (allRight(next)) onSolved();
        }}
        onReveal={() => setRevealed(true)}
        onReset={() => {
          setChoice(exercise.blanks.map(() => null));
          setResults(null);
          setRevealed(false);
        }}
      />
    </div>
  );
}

function ClassifyView({ exercise, onSolved }: { exercise: ClassifyExercise; onSolved: () => void }) {
  const order = mixedOrder(exercise.items.length, exercise.id);
  const [choice, setChoice] = useState<Array<number | null>>(() => exercise.items.map(() => null));
  const [results, setResults] = useState<boolean[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const shownChoice = revealed ? exercise.items.map((item) => item.category) : choice;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {order.map((itemIndex) => {
          const item = exercise.items[itemIndex];
          return (
            <fieldset
              key={itemIndex}
              disabled={revealed}
              className={cn("rounded-lg border p-3 text-sm", results && !revealed && (results[itemIndex] ? "border-green-600 bg-green-600/10" : "border-red-600 bg-red-600/10"))}
            >
              <legend className="px-1 font-medium">{item.text}</legend>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {exercise.categories.map((category, categoryIndex) => (
                  <label key={categoryIndex} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name={`${exercise.id}-${itemIndex}`}
                      checked={shownChoice[itemIndex] === categoryIndex}
                      onChange={() => {
                        const next = [...choice];
                        next[itemIndex] = categoryIndex;
                        setChoice(next);
                        setResults(null);
                      }}
                    />
                    {category}
                  </label>
                ))}
                {results && !revealed && <Verdict ok={results[itemIndex]} />}
              </div>
            </fieldset>
          );
        })}
      </div>
      <Actions
        results={revealed ? exercise.items.map(() => true) : results}
        explanation={exercise.explanation}
        canCheck={!revealed && choice.every((value) => value !== null)}
        revealed={revealed}
        onCheck={() => {
          const next = checkClassify(exercise, choice);
          setResults(next);
          if (allRight(next)) onSolved();
        }}
        onReveal={() => setRevealed(true)}
        onReset={() => {
          setChoice(exercise.items.map(() => null));
          setResults(null);
          setRevealed(false);
        }}
      />
    </div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: TopicExercise; index: number }) {
  const { progress, solveExercise } = useProgress();
  const solved = progress.exercisesSolved.includes(exercise.id);
  const onSolved = () => solveExercise(exercise.id);

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          Exercice {index + 1}
          <Badge variant="outline">{TYPE_LABEL[exercise.type]}</Badge>
        </h3>
        {solved && (
          <Badge className="gap-1 bg-green-700 text-white hover:bg-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Résolu
          </Badge>
        )}
      </div>
      <p className="text-sm leading-relaxed">{exercise.prompt}</p>
      {exercise.type === "order" && <OrderView exercise={exercise} onSolved={onSolved} />}
      {exercise.type === "match" && <MatchView exercise={exercise} onSolved={onSolved} />}
      {exercise.type === "fill" && <FillView exercise={exercise} onSolved={onSolved} />}
      {exercise.type === "classify" && <ClassifyView exercise={exercise} onSolved={onSolved} />}
    </Card>
  );
}

/** The hands-on exercises of a lesson: each one is checked on the spot, explained, and remembered once solved. */
export function Exercises({ exercises }: { exercises: TopicExercise[] }) {
  const { progress } = useProgress();
  const solved = exercises.filter((exercise) => progress.exercisesSolved.includes(exercise.id)).length;

  return (
    <section aria-labelledby="exercises-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Hammer className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 id="exercises-title" className="text-xl font-semibold">
              Pratiquer
            </h2>
            <p className="text-sm text-muted-foreground">{exercises.length} exercices courts, corrigés sur le champ</p>
          </div>
        </div>
        <Badge variant="secondary">
          {solved} / {exercises.length} résolus
        </Badge>
      </div>
      {exercises.map((exercise, index) => (
        <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
      ))}
    </section>
  );
}
