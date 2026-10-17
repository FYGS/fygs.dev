"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useState, useMemo } from "react";

/* ─────────── KNN Visualizer ─────────── */
export function KNNVisualizer() {
  const [k, setK] = useState(3);
  const [queryPt, setQueryPt] = useState({ x: 55, y: 45 });

  const dataPoints = useMemo(
    () => [
      { x: 20, y: 30, cls: "A" },
      { x: 25, y: 45, cls: "A" },
      { x: 15, y: 60, cls: "A" },
      { x: 30, y: 25, cls: "A" },
      { x: 35, y: 50, cls: "A" },
      { x: 22, y: 70, cls: "A" },
      { x: 28, y: 55, cls: "A" },
      { x: 18, y: 40, cls: "A" },
      { x: 70, y: 30, cls: "B" },
      { x: 75, y: 50, cls: "B" },
      { x: 80, y: 25, cls: "B" },
      { x: 65, y: 60, cls: "B" },
      { x: 85, y: 40, cls: "B" },
      { x: 72, y: 65, cls: "B" },
      { x: 78, y: 35, cls: "B" },
      { x: 68, y: 45, cls: "B" },
      { x: 45, y: 75, cls: "C" },
      { x: 50, y: 80, cls: "C" },
      { x: 55, y: 70, cls: "C" },
      { x: 40, y: 85, cls: "C" },
      { x: 48, y: 68, cls: "C" },
      { x: 52, y: 78, cls: "C" },
    ],
    [],
  );

  const distances = useMemo(() => {
    return dataPoints
      .map((p, i) => ({
        ...p,
        idx: i,
        dist: Math.sqrt((p.x - queryPt.x) ** 2 + (p.y - queryPt.y) ** 2),
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [dataPoints, queryPt]);

  const neighbors = distances.slice(0, k);
  const counts: Record<string, number> = {};
  neighbors.forEach((n) => {
    counts[n.cls] = (counts[n.cls] || 0) + 1;
  });
  const prediction =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "?";

  const clsColor: Record<string, string> = {
    A: "fill-blue-500",
    B: "fill-red-500",
    C: "fill-green-500",
  };
  const predColor: Record<string, string> = {
    A: "text-blue-500",
    B: "text-red-500",
    C: "text-green-500",
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Target className="w-5 h-5 text-amber-500" />
        K-Nearest Neighbors (KNN)
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">K = {k}</label>
          <input
            type="range"
            min="1"
            max="9"
            step="2"
            value={k}
            onChange={(e) => setK(+e.target.value)}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Position X: {queryPt.x}
          </label>
          <input
            type="range"
            min="5"
            max="95"
            value={queryPt.x}
            onChange={(e) => setQueryPt((p) => ({ ...p, x: +e.target.value }))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-48 bg-muted/20 rounded-lg border border-border/20"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setQueryPt({ x: Math.round(x), y: Math.round(y) });
        }}
      >
        {/* Neighbor lines */}
        {neighbors.map((n) => (
          <line
            key={n.idx}
            x1={queryPt.x * 3.8 + 10}
            y1={queryPt.y * 1.8 + 10}
            x2={n.x * 3.8 + 10}
            y2={n.y * 1.8 + 10}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="4"
            opacity="0.4"
          />
        ))}
        {/* Data points */}
        {dataPoints.map((p, i) => {
          const isNeighbor = neighbors.some((n) => n.idx === i);
          return (
            <circle
              key={i}
              cx={p.x * 3.8 + 10}
              cy={p.y * 1.8 + 10}
              r={isNeighbor ? 7 : 5}
              className={`${clsColor[p.cls]} ${isNeighbor ? "opacity-100" : "opacity-40"}`}
              strokeWidth={isNeighbor ? 2 : 0}
              stroke="hsl(var(--foreground))"
            />
          );
        })}
        {/* Query point */}
        <circle
          cx={queryPt.x * 3.8 + 10}
          cy={queryPt.y * 1.8 + 10}
          r="8"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
        />
        <text
          x={queryPt.x * 3.8 + 10}
          y={queryPt.y * 1.8 - 2}
          textAnchor="middle"
          className="fill-primary text-[10px] font-bold"
        >
          ?
        </text>
      </svg>

      <div className="flex items-center gap-4">
        <span className="text-sm">Prédiction :</span>
        <Badge className={`${predColor[prediction]} text-sm`}>
          Classe {prediction}
        </Badge>
        <span className="text-xs text-muted-foreground">
          (votes : {JSON.stringify(counts)})
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Cliquez sur le graphique pour déplacer le point de requête
      </p>
    </Card>
  );
}
