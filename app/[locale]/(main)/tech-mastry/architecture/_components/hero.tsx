"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  Layers,
  Building2,
  Puzzle,
  Boxes,
  GitBranch,
  Shield,
  Workflow,
} from "lucide-react";

const concepts = [
  { icon: Layers, label: "Clean Arch", color: "text-blue-400" },
  { icon: Puzzle, label: "Patterns", color: "text-purple-400" },
  { icon: Shield, label: "SOLID", color: "text-green-400" },
  { icon: Building2, label: "DDD", color: "text-orange-400" },
  { icon: Boxes, label: "Modules", color: "text-cyan-400" },
  { icon: GitBranch, label: "Dependency", color: "text-red-400" },
  { icon: Workflow, label: "Use Cases", color: "text-yellow-400" },
  { icon: BrainCircuit, label: "Design", color: "text-pink-400" },
];

export function ArchitectureHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % concepts.length),
      2500,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="text-center space-y-8">
      <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 animate-pulse" />
        <BrainCircuit className="w-10 h-10 text-indigo-500 relative z-10" />
        {concepts.map((c, i) => {
          const angle = (i / concepts.length) * 2 * Math.PI - Math.PI / 2;
          const r = 56;
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={`absolute w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${i === active ? "bg-primary/20 scale-125 shadow-lg" : "bg-muted/50 hover:bg-muted"}`}
              style={{
                left: `calc(50% + ${Math.cos(angle) * r}px - 16px)`,
                top: `calc(50% + ${Math.sin(angle) * r}px - 16px)`,
              }}
            >
              <Icon
                className={`w-4 h-4 ${i === active ? c.color : "text-muted-foreground"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-500">
          Architecture & Design Patterns
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les principes d&apos;architecture logicielle, les design
          patterns et les méthodes de conception qui font la différence en
          entretien.
        </p>
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {concepts.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${i === active ? "bg-primary/10 text-primary border-primary/30 scale-105" : "border-border/40 text-muted-foreground hover:border-primary/20"}`}
            >
              <Icon className="w-3 h-3" />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-8 text-sm text-muted-foreground">
        <div>
          <span className="text-2xl font-bold text-primary">4</span>{" "}
          <span className="block">Piliers</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">23+</span>{" "}
          <span className="block">Patterns</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">Interactif</span>{" "}
          <span className="block">Apprentissage</span>
        </div>
      </div>
    </section>
  );
}
