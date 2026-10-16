"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { CHART_DATA } from "./chart-data";

/* ─────────── ChartDemo ─────────── */
export function ChartDemo() {
  const data = CHART_DATA;
  const [chartType, setChartType] = useState<"bar" | "line" | "scatter">("bar");
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="w-5 h-5 text-purple-500" />
        Visualisation — Matplotlib / Seaborn
      </div>

      <div className="flex gap-2">
        {(["bar", "line", "scatter"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`px-3 py-1.5 rounded text-xs border ${chartType === t ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
          >
            {t === "bar" ? "Barres" : t === "line" ? "Ligne" : "Nuage"}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        {chartType === "bar" && 'plt.bar(months, values, color="steelblue")'}
        {chartType === "line" &&
          'plt.plot(months, values, marker="o", linewidth=2)'}
        {chartType === "scatter" &&
          'plt.scatter(months, values, s=100, c="coral")'}
      </div>

      <svg
        viewBox="0 0 400 200"
        className="w-full h-48 bg-muted/20 rounded-lg border border-border/20"
      >
        {/* Y axis */}
        <line
          x1="50"
          y1="10"
          x2="50"
          y2="170"
          stroke="currentColor"
          strokeOpacity="0.2"
        />
        {/* X axis */}
        <line
          x1="50"
          y1="170"
          x2="380"
          y2="170"
          stroke="currentColor"
          strokeOpacity="0.2"
        />

        {data.map((d, i) => {
          const x = 50 + (i + 0.5) * (330 / data.length);
          const barW = (330 / data.length) * 0.6;
          const h = (d.value / maxVal) * 150;
          const y = 170 - h;

          if (chartType === "bar") {
            return (
              <g key={i}>
                <rect
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={h}
                  rx="3"
                  className="fill-primary/60 hover:fill-primary/80 transition-all"
                />
                <text
                  x={x}
                  y={185}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {d.label}
                </text>
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
                >
                  {d.value}
                </text>
              </g>
            );
          }
          return null;
        })}

        {chartType === "line" && (
          <>
            <polyline
              points={data
                .map((d, i) => {
                  const x = 50 + (i + 0.5) * (330 / data.length);
                  const y = 170 - (d.value / maxVal) * 150;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {data.map((d, i) => {
              const x = 50 + (i + 0.5) * (330 / data.length);
              const y = 170 - (d.value / maxVal) * 150;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" className="fill-primary" />
                  <text
                    x={x}
                    y={185}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {d.label}
                  </text>
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="fill-foreground text-[10px]"
                  >
                    {d.value}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {chartType === "scatter" &&
          data.map((d, i) => {
            const x = 50 + (i + 0.5) * (330 / data.length);
            const y = 170 - (d.value / maxVal) * 150;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  className="fill-orange-400/70 hover:fill-orange-500 transition-all"
                />
                <text
                  x={x}
                  y={185}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {d.label}
                </text>
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="fill-foreground text-[10px]"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
      </svg>
    </Card>
  );
}
