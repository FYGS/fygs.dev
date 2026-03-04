"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  MessageSquare,
  Wand2,
  Settings2,
  Wrench,
  Brain,
  Cpu,
  Zap,
  Code2,
  Blocks,
  Workflow,
} from "lucide-react";

const aiConcepts = [
  { icon: MessageSquare, label: "Prompts", color: "text-violet-400" },
  { icon: Bot, label: "Agents", color: "text-blue-400" },
  { icon: Settings2, label: "Claude", color: "text-orange-400" },
  { icon: Code2, label: "Copilot", color: "text-green-400" },
  { icon: Brain, label: "LLMs", color: "text-amber-400" },
  { icon: Wrench, label: "MCP", color: "text-cyan-400" },
  { icon: Blocks, label: "Skills", color: "text-rose-400" },
  { icon: Cpu, label: "Fine-tuning", color: "text-red-400" },
  { icon: Workflow, label: "Pipelines", color: "text-teal-400" },
  { icon: Zap, label: "RAG", color: "text-yellow-400" },
  { icon: Wand2, label: "AI Tools", color: "text-purple-400" },
  { icon: Sparkles, label: "GenAI", color: "text-pink-400" },
];

export function AIMasteryHero() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIdx((i) => (i + 1) % aiConcepts.length),
      1800,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="text-center space-y-8">
      {/* Animated icon ring */}
      <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/10 to-pink-500/10 animate-pulse" />
        <div className="relative z-10 p-5 rounded-2xl bg-violet-500/10 text-violet-500">
          <Sparkles className="w-12 h-12" />
        </div>
        {aiConcepts.map((c, i) => {
          const angle = (i / aiConcepts.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 88;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = i === activeIdx;
          return (
            <div
              key={c.label}
              className={`absolute transition-all duration-500 ${isActive ? "scale-150 opacity-100" : "scale-100 opacity-30"}`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-pink-500 to-amber-500 bg-clip-text text-transparent">
          IA & Prompt Engineering
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Parcours complet de zéro à expert. Prompt engineering, IA agentiques,
          configuration Claude &amp; Copilot, outils IA modernes, protocole MCP
          et création de Skills &amp; Agents — avec des démos interactives et
          des scénarios paramétrables.
        </p>
      </div>

      {/* Concept ticker */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {aiConcepts.map((c, i) => (
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
