"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  GitMerge,
  ListTree,
  Hash,
  Network,
  ArrowUpDown,
  Layers,
  ArrowRight,
  Zap,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const categories = ["Tous", "Fondamental", "Intermédiaire", "Avancé"] as const;

const topics = [
  {
    title: "Tableaux & Chaînes",
    href: "/tech-mastry/data-structures/arrays",
    icon: Code2,
    description:
      "Manipulation avancée des tableaux, recherche, tri, techniques Two Pointers, Sliding Window, Kadane, et optimisations mémoire.",
    badge: "Fondamental",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "hover:border-blue-500/50",
    iconColor: "text-blue-500",
    complexity: "O(1) accès · O(n) recherche",
    interviewFreq: 95,
  },
  {
    title: "Listes Chaînées",
    href: "/tech-mastry/data-structures/lists",
    icon: GitMerge,
    description:
      "Listes simplement/doublement chaînées, détection de cycles (Floyd), fusion, inversions, et skip lists.",
    badge: "Fondamental",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "hover:border-green-500/50",
    iconColor: "text-green-500",
    complexity: "O(1) insertion · O(n) accès",
    interviewFreq: 85,
  },
  {
    title: "Arbres & BST",
    href: "/tech-mastry/data-structures/trees",
    icon: ListTree,
    description:
      "Arbres binaires, BST, AVL, Red-Black Trees, parcours DFS/BFS, sérialisation et arbres de segments.",
    badge: "Intermédiaire",
    color: "from-purple-500/20 to-violet-500/20",
    borderColor: "hover:border-purple-500/50",
    iconColor: "text-purple-500",
    complexity: "O(log n) recherche équilibrée",
    interviewFreq: 90,
  },
  {
    title: "Hash Maps & Sets",
    href: "/tech-mastry/data-structures/hash-maps",
    icon: Hash,
    description:
      "Fonctions de hachage, résolution de collisions (chaining / open addressing), load factor et rehashing.",
    badge: "Fondamental",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "hover:border-amber-500/50",
    iconColor: "text-amber-500",
    complexity: "O(1) moyen · O(n) pire cas",
    interviewFreq: 95,
  },
  {
    title: "Graphes",
    href: "/tech-mastry/data-structures/graphs",
    icon: Network,
    description:
      "Représentations, BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, Prim, topological sort et Union-Find.",
    badge: "Avancé",
    color: "from-cyan-500/20 to-teal-500/20",
    borderColor: "hover:border-cyan-500/50",
    iconColor: "text-cyan-500",
    complexity: "O(V+E) parcours standard",
    interviewFreq: 80,
  },
  {
    title: "Heaps & Priority Queues",
    href: "/tech-mastry/data-structures/heaps",
    icon: ArrowUpDown,
    description:
      "Min/Max Heap, heapify, heap sort, Top-K, médiane streaming et files de priorité indexées.",
    badge: "Intermédiaire",
    color: "from-violet-500/20 to-fuchsia-500/20",
    borderColor: "hover:border-violet-500/50",
    iconColor: "text-violet-500",
    complexity: "O(log n) insert/extract",
    interviewFreq: 75,
  },
  {
    title: "Piles & Files",
    href: "/tech-mastry/data-structures/stacks-queues",
    icon: Layers,
    description:
      "LIFO/FIFO, Deque, Monotonic Stack/Queue, expressions postfixées et circular buffer.",
    badge: "Fondamental",
    color: "from-teal-500/20 to-green-500/20",
    borderColor: "hover:border-teal-500/50",
    iconColor: "text-teal-500",
    complexity: "O(1) toutes opérations",
    interviewFreq: 85,
  },
];

export function DataStructuresTopics() {
  const [filter, setFilter] = useState<string>("Tous");

  const filtered =
    filter === "Tous" ? topics : topics.filter((t) => t.badge === filter);

  return (
    <section className="space-y-8">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Explorer les Structures
        </h2>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filter === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Topics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((topic) => (
          <Link key={topic.href} href={topic.href}>
            <Card
              className={`h-full p-5 transition-all group cursor-pointer border-border/40 ${topic.borderColor} hover:shadow-lg hover:shadow-primary/5`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${topic.color}`}
                  >
                    <topic.icon className={`w-5 h-5 ${topic.iconColor}`} />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {topic.badge}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                    {topic.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {topic.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    {topic.complexity}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-primary font-medium">
                      {topic.interviewFreq}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
