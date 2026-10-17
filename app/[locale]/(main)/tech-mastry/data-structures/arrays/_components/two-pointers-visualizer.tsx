"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight, RotateCcw, Play } from "lucide-react";
import { useState } from "react";

/* ─── Two Pointers Visualizer ─── */
export function TwoPointersVisualizer() {
  const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
  const [target, setTarget] = useState(10);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(sorted.length - 1);
  const [found, setFound] = useState<[number, number] | null>(null);
  const [step, setStep] = useState(0);

  const reset = () => {
    setLeft(0);
    setRight(sorted.length - 1);
    setFound(null);
    setStep(0);
  };

  const nextStep = () => {
    if (found || left >= right) return;
    const sum = sorted[left] + sorted[right];
    if (sum === target) {
      setFound([left, right]);
    } else if (sum < target) {
      setLeft(left + 1);
    } else {
      setRight(right - 1);
    }
    setStep(step + 1);
  };

  return (
    <Card className="p-6 space-y-5 border-green-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <ArrowRight className="w-5 h-5 text-green-500" />
        Two Pointers — Two Sum (tableau trié)
      </h3>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Cible :</span>
        <input
          type="number"
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value));
            reset();
          }}
          className="w-16 px-2 py-1 rounded border border-border bg-background text-center text-sm"
        />
      </div>
      <div className="flex gap-1 justify-center">
        {sorted.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {i === left && (
              <span className="text-[10px] text-green-500 font-bold">L</span>
            )}
            {i === right && (
              <span className="text-[10px] text-blue-500 font-bold">R</span>
            )}
            {i !== left && i !== right && (
              <span className="text-[10px] invisible">·</span>
            )}
            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-mono font-bold transition-all
                ${
                  found && (i === found[0] || i === found[1])
                    ? "bg-green-500 text-white ring-2 ring-green-400"
                    : i === left
                      ? "bg-green-500/20 text-green-500 ring-1 ring-green-500/50"
                      : i === right
                        ? "bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/50"
                        : "bg-muted/60 text-foreground"
                }`}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/40 hover:bg-muted transition-all"
        >
          <RotateCcw className="w-3 h-3 inline mr-1" />
          Reset
        </button>
        <button
          onClick={nextStep}
          disabled={!!found || left >= right}
          className="px-4 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 inline mr-1" />
          Étape {step + 1}
        </button>
      </div>
      {found && (
        <p className="text-sm text-center text-green-500 font-medium">
          Trouvé ! arr[{found[0]}] + arr[{found[1]}] = {sorted[found[0]]} +{" "}
          {sorted[found[1]]} = {target} — {step} étape(s)
        </p>
      )}
    </Card>
  );
}
