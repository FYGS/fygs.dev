"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Play, BookOpen } from "lucide-react";
import { ArrayVisualizer } from "./_components/array-visualizer";
import { TwoPointersVisualizer } from "./_components/two-pointers-visualizer";
import { SlidingWindowVisualizer } from "./_components/sliding-window-visualizer";
import { operations, techniques, stringTechniques } from "./_data/content";

export default function ArraysPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Code2 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          Tableaux & Chaînes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          La structure de données la plus fondamentale. Maîtrisez les
          opérations, les patterns d&apos;entretien et les techniques
          d&apos;optimisation essentielles.
        </p>
      </section>

      {/* Interactive Visualizers */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Play className="w-6 h-6 text-primary" />
          Visualisations Interactives
        </h2>
        <ArrayVisualizer />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TwoPointersVisualizer />
          <SlidingWindowVisualizer />
        </div>
      </section>

      {/* Complexity Table */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Complexité des Opérations</h2>
        <Card className="overflow-x-auto border-border/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Opération</th>
                <th className="text-left py-3 px-4 font-semibold">Temps</th>
                <th className="text-left py-3 px-4 font-semibold">Espace</th>
                <th className="text-left py-3 px-4 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((o) => (
                <tr key={o.op} className="border-b border-border/20">
                  <td className="py-2.5 px-4 font-mono text-primary text-xs">
                    {o.op}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className="bg-green-500/10 text-green-500 text-xs">
                      {o.time}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs">
                    {o.space}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs">
                    {o.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Techniques d'entretien */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Techniques d&apos;Entretien
        </h2>
        <div className="space-y-4">
          {techniques.map((t) => (
            <Card
              key={t.name}
              className="p-5 border-border/40 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      {t.complexity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.examples.map((ex) => (
                      <Badge key={ex} variant="outline" className="text-[10px]">
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* String Techniques */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Techniques sur les Chaînes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stringTechniques.map((t) => (
            <Card key={t.name} className="p-5 border-border/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{t.name}</h3>
                <Badge className="bg-primary/10 text-primary text-xs">
                  {t.complexity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Implémentations Clés</h2>
        <Card className="p-5 border-border/40 space-y-4">
          <h3 className="font-semibold text-blue-500">Binary Search</h3>
          <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-xs" tabIndex={0}>
            <code>{`function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; // not found
}

// Kadane's Algorithm — Maximum Subarray Sum
function maxSubarraySum(arr: number[]): number {
  let maxSoFar = arr[0], maxEndingHere = arr[0];
  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  return maxSoFar;
}

// Prefix Sum — Range Query
function buildPrefixSum(arr: number[]): number[] {
  const prefix = [0];
  for (let i = 0; i < arr.length; i++) {
    prefix.push(prefix[i] + arr[i]);
  }
  return prefix;
  // rangeSum(l, r) = prefix[r+1] - prefix[l]
}`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}
