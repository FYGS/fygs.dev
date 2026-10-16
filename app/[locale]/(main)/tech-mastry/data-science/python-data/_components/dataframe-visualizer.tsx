"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Table } from "lucide-react";
import { INITIAL_DATA, OP_CODE, applyOp } from "./dataframe-ops";
import type { Op } from "./dataframe-ops";

/* ─────────── DataFrameVisualizer ─────────── */
export function DataFrameVisualizer() {
  const initialData = useMemo(() => INITIAL_DATA, []);

  const [op, setOp] = useState<Op>("none");

  const result = useMemo(() => applyOp(op, initialData), [op, initialData]);

  const opCode = OP_CODE;

  const cols = result.length > 0 ? Object.keys(result[0]) : [];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Table className="w-5 h-5 text-blue-500" />
        DataFrame Interactif — Pandas
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          ["none", "filter", "sort", "groupby", "select", "mutate"] as Op[]
        ).map((o) => (
          <button
            key={o}
            onClick={() => setOp(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              op === o
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {o === "none"
              ? "Original"
              : o === "groupby"
                ? "Group By"
                : o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-primary">
        <span className="text-muted-foreground">{">>> "}</span>
        {opCode[op]}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-3 py-2 text-left text-xs text-muted-foreground">
                #
              </th>
              {cols.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2 text-left text-xs font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.map((row: any, i: number) => (
              <tr
                key={i}
                className="border-t border-border/20 hover:bg-muted/20 transition-colors"
              >
                <td className="px-3 py-2 text-xs text-muted-foreground">{i}</td>
                {cols.map((c) => (
                  <td key={c} className="px-3 py-2 text-xs">
                    {String(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {result.length} ligne(s) × {cols.length} colonne(s)
      </p>
    </Card>
  );
}
