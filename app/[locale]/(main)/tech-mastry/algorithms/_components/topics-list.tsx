"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  TrendingUp,
  Boxes,
  ArrowUpDown,
  Search,
  Cpu,
  GitBranch,
  Target,
  Undo2,
  ArrowRight,
} from "lucide-react";

type Difficulty = "Fondamental" | "Intermédiaire" | "Avancé";

type Topic = {
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  href: string;
  icon: typeof TrendingUp;
  color: string;
  gradient: string;
};

export const topics: Topic[] = [
  {
    title: "Complexité Algorithmique",
    description:
      "Comprendre et analyser la complexité temporelle et spatiale des algorithmes.",
    difficulty: "Fondamental",
    topics: ["Notation Big O", "Analyse de cas", "Optimisation", "Amortized"],
    href: "/tech-mastry/algorithms/complexity",
    icon: TrendingUp,
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
  },
  {
    title: "Structures de Données",
    description:
      "Les structures de données essentielles et leurs applications en situation réelle.",
    difficulty: "Intermédiaire",
    topics: [
      "Arrays",
      "LinkedList",
      "HashTable",
      "Tree",
      "Graph",
      "Heap",
    ],
    href: "/tech-mastry/algorithms/data-structures",
    icon: Boxes,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Algorithmes de Tri",
    description:
      "Implémentation, analyse et visualisation des algorithmes de tri classiques.",
    difficulty: "Intermédiaire",
    topics: ["QuickSort", "MergeSort", "HeapSort", "InsertionSort", "Timsort"],
    href: "/tech-mastry/algorithms/sorting",
    icon: ArrowUpDown,
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Recherche & Parcours",
    description:
      "Techniques de recherche dans des données triées ou non : linéaire, binaire, interpolation, exponentielle, ternaire et hachage.",
    difficulty: "Intermédiaire",
    topics: [
      "Linear Search",
      "Binary Search",
      "Interpolation",
      "Exponential",
      "Ternary",
      "Hash Search",
    ],
    href: "/tech-mastry/algorithms/searching",
    icon: Search,
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
  {
    title: "Programmation Dynamique",
    description:
      "Résolution de problèmes complexes par décomposition en sous-problèmes.",
    difficulty: "Avancé",
    topics: ["Memoization", "Tabulation", "Knapsack", "LCS", "Edit Distance"],
    href: "/tech-mastry/algorithms/dynamic-programming",
    icon: Cpu,
    color: "text-orange-400",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  {
    title: "Algorithmes de Graphes",
    description:
      "Parcours, plus courts chemins, arbres couvrants et détection de cycles.",
    difficulty: "Avancé",
    topics: [
      "BFS/DFS",
      "Dijkstra",
      "Bellman-Ford",
      "Kruskal",
      "Topological Sort",
    ],
    href: "/tech-mastry/algorithms/graph-algorithms",
    icon: GitBranch,
    color: "text-pink-400",
    gradient: "from-pink-500/10 to-pink-500/5",
  },
  {
    title: "Algorithmes Gloutons",
    description:
      "Choix localement optimal à chaque étape pour atteindre l'optimum global.",
    difficulty: "Intermédiaire",
    topics: [
      "Activity Selection",
      "Huffman",
      "Fractional Knapsack",
      "Job Scheduling",
    ],
    href: "/tech-mastry/algorithms/greedy",
    icon: Target,
    color: "text-yellow-400",
    gradient: "from-yellow-500/10 to-yellow-500/5",
  },
  {
    title: "Backtracking",
    description:
      "Exploration systématique de l'espace des solutions avec retour arrière.",
    difficulty: "Avancé",
    topics: ["N-Queens", "Sudoku Solver", "Permutations", "Subset Sum"],
    href: "/tech-mastry/algorithms/backtracking",
    icon: Undo2,
    color: "text-red-400",
    gradient: "from-red-500/10 to-red-500/5",
  },
];

const difficultyColors: Record<Difficulty, string> = {
  Fondamental: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Avancé: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function TopicsList() {
  const [filter, setFilter] = useState<Difficulty | "all">("all");
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.difficulty === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Sujets</h2>
        <div className="flex gap-2">
          {(["all", "Fondamental", "Intermédiaire", "Avancé"] as const).map(
            (d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === d ? "bg-primary/10 text-primary border-primary/30" : "border-border/40 text-muted-foreground"}`}
              >
                {d === "all" ? "Tous" : d}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link key={topic.title} href={topic.href}>
              <Card
                className={`p-6 h-full border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${topic.gradient}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-background/50 ${topic.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {topic.title}
                    </h2>
                  </div>
                  <Badge
                    variant="secondary"
                    className={difficultyColors[topic.difficulty]}
                  >
                    {topic.difficulty}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {topic.topics.map((t) => (
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
          );
        })}
      </div>
    </section>
  );
}
