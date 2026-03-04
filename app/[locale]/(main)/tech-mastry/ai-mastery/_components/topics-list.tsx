"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Bot,
  Settings2,
  Code2,
  Wrench,
  Blocks,
  ArrowRight,
} from "lucide-react";

type Level = "all" | "fondamental" | "intermediaire" | "avance";

const topics = [
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    desc: "Zero-shot, few-shot, chain-of-thought, system prompts, temperature, structured output",
    icon: MessageSquare,
    level: "fondamental" as const,
    color: "from-violet-500/20 to-violet-600/5",
    interviewPct: 90,
  },
  {
    slug: "agentic-ai",
    title: "IA Agentiques",
    desc: "ReAct, tool use, multi-agents, planification, boucles autonomes, LangChain, CrewAI",
    icon: Bot,
    level: "avance" as const,
    color: "from-blue-500/20 to-blue-600/5",
    interviewPct: 85,
  },
  {
    slug: "claude-setup",
    title: "Setup Claude Complet",
    desc: "API, Projects, MCP servers, Claude Code CLI, Artifacts, system prompts, bonnes pratiques",
    icon: Settings2,
    level: "intermediaire" as const,
    color: "from-orange-500/20 to-orange-600/5",
    interviewPct: 75,
  },
  {
    slug: "copilot-setup",
    title: "Setup GitHub Copilot",
    desc: "VS Code config, modes Ask/Edit/Agent, instructions custom, MCP, workspace agents",
    icon: Code2,
    level: "intermediaire" as const,
    color: "from-green-500/20 to-green-600/5",
    interviewPct: 80,
  },
  {
    slug: "ai-tools",
    title: "Outils IA Modernes",
    desc: "Gemini, Google AI Studio, Cursor, Windsurf, v0, Bolt, ChatGPT, Perplexity, comparatifs",
    icon: Wrench,
    level: "fondamental" as const,
    color: "from-amber-500/20 to-amber-600/5",
    interviewPct: 70,
  },
  {
    slug: "skills-agents",
    title: "Skills & Agents MCP",
    desc: "Protocole MCP, serveurs custom, tool definitions, skill composition, agents en production",
    icon: Blocks,
    level: "avance" as const,
    color: "from-rose-500/20 to-rose-600/5",
    interviewPct: 65,
  },
];

const filters: { key: Level; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "fondamental", label: "Fondamental" },
  { key: "intermediaire", label: "Intermediaire" },
  { key: "avance", label: "Avance" },
];

export function AIMasteryTopics() {
  const [filter, setFilter] = useState<Level>("all");
  const visible =
    filter === "all" ? topics : topics.filter((t) => t.level === filter);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Parcours complet</h2>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((t) => (
          <Link key={t.slug} href={`/tech-mastry/ai-mastery/${t.slug}`}>
            <Card
              className={`group relative p-5 bg-gradient-to-br ${t.color} border-border/30 hover:border-primary/40 transition-all duration-300 hover:shadow-lg cursor-pointer h-full`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/60">
                  <t.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.title}</h3>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${t.interviewPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {t.interviewPct}% pertinence
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}