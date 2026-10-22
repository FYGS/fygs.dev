"use client";

import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import type { Challenge, Hint } from "./types";

interface HintsSectionProps {
  selectedChallenge: Challenge;
  revealedHints: string[];
  revealHint: (hint: Hint) => void;
}

export function HintsSection({
  selectedChallenge,
  revealedHints,
  revealHint,
}: HintsSectionProps) {
  return (
    <div>
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Indices
      </h3>
      <div className="space-y-3">
        {selectedChallenge.hints.map(
          (hint: Hint, index: number) => (
            <div
              key={hint.id}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="mt-0.5">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {revealedHints.includes(hint.id)
                    ? hint.content
                    : `Cliquez pour révéler l'indice ${index + 1} (-${
                                        hint.revealCost
                                      } pts)`}
                </p>
                {!revealedHints.includes(hint.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 px-2 text-xs"
                    onClick={() => revealHint(hint)}
                  >
                    Révéler l&apos;indice
                  </Button>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
