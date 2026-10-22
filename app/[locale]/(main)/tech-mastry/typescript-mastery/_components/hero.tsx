"use client";

import { useState, useEffect } from "react";
import { Code2, Braces, FileType2, Shield, Puzzle, Cpu, Sparkles, Layers } from "lucide-react";

const concepts = [
  { icon: Braces, label: "Types", color: "text-blue-400" },
  { icon: Puzzle, label: "Generics", color: "text-purple-400" },
  { icon: Shield, label: "Type Guards", color: "text-green-400" },
  { icon: FileType2, label: "Utility Types", color: "text-cyan-400" },
  { icon: Layers, label: "Patterns", color: "text-orange-400" },
  { icon: Cpu, label: "Compiler", color: "text-red-400" },
  { icon: Sparkles, label: "Infer", color: "text-yellow-400" },
  { icon: Code2, label: "Decorators", color: "text-pink-400" },
];

const typeExamples = [
  { code: "type Result<T, E> = Success<T> | Failure<E>;", label: "Discriminated Unions" },
  { code: "type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };", label: "Mapped Types" },
  { code: "type ExtractRouteParams<T> = T extends `${string}:${infer P}/${infer R}` ? P | ExtractRouteParams<R> : never;", label: "Template Literals" },
  { code: "type Prettify<T> = { [K in keyof T]: T[K] } & {};", label: "Type Helpers" },
];

export function TypeScriptMasteryHero() {
  const [active, setActive] = useState(0);
  const [typeIdx, setTypeIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % concepts.length), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTypeIdx((p) => (p + 1) % typeExamples.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="text-center space-y-8">
      <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-800/20 animate-pulse" />
        <span className="text-3xl font-black text-blue-500 relative z-10">TS</span>
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
              <Icon className={`w-4 h-4 ${i === active ? c.color : "text-muted-foreground"}`} />
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-700">
          TypeScript Mastery
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez TypeScript en profondeur : types avancés, generics, type challenges,
          design patterns typés et sécurité au runtime.
        </p>
      </div>

      {/* Rotating type example */}
      <div className="max-w-xl mx-auto rounded-xl bg-muted/30 border border-border/40 p-4 text-left font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Code2 className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            {typeExamples[typeIdx].label}
          </span>
        </div>
        <code className="text-blue-400 block transition-all duration-500">
          {typeExamples[typeIdx].code}
        </code>
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
          <span className="text-2xl font-bold text-primary">6</span>{" "}
          <span className="block">Modules</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">25+</span>{" "}
          <span className="block">Exemples détaillés</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">Expert</span>{" "}
          <span className="block">Niveau</span>
        </div>
      </div>
    </section>
  );
}