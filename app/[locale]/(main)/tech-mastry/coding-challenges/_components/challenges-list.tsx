"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  Type,
  ListOrdered,
  GitFork,
  Cpu,
  Network,
  Server,
  ArrowRight,
  Timer,
} from "lucide-react";

type Difficulty = "Facile" | "Intermédiaire" | "Difficile" | "Expert";

type Challenge = {
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  estimatedTime: string;
  href: string;
  icon: typeof Type;
  color: string;
  gradient: string;
};

const challenges: Challenge[] = [
  {
    title: "String Manipulation",
    description: "Série de défis sur la manipulation de chaînes de caractères.",
    difficulty: "Facile",
    topics: ["Palindrome", "Anagrammes", "Substring", "Regex"],
    estimatedTime: "30 min",
    href: "/tech-mastry/coding-challenges/strings",
    icon: Type,
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
  },
  {
    title: "Array Operations",
    description:
      "Défis sur les opérations de tableaux et les algorithmes de tri.",
    difficulty: "Intermédiaire",
    topics: ["Two Pointers", "Sliding Window", "Sorting", "Binary Search"],
    estimatedTime: "45 min",
    href: "/tech-mastry/coding-challenges/arrays",
    icon: ListOrdered,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Tree Traversal",
    description: "Problèmes de parcours et manipulation d'arbres binaires.",
    difficulty: "Difficile",
    topics: ["DFS", "BFS", "Binary Trees", "BST"],
    estimatedTime: "60 min",
    href: "/tech-mastry/coding-challenges/trees",
    icon: GitFork,
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Dynamic Programming",
    description: "Défis classiques de programmation dynamique.",
    difficulty: "Expert",
    topics: ["Memoization", "Tabulation", "Optimization", "Knapsack"],
    estimatedTime: "90 min",
    href: "/tech-mastry/coding-challenges/dp",
    icon: Cpu,
    color: "text-orange-400",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  {
    title: "Graph Problems",
    description: "Problèmes sur les graphes et les algorithmes de parcours.",
    difficulty: "Difficile",
    topics: ["Shortest Path", "Cycle Detection", "MST", "Topological Sort"],
    estimatedTime: "75 min",
    href: "/tech-mastry/coding-challenges/graphs",
    icon: Network,
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
  {
    title: "System Design",
    description: "Mini-défis de conception de systèmes distribués.",
    difficulty: "Expert",
    topics: ["Scalability", "Load Balancing", "Caching", "Microservices"],
    estimatedTime: "120 min",
    href: "/tech-mastry/coding-challenges/system-design",
    icon: Server,
    color: "text-red-400",
    gradient: "from-red-500/10 to-red-500/5",
  },
];

const difficultyColors: Record<Difficulty, string> = {
  Facile: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Difficile: "bg-red-500/10 text-red-500 border-red-500/20",
  Expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function ChallengesList() {
  const [filter, setFilter] = useState<Difficulty | "all">("all");
  const filtered =
    filter === "all"
      ? challenges
      : challenges.filter((c) => c.difficulty === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Défis Disponibles</h2>
        <div className="flex gap-2">
          {(
            ["all", "Facile", "Intermédiaire", "Difficile", "Expert"] as const
          ).map((d) => (
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
        {filtered.map((challenge) => {
          const Icon = challenge.icon;
          return (
            <Link key={challenge.title} href={challenge.href}>
              <Card
                className={`p-6 h-full border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${challenge.gradient}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-background/50 ${challenge.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {challenge.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={difficultyColors[challenge.difficulty]}
                    >
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Timer className="w-3 h-3" />
                      {challenge.estimatedTime}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {challenge.topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Commencer <ArrowRight className="w-3 h-3" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
