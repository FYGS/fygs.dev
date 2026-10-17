"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { useState, useMemo } from "react";

/* ─────────── Decision Boundary (Linear) ─────────── */
export function LinearClassifierViz() {
  const [bias, setBias] = useState(50);
  const [slope, setSlope] = useState(0);

  const points = useMemo(
    () => [
      { x: 15, y: 25 },
      { x: 20, y: 35 },
      { x: 25, y: 20 },
      { x: 30, y: 40 },
      { x: 22, y: 30 },
      { x: 18, y: 45 },
      { x: 28, y: 28 },
      { x: 65, y: 70 },
      { x: 70, y: 60 },
      { x: 75, y: 80 },
      { x: 80, y: 65 },
      { x: 72, y: 75 },
      { x: 78, y: 55 },
      { x: 68, y: 68 },
    ],
    [],
  );

  const classify = (p: { x: number; y: number }) => {
    return p.y > bias + (slope * (p.x - 50)) / 10 ? 1 : 0;
  };

  const correct = points.filter(
    (p, i) => classify(p) === (i < 7 ? 0 : 1),
  ).length;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <GitBranch className="w-5 h-5 text-violet-500" />
        Frontière de décision linéaire
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Biais: {bias}</label>
          <input
            type="range"
            min="10"
            max="90"
            value={bias}
            onChange={(e) => setBias(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Pente: {slope}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={slope}
            onChange={(e) => setSlope(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-44 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Decision boundary */}
        <line
          x1="10"
          y1={(bias + (slope * -50) / 10) * 1.8 + 10}
          x2="390"
          y2={(bias + (slope * 50) / 10) * 1.8 + 10}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="6"
        />
        {/* Points */}
        {points.map((p, i) => {
          const isCorrect = classify(p) === (i < 7 ? 0 : 1);
          return (
            <g key={i}>
              <circle
                cx={p.x * 3.8 + 10}
                cy={p.y * 1.8 + 10}
                r="6"
                className={i < 7 ? "fill-blue-500" : "fill-red-500"}
                opacity={isCorrect ? 1 : 0.3}
                strokeWidth={isCorrect ? 0 : 2}
                stroke="hsl(var(--foreground))"
              />
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-3">
        <Badge variant="outline">
          Précision : {Math.round((correct / points.length) * 100)}%
        </Badge>
        <span className="text-xs text-muted-foreground">
          {correct}/{points.length} correctement classé(s)
        </span>
      </div>
    </Card>
  );
}
