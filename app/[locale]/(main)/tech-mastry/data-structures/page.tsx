import type { Metadata } from "next";
import { DataStructuresGuide } from "./_components/data-structures-guide";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Database, Code2, Binary, GitMerge, Layers, Hash } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Structures de Données | Guide de Préparation aux Entretiens Techniques",
  description:
    "Guide complet sur les structures de données essentielles pour les entretiens techniques : tableaux, listes chaînées, arbres binaires, tables de hachage et plus encore.",
};

const subPages = [
  {
    title: "Tableaux & Chaînes",
    href: "/tech-mastry/data-structures/arrays",
    icon: Code2,
    description:
      "Manipulation des tableaux, recherche, tri et techniques Two Pointers / Sliding Window.",
    badge: "Essentiel",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Listes Chaînées",
    href: "/tech-mastry/data-structures/lists",
    icon: GitMerge,
    description:
      "Listes simplement et doublement chaînées, détection de cycles, inversions.",
    badge: "Essentiel",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Arbres",
    href: "/tech-mastry/data-structures/trees",
    icon: GitMerge,
    description:
      "Arbres binaires, BST, AVL, parcours in-order/pre-order/post-order/level-order.",
    badge: "Avancé",
    color: "from-purple-500/20 to-violet-500/20",
  },
  {
    title: "Hash Maps",
    href: "/tech-mastry/data-structures/hash-maps",
    icon: Hash,
    description:
      "Fonctions de hachage, résolution de collisions, implémentation complète.",
    badge: "Nouveau",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    title: "Graphes",
    href: "/tech-mastry/data-structures/graphs",
    icon: Binary,
    description:
      "Représentations, BFS, DFS, Dijkstra, détection de cycles, tri topologique.",
    badge: "Avancé",
    color: "from-red-500/20 to-rose-500/20",
  },
  {
    title: "Heaps & Files de Priorité",
    href: "/tech-mastry/data-structures/heaps",
    icon: Layers,
    description:
      "Min/Max Heap, heapify, applications aux files de priorité et tri par tas.",
    badge: "Nouveau",
    color: "from-teal-500/20 to-cyan-500/20",
  },
  {
    title: "Piles & Files",
    href: "/tech-mastry/data-structures/stacks-queues",
    icon: Layers,
    description:
      "Structures LIFO/FIFO, implémentations, parenthèses valides, évaluation d'expressions.",
    badge: "Nouveau",
    color: "from-indigo-500/20 to-blue-500/20",
  },
];

export default function DataStructuresPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 mb-2">
          <Database className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold">Structures de Données</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Maîtrisez les structures de données essentielles pour les entretiens
          techniques. Chaque structure avec complexité, implémentation et cas
          d&apos;usage.
        </p>
      </div>

      {/* Sub-pages Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="h-full p-5 hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg bg-linear-to-br ${page.color} shrink-0`}
                >
                  <page.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {page.title}
                    </h3>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {page.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Full Guide */}
      <DataStructuresGuide />
    </main>
  );
}
