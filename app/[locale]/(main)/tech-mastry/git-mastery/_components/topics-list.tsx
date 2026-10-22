"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  GitBranch,
  Terminal,
  Workflow,
  AlertTriangle,
  Webhook,
  ArrowRight,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Level = "Fondamental" | "Avancé" | "Expert";

const topics = [
  {
    title: "Branching Strategies",
    description:
      "Git Flow, GitHub Flow, Trunk-Based Development. Choisissez la stratégie adaptée à votre équipe et votre projet.",
    icon: GitBranch,
    color: "text-orange-500",
    gradient: "from-orange-500/10 to-orange-500/5",
    href: "/tech-mastry/git-mastery/branching-strategies",
    level: "Fondamental" as Level,
    tags: [
      "Git Flow",
      "GitHub Flow",
      "Trunk-Based",
      "Feature Branches",
      "Release Branches",
    ],
  },
  {
    title: "Commandes Avancées",
    description:
      "Rebase interactif, cherry-pick, bisect, reflog, stash avancé. Les commandes qui font la différence.",
    icon: Terminal,
    color: "text-blue-500",
    gradient: "from-blue-500/10 to-blue-500/5",
    href: "/tech-mastry/git-mastery/advanced-commands",
    level: "Avancé" as Level,
    tags: ["Rebase", "Cherry-pick", "Bisect", "Reflog", "Stash"],
  },
  {
    title: "Git Internals",
    description:
      "Objets Git (blobs, trees, commits), le DAG, pack files, garbage collection et fonctionnalités récentes. Comprenez Git en profondeur.",
    icon: Eye,
    color: "text-purple-500",
    gradient: "from-purple-500/10 to-purple-500/5",
    href: "/tech-mastry/git-mastery/git-internals",
    level: "Expert" as Level,
    tags: ["Blobs", "Trees", "DAG", "SHA-1", "Pack Files"],
  },
  {
    title: "Workflows Professionnels",
    description:
      "Conventional Commits, semantic versioning, monorepos (sparse-checkout, clone partiel), code review, pull request templates.",
    icon: Workflow,
    color: "text-green-500",
    gradient: "from-green-500/10 to-green-500/5",
    href: "/tech-mastry/git-mastery/workflows",
    level: "Fondamental" as Level,
    tags: [
      "Conventional Commits",
      "Semver",
      "Monorepo",
      "Code Review",
      "PR Templates",
    ],
  },
  {
    title: "Résolution de Conflits",
    description:
      "Stratégies de résolution de conflits de merge, outils visuels, détection proactive et bonnes pratiques.",
    icon: AlertTriangle,
    color: "text-red-500",
    gradient: "from-red-500/10 to-red-500/5",
    href: "/tech-mastry/git-mastery/conflict-resolution",
    level: "Avancé" as Level,
    tags: ["Merge Conflicts", "3-way Merge", "Rerere", "Diff3", "Outils"],
  },
  {
    title: "Git Hooks & Automatisation",
    description:
      "Pre-commit, commit-msg, pre-push, Husky, lint-staged. Automatisez vos vérifications de qualité.",
    icon: Webhook,
    color: "text-cyan-500",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    href: "/tech-mastry/git-mastery/git-hooks",
    level: "Avancé" as Level,
    tags: [
      "Husky",
      "lint-staged",
      "Pre-commit",
      "CI Integration",
      "Commitlint",
    ],
  },
];

const levelColors: Record<Level, string> = {
  Fondamental: "bg-green-500/10 text-green-500 border-green-500/20",
  Avancé: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function GitTopicsList() {
  const [filter, setFilter] = useState<Level | "all">("all");
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.level === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Modules</h2>
        <div className="flex gap-2">
          {(["all", "Fondamental", "Avancé", "Expert"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === d ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
            >
              {d === "all" ? "Tous" : d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card
              className={`p-6 h-full border-border/40 hover:border-orange-500/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${topic.gradient}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-background/50 ${topic.color}`}
                  >
                    <topic.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                </div>
                <Badge variant="secondary" className={levelColors[topic.level]}>
                  {topic.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {topic.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topic.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explorer <ArrowRight className="w-3 h-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
