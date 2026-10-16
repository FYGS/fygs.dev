"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2 } from "lucide-react";
import { getNumpyDisplay } from "./numpy-display";
import type { NumpyOp, Shape } from "./numpy-display";

/* ─────────── NumpyVisualizer ─────────── */
export function NumpyVisualizer() {
  const [shape, setShape] = useState<Shape>("2d");
  const [opNp, setOpNp] = useState<NumpyOp>("none");

  const display = useMemo(() => getNumpyDisplay(shape, opNp), [shape, opNp]);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Code2 className="w-5 h-5 text-green-500" />
        NumPy — Opérations matricielles
      </div>

      <div className="flex gap-4">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium">
            Dimension
          </span>
          <div className="flex gap-1.5">
            {(["1d", "2d", "3d"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setShape(s);
                  setOpNp("none");
                }}
                className={`px-3 py-1 rounded text-xs border ${shape === s ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {shape === "2d" && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">
              Opération
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {(["none", "transpose", "reshape", "sum", "dot"] as const).map(
                (o) => (
                  <button
                    key={o}
                    onClick={() => setOpNp(o)}
                    className={`px-3 py-1 rounded text-xs border ${opNp === o ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
                  >
                    {o === "none" ? "Original" : o}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        <span className="text-muted-foreground">{">>> "}</span>
        {display.code}
      </div>

      <div className="flex items-center gap-4">
        <div className="grid gap-1">
          {Array.isArray(display.data[0]) ? (
            (display.data as number[][]).map((row, i) => (
              <div key={i} className="flex gap-1">
                {(Array.isArray(row) ? row : [row]).map(
                  (v: number, j: number) => (
                    <div
                      key={j}
                      className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-mono font-semibold"
                    >
                      {v}
                    </div>
                  ),
                )}
              </div>
            ))
          ) : (
            <div className="flex gap-1">
              {(display.data as any as number[]).map((v, j) => (
                <div
                  key={j}
                  className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-mono font-semibold"
                >
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {display.label}
        </Badge>
      </div>
    </Card>
  );
}
