"use client";

import { useState, useEffect, useMemo } from "react";
import {
  GitBranch,
  GitMerge,
  GitCommit,
  GitPullRequest,
  History,
  Undo2,
  Tag,
  Diff,
} from "lucide-react";

const concepts = [
  { icon: GitBranch, label: "Branches", color: "text-orange-400" },
  { icon: GitMerge, label: "Merge", color: "text-blue-400" },
  { icon: GitCommit, label: "Commits", color: "text-green-400" },
  { icon: GitPullRequest, label: "Pull Requests", color: "text-purple-400" },
  { icon: History, label: "Historique", color: "text-cyan-400" },
  { icon: Undo2, label: "Revert", color: "text-red-400" },
  { icon: Tag, label: "Tags", color: "text-yellow-400" },
  { icon: Diff, label: "Diff", color: "text-pink-400" },
];

export function GitMasteryHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % concepts.length),
      2200,
    );
    return () => clearInterval(t);
  }, []);

  const commitLog = useMemo(() => {
    const hashes = [
      "a3f7c2d", "e91b4f8", "2c5d9a1", "f8e3b7c",
      "7d1a4e6", "b9c2f5d", "4e8a1c3", "d6f2b9e",
    ];
    const messages = [
      "feat: add auth module",
      "fix: resolve memory leak",
      "refactor: clean service layer",
      "docs: update API reference",
      "chore: bump dependencies",
      "test: add integration tests",
      "perf: optimize queries",
      "style: format components",
    ];
    const log: string[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = (active + i) % hashes.length;
      log.push(`${hashes[idx]} ${messages[idx]}`);
    }
    return log;
  }, [active]);

  return (
    <section className="text-center space-y-8">
      <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 animate-pulse" />
        <GitBranch className="w-10 h-10 text-orange-500 relative z-10" />
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
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
          Git Mastery
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez Git de A à Z : des fondamentaux aux techniques avancées
          de gestion de versions, branching strategies et workflows professionnels.
        </p>
      </div>

      {/* Interactive commit log */}
      <div className="max-w-lg mx-auto rounded-xl bg-muted/30 border border-border/40 p-4 text-left font-mono text-xs space-y-1">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <History className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">git log --oneline</span>
        </div>
        {commitLog.map((line, i) => (
          <div
            key={i}
            className={`flex gap-2 transition-all duration-300 ${i === 0 ? "text-orange-400" : "text-muted-foreground"}`}
          >
            <span className="text-amber-500/70">{line.split(" ")[0]}</span>
            <span>{line.split(" ").slice(1).join(" ")}</span>
          </div>
        ))}
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
          <span className="text-2xl font-bold text-primary">30+</span>{" "}
          <span className="block">Commandes</span>
        </div>
        <div>
          <span className="text-2xl font-bold text-primary">Interactif</span>{" "}
          <span className="block">Exercices</span>
        </div>
      </div>
    </section>
  );
}