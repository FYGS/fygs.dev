"use client";

import { Card } from "@/components/ui/card";
import { Zap, Play } from "lucide-react";
import { useState } from "react";

/* ─── Sliding Window Visualizer ─── */
export function SlidingWindowVisualizer() {
  const data = [2, 1, 5, 1, 3, 2, 8, 4, 3];
  const [k, setK] = useState(3);
  const [windowStart, setWindowStart] = useState(0);
  const [maxSum, setMaxSum] = useState(0);
  const [currentSum, setCurrentSum] = useState(0);
  const [running, setRunning] = useState(false);

  const reset = () => {
    setWindowStart(0);
    setMaxSum(0);
    setCurrentSum(0);
  };

  const runDemo = async () => {
    if (running) return;
    setRunning(true);
    let ms = 0;
    let cs = 0;
    for (let i = 0; i < k; i++) cs += data[i];
    ms = cs;
    setCurrentSum(cs);
    setMaxSum(ms);
    setWindowStart(0);
    await new Promise((r) => setTimeout(r, 600));
    for (let i = k; i < data.length; i++) {
      cs = cs - data[i - k] + data[i];
      if (cs > ms) ms = cs;
      setCurrentSum(cs);
      setMaxSum(ms);
      setWindowStart(i - k + 1);
      await new Promise((r) => setTimeout(r, 600));
    }
    setRunning(false);
  };

  return (
    <Card className="p-6 space-y-5 border-purple-500/20">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Zap className="w-5 h-5 text-purple-500" />
        Sliding Window — Somme Maximale de K éléments
      </h3>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Taille fenêtre (k) :</span>
        <input
          type="number"
          min={1}
          max={data.length}
          value={k}
          onChange={(e) => {
            setK(Math.max(1, Math.min(data.length, Number(e.target.value))));
            reset();
          }}
          className="w-16 px-2 py-1 rounded border border-border bg-background text-center text-sm"
        />
      </div>
      <div className="flex gap-1 justify-center">
        {data.map((val, i) => {
          const inWindow = i >= windowStart && i < windowStart + k;
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-mono font-bold transition-all
                ${inWindow ? "bg-purple-500 text-white ring-2 ring-purple-400" : "bg-muted/60 text-foreground"}`}
            >
              {val}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 text-sm">
        <span>
          Somme courante :{" "}
          <strong className="text-purple-500">{currentSum}</strong>
        </span>
        <span>
          Max : <strong className="text-green-500">{maxSum}</strong>
        </span>
      </div>
      <div className="flex justify-center">
        <button
          onClick={runDemo}
          disabled={running}
          className="px-4 py-2 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 inline mr-1" />
          {running ? "En cours..." : "Lancer la Démo"}
        </button>
      </div>
    </Card>
  );
}
