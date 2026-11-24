"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideDeck {
  id: string;
  title: string;
  moduleTitle: string;
  /** Slide bodies, rendered on the server through the lesson renderer (sanitised, like lesson texts). */
  slides: { title: string; body: ReactNode }[];
}

/** The visual supports of a course: pick a deck, move through its slides. */
export function SlidesViewer({ decks }: { decks: SlideDeck[] }) {
  const [deckIndex, setDeckIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const deck = decks[deckIndex];
  const slide = deck.slides[slideIndex];

  const go = (delta: number) => setSlideIndex((i) => Math.min(deck.slides.length - 1, Math.max(0, i + delta)));

  return (
    <div className="space-y-6">
      {decks.length > 1 && (
        <nav aria-label="Supports visuels" className="flex flex-wrap gap-2">
          {decks.map((d, i) => (
            <Button
              key={d.id}
              variant={i === deckIndex ? "default" : "outline"}
              size="sm"
              aria-current={i === deckIndex ? "true" : undefined}
              onClick={() => {
                setDeckIndex(i);
                setSlideIndex(0);
              }}
            >
              <span className="text-xs">{d.moduleTitle} · </span>
              {d.title}
            </Button>
          ))}
        </nav>
      )}

      <section
        aria-label={`${deck.title}, diapositive ${slideIndex + 1} sur ${deck.slides.length}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          else if (e.key === "ArrowLeft") go(-1);
        }}
        className="space-y-4 rounded-lg border bg-card p-5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{deck.moduleTitle}</span>
          <span>
            {slideIndex + 1} / {deck.slides.length}
          </span>
        </div>
        <h2 className="text-xl font-semibold">{slide.title}</h2>
        <div className="prose prose-sm max-w-none dark:prose-invert">{slide.body}</div>
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={slideIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Précédente
          </Button>
          <Button variant="outline" size="sm" onClick={() => go(1)} disabled={slideIndex === deck.slides.length - 1}>
            Suivante <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </section>

      <ol className="flex flex-wrap gap-2" aria-label="Aller à une diapositive">
        {deck.slides.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setSlideIndex(i)}
              aria-current={i === slideIndex ? "true" : undefined}
              className={cn(
                "max-w-48 truncate rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-accent/60",
                i === slideIndex && "border-primary bg-primary/10 font-medium",
              )}
            >
              {i + 1}. {s.title}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
