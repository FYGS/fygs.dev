"use client";

import {
  Brain,
  TrendingUp,
  Boxes,
  ArrowUpDown,
  Search,
  Cpu,
  GitBranch,
  Target,
  Undo2,
} from "lucide-react";
import { useState, useEffect } from "react";

const concepts = [
  { name: "Big O", icon: TrendingUp, color: "text-green-400" },
  { name: "Structures", icon: Boxes, color: "text-blue-400" },
  { name: "Tri", icon: ArrowUpDown, color: "text-purple-400" },
  { name: "Recherche", icon: Search, color: "text-cyan-400" },
  { name: "DP", icon: Cpu, color: "text-orange-400" },
  { name: "Graphes", icon: GitBranch, color: "text-pink-400" },
  { name: "Greedy", icon: Target, color: "text-yellow-400" },
  { name: "Backtrack", icon: Undo2, color: "text-red-400" },
];

export function AlgorithmsHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setActive((prev) => (prev + 1) % concepts.length),
      2500,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="text-center space-y-8">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-pulse scale-150" />
        <div className="relative p-4 rounded-2xl bg-blue-500/10 text-blue-500">
          <Brain className="w-10 h-10" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Algorithmes & Structures de Données
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les concepts fondamentaux avec des visualisations
          interactives, des exercices pratiques et des explications pas-à-pas.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {concepts.map((c, i) => {
          const CI = c.icon;
          return (
            <button
              key={c.name}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${active === i ? `bg-primary/5 border-primary/20 ${c.color} scale-110` : "border-border/20 text-muted-foreground hover:border-border/50"}`}
            >
              <CI className="w-4 h-4" />
              <span className="font-medium">{c.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-6 text-center">
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-2xl font-bold text-primary">8</p>
          <p className="text-[10px] text-muted-foreground">Catégories</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-2xl font-bold text-green-500">30+</p>
          <p className="text-[10px] text-muted-foreground">Algorithmes</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-2xl font-bold text-purple-500">Interactif</p>
          <p className="text-[10px] text-muted-foreground">Visualisations</p>
        </div>
      </div>
    </section>
  );
}
