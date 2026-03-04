"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Code2,
  Binary,
  GitMerge,
  Layers,
  Hash,
  ArrowUpDown,
  ListTree,
  Network,
  Braces,
} from "lucide-react";

const dsConcepts = [
  { icon: Code2, label: "Arrays", color: "text-blue-400" },
  { icon: GitMerge, label: "Linked Lists", color: "text-green-400" },
  { icon: ListTree, label: "Trees", color: "text-purple-400" },
  { icon: Hash, label: "Hash Maps", color: "text-amber-400" },
  { icon: Network, label: "Graphs", color: "text-cyan-400" },
  { icon: ArrowUpDown, label: "Heaps", color: "text-violet-400" },
  { icon: Layers, label: "Stacks", color: "text-teal-400" },
  { icon: Braces, label: "Queues", color: "text-orange-400" },
  { icon: Binary, label: "Tries", color: "text-rose-400" },
];

export function DataStructuresHero() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIdx((i) => (i + 1) % dsConcepts.length),
      2000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="text-center space-y-8">
      {/* Animated icon ring */}
      <div className="relative mx-auto w-44 h-44 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse" />
        <div className="relative z-10 p-5 rounded-2xl bg-blue-500/10 text-blue-500">
          <Database className="w-12 h-12" />
        </div>
        {dsConcepts.map((c, i) => {
          const angle = (i / dsConcepts.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = i === activeIdx;
          return (
            <div
              key={c.label}
              className={`absolute transition-all duration-500 ${isActive ? "scale-150 opacity-100" : "scale-100 opacity-35"}`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Structures de Données
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Maîtrisez chaque structure de données fondamentale — des tableaux aux
          graphes — avec des visualisations interactives, des implémentations
          complètes et des analyses de complexité approfondies.
        </p>
      </div>

      {/* Concept ticker */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {dsConcepts.map((c, i) => (
          <button
            key={c.label}
            onClick={() => setActiveIdx(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              i === activeIdx
                ? "border-primary bg-primary/10 text-primary scale-105"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}
