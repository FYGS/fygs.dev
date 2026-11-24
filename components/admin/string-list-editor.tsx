"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
  max?: number;
  maxLength?: number;
  /** Shown when the list is empty. */
  emptyHint?: string;
}

/** An ordered list of short texts: type and press Enter to add, arrows to reorder, cross to remove. */
export function StringListEditor({ items, onChange, label, placeholder, max = 12, maxLength = 200, emptyHint }: Props) {
  const [draft, setDraft] = useState("");
  const id = useId();

  const add = () => {
    const text = draft.trim();
    if (!text || items.length >= max) return;
    if (items.some((i) => i.toLowerCase() === text.toLowerCase())) return setDraft("");
    onChange([...items, text]);
    setDraft("");
  };
  const move = (index: number, delta: -1 | 1) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyHint && <p className="text-sm text-muted-foreground">{emptyHint}</p>}
      {items.length > 0 && (
        <ul className="space-y-2" aria-label={label}>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
              <span className="min-w-0 flex-1 text-sm">{item}</span>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Monter : ${item}`}>
                <ArrowUp className="h-4 w-4" aria-hidden />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Descendre : ${item}`}>
                <ArrowDown className="h-4 w-4" aria-hidden />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Retirer : ${item}`}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {items.length < max ? (
        <div className="flex gap-2">
          <Input
            id={id}
            value={draft}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-label={`Ajouter : ${label}`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={add} disabled={!draft.trim()}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Ajouter
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Maximum atteint ({max}).</p>
      )}
    </div>
  );
}
