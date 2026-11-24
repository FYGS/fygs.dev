"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FaqEntry } from "@/lib/curriculum/content";

interface Props {
  entries: FaqEntry[];
  onChange: (entries: FaqEntry[]) => void;
}

const MAX_ENTRIES = 20;

/**
 * Questions and answers shown on the course page. An entry with an empty question or answer is kept while it is
 * being typed and dropped by the server when saved, so nothing half-written ever reaches learners.
 */
export function FaqEditor({ entries, onChange }: Props) {
  const update = (index: number, patch: Partial<FaqEntry>) =>
    onChange(entries.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune question pour l&apos;instant. Anticipez les doutes avant l&apos;inscription : prérequis, durée, accès, certificat.
        </p>
      )}
      {entries.map((entry, index) => (
        <fieldset key={index} className="space-y-3 rounded-lg border bg-card p-4">
          <legend className="px-1 text-sm font-medium">Question {index + 1}</legend>
          <div className="space-y-1.5">
            <Label htmlFor={`faq-q-${index}`}>Question</Label>
            <Input id={`faq-q-${index}`} value={entry.q} maxLength={200} onChange={(e) => update(index, { q: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`faq-a-${index}`}>Réponse</Label>
            <Textarea id={`faq-a-${index}`} value={entry.a} maxLength={2000} rows={3} onChange={(e) => update(index, { a: e.target.value })} />
          </div>
          <div className="flex justify-end gap-1">
            <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Monter la question ${index + 1}`}>
              <ArrowUp className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={index === entries.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre la question ${index + 1}`}>
              <ArrowDown className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(entries.filter((_, i) => i !== index))}>
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
              Supprimer
            </Button>
          </div>
        </fieldset>
      ))}
      {entries.length < MAX_ENTRIES && (
        <Button type="button" variant="outline" onClick={() => onChange([...entries, { q: "", a: "" }])}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Ajouter une question
        </Button>
      )}
    </div>
  );
}
