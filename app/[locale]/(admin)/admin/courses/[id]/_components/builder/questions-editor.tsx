"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_OPTIONS, MIN_OPTIONS, validateQuestions, type QuestionInput } from "@/lib/curriculum/questions";
import { cn } from "@/lib/utils";

/** A question being edited. `key` identifies it in the list; `id` is set once it exists on the server. */
export interface QuestionDraft {
  key: string;
  id?: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

let counter = 0;
const newKey = () => `q${Date.now().toString(36)}${counter++}`;

export function emptyQuestion(): QuestionDraft {
  return { key: newKey(), question: "", options: ["", ""], correct: 0, explanation: "" };
}

export function toDrafts(questions: { id?: string; question: string; options: string[]; correct: number; explanation?: string | null }[]): QuestionDraft[] {
  return questions.map((q) => ({ key: newKey(), id: q.id, question: q.question, options: [...q.options], correct: q.correct, explanation: q.explanation ?? "" }));
}

export function toInputs(drafts: QuestionDraft[]): QuestionInput[] {
  return drafts.map((d) => ({ id: d.id, question: d.question, options: d.options, correct: d.correct, explanation: d.explanation }));
}

/** The first problem with the questions, in words, or null when they can be saved. */
export function questionsProblem(drafts: QuestionDraft[]): string | null {
  const checked = validateQuestions(toInputs(drafts));
  return checked.ok ? null : checked.error;
}

interface Props {
  questions: QuestionDraft[];
  onChange: (questions: QuestionDraft[]) => void;
}

export function QuestionsEditor({ questions, onChange }: Props) {
  const update = (index: number, patch: Partial<QuestionDraft>) => onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 && <p className="text-sm text-muted-foreground">Aucune question. Ajoutez-en une pour commencer.</p>}
      {questions.map((q, index) => (
        <fieldset key={q.key} className="space-y-3 rounded-lg border bg-card p-4">
          <legend className="px-1 text-sm font-medium">Question {index + 1}</legend>

          <div className="space-y-1.5">
            <Label htmlFor={`${q.key}-text`}>Énoncé</Label>
            <Textarea id={`${q.key}-text`} rows={2} value={q.question} maxLength={2000} onChange={(e) => update(index, { question: e.target.value })} />
          </div>

          <div className="space-y-2" role="radiogroup" aria-label={`Réponses de la question ${index + 1}`}>
            <p className="text-sm font-medium">Réponses — cochez la bonne</p>
            {q.options.map((option, o) => (
              <div key={o} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${q.key}-correct`}
                  checked={q.correct === o}
                  onChange={() => update(index, { correct: o })}
                  aria-label={`Bonne réponse : réponse ${o + 1}`}
                  className="h-4 w-4 accent-primary"
                />
                <Input
                  value={option}
                  maxLength={500}
                  aria-label={`Réponse ${o + 1} de la question ${index + 1}`}
                  onChange={(e) => update(index, { options: q.options.map((v, i) => (i === o ? e.target.value : v)) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={q.options.length <= MIN_OPTIONS}
                  aria-label={`Retirer la réponse ${o + 1}`}
                  onClick={() =>
                    update(index, {
                      options: q.options.filter((_, i) => i !== o),
                      correct: q.correct === o ? 0 : q.correct > o ? q.correct - 1 : q.correct,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
            {q.options.length < MAX_OPTIONS && (
              <Button type="button" variant="ghost" size="sm" onClick={() => update(index, { options: [...q.options, ""] })}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Ajouter une réponse
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${q.key}-explanation`}>Explication (affichée après la réponse)</Label>
            <Textarea id={`${q.key}-explanation`} rows={2} value={q.explanation} maxLength={2000} onChange={(e) => update(index, { explanation: e.target.value })} />
          </div>

          <div className="flex justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Monter la question ${index + 1}`}>
              <ArrowUp className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={index === questions.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre la question ${index + 1}`}>
              <ArrowDown className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(questions.filter((_, i) => i !== index))}>
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
              Supprimer
            </Button>
          </div>
        </fieldset>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...questions, emptyQuestion()])}>
        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
        Ajouter une question
      </Button>
    </div>
  );
}

/** The quiz as a learner takes it: pick an answer, see right or wrong and the explanation. Nothing is recorded. */
export function QuizPreview({ questions }: { questions: QuestionDraft[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  if (questions.length === 0) return <p className="text-sm text-muted-foreground">Ajoutez des questions pour les voir ici.</p>;
  return (
    <ol className="space-y-5">
      {questions.map((q, index) => {
        const chosen = answers[q.key];
        const answered = chosen !== undefined;
        return (
          <li key={q.key} className="space-y-2">
            <p className="font-medium">
              {index + 1}. {q.question || <span className="text-muted-foreground">(énoncé vide)</span>}
            </p>
            <div className="space-y-1.5" role="group" aria-label={`Réponses de la question ${index + 1}`}>
              {q.options.map((option, o) => {
                const isCorrect = o === q.correct;
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={answered}
                    onClick={() => setAnswers((a) => ({ ...a, [q.key]: o }))}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      !answered && "hover:bg-muted",
                      answered && isCorrect && "border-emerald-500 bg-emerald-500/10",
                      answered && chosen === o && !isCorrect && "border-destructive bg-destructive/10",
                    )}
                  >
                    <span className="flex-1">{option || <span className="text-muted-foreground">(réponse vide)</span>}</span>
                    {answered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Bonne réponse" />}
                    {answered && chosen === o && !isCorrect && <XCircle className="h-4 w-4 text-destructive" aria-label="Mauvaise réponse" />}
                  </button>
                );
              })}
            </div>
            {answered && q.explanation && <p className="rounded-md bg-muted/50 p-3 text-sm">{q.explanation}</p>}
          </li>
        );
      })}
    </ol>
  );
}
