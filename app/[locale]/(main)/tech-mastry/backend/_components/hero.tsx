"use client";

import {
  Database,
  Server,
  Shield,
  Layers,
  Zap,
  Terminal,
  GitBranch,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

const backendConcepts = [
  { icon: Server, label: "APIs", color: "text-blue-400" },
  { icon: Database, label: "Databases", color: "text-green-400" },
  { icon: Shield, label: "Security", color: "text-red-400" },
  { icon: Layers, label: "Architecture", color: "text-purple-400" },
  { icon: Zap, label: "Performance", color: "text-yellow-400" },
  { icon: Terminal, label: "DevOps", color: "text-emerald-400" },
  { icon: GitBranch, label: "Testing", color: "text-cyan-400" },
  { icon: MessageSquare, label: "Messaging", color: "text-orange-400" },
];

export function BackendHero() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIdx((i) => (i + 1) % backendConcepts.length),
      2000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="text-center space-y-8">
      {/* Animated icon ring */}
      <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/10 to-purple-500/10 animate-pulse" />
        <div className="relative z-10 p-4 rounded-2xl bg-orange-500/10 text-orange-500">
          <Database className="w-10 h-10" />
        </div>
        {backendConcepts.map((c, i) => {
          const angle =
            (i / backendConcepts.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 70;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = i === activeIdx;
          return (
            <div
              key={c.label}
              className={`absolute transition-all duration-500 ${isActive ? "scale-125 opacity-100" : "scale-100 opacity-40"}`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">
          Backend Development
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          De la conception d&apos;APIs performantes au déploiement cloud —
          maîtrisez chaque couche du développement backend moderne avec des
          illustrations interactives.
        </p>
      </div>

      {/* Concept ticker */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {backendConcepts.map((c, i) => (
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
