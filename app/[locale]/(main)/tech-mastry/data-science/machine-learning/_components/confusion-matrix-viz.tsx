"use client";

import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

/* ─────────── Confusion Matrix ─────────── */
export function ConfusionMatrixViz() {
  const [tp, setTp] = useState(85);
  const [fp, setFp] = useState(10);
  const [fn, setFn] = useState(15);
  const [tn, setTn] = useState(90);

  const total = tp + fp + fn + tn;
  // Ratios calculés à partir des effectifs exacts ; dénominateur nul => « — » (pas de NaN)
  const ratio = (num: number, den: number) =>
    den === 0 ? "—" : `${((num / den) * 100).toFixed(1)}%`;
  const accuracy = ratio(tp + tn, total);
  const precision = ratio(tp, tp + fp);
  const recall = ratio(tp, tp + fn);
  // F1 = 2·VP / (2·VP + FP + FN), équivalent à la moyenne harmonique précision/rappel
  const f1 = ratio(2 * tp, 2 * tp + fp + fn);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="w-5 h-5 text-cyan-500" />
        Matrice de Confusion
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "TP (Vrais Positifs)",
            val: tp,
            set: setTp,
            color: "bg-green-500/20 border-green-500/30",
          },
          {
            label: "FP (Faux Positifs)",
            val: fp,
            set: setFp,
            color: "bg-red-500/20 border-red-500/30",
          },
          {
            label: "FN (Faux Négatifs)",
            val: fn,
            set: setFn,
            color: "bg-orange-500/20 border-orange-500/30",
          },
          {
            label: "TN (Vrais Négatifs)",
            val: tn,
            set: setTn,
            color: "bg-blue-500/20 border-blue-500/30",
          },
        ].map((c) => (
          <div key={c.label} className="space-y-1">
            <label className="text-[10px] text-muted-foreground">
              {c.label}: {c.val}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={c.val}
              onChange={(e) => c.set(+e.target.value)}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      {/* Matrix visualization */}
      <div className="flex justify-center">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center items-center">
          <div />
          <div className="text-[10px] text-muted-foreground">Prédit : positif</div>
          <div className="text-[10px] text-muted-foreground">Prédit : négatif</div>
          <div className="text-[10px] text-muted-foreground pr-1">Réel : positif</div>
          <div className="px-6 py-4 rounded-tl-lg bg-green-500/20 border border-green-500/20">
            <div className="text-2xl font-bold">{tp}</div>
            <div className="text-[10px] text-muted-foreground">VP</div>
          </div>
          <div className="px-6 py-4 rounded-tr-lg bg-orange-500/20 border border-orange-500/20">
            <div className="text-2xl font-bold">{fn}</div>
            <div className="text-[10px] text-muted-foreground">FN</div>
          </div>
          <div className="text-[10px] text-muted-foreground pr-1">Réel : négatif</div>
          <div className="px-6 py-4 rounded-bl-lg bg-red-500/20 border border-red-500/20">
            <div className="text-2xl font-bold">{fp}</div>
            <div className="text-[10px] text-muted-foreground">FP</div>
          </div>
          <div className="px-6 py-4 rounded-br-lg bg-blue-500/20 border border-blue-500/20">
            <div className="text-2xl font-bold">{tn}</div>
            <div className="text-[10px] text-muted-foreground">VN</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Accuracy", val: accuracy },
          { label: "Precision", val: precision },
          { label: "Recall", val: recall },
          { label: "F1-Score", val: f1 },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center"
          >
            <div className="text-lg font-bold text-primary">{m.val}</div>
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
