"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { Layers, Puzzle, Shield, Building2, ArrowRight } from "lucide-react";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

interface Topic {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
  icon: typeof Layers;
  color: string;
  gradient: string;
}

const topics: Topic[] = [
  {
    title: "Clean Architecture",
    description:
      "Architecture en couches avec séparation claire des responsabilités et règle de dépendance.",
    category: "Avancé",
    topics: ["Couches", "Dépendances", "Use Cases", "Ports & Adapters"],
    href: "/tech-mastry/architecture/clean-architecture",
    icon: Layers,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Design Patterns",
    description:
      "Catalogue complet des patterns de conception : Creational, Structural et Behavioral.",
    category: "Intermédiaire",
    topics: ["Singleton", "Factory", "Observer", "Strategy", "Decorator"],
    href: "/tech-mastry/architecture/design-patterns",
    icon: Puzzle,
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Principes SOLID",
    description:
      "Les 5 principes fondamentaux de la programmation orientée objet pour un code maintenable.",
    category: "Fondamental",
    topics: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    href: "/tech-mastry/architecture/solid",
    icon: Shield,
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
  },
  {
    title: "Domain-Driven Design",
    description:
      "Conception pilotée par le domaine métier : Bounded Contexts, Aggregates et modélisation.",
    category: "Expert",
    topics: [
      "Bounded Context",
      "Aggregate",
      "Entity",
      "Value Object",
      "Repository",
    ],
    href: "/tech-mastry/architecture/ddd",
    icon: Building2,
    color: "text-orange-400",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Avancé: "bg-red-500/10 text-red-500 border-red-500/20",
  Expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function ArchitectureTopics() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.category === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Piliers</h2>
        <div className="flex gap-2">
          {(
            ["all", "Fondamental", "Intermédiaire", "Avancé", "Expert"] as const
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
        {filtered.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link key={topic.title} href={topic.href}>
              <Card
                className={`p-6 h-full border-border/40 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 space-y-4 group bg-gradient-to-br ${topic.gradient}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-background/50 ${topic.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold group-hover:text-indigo-500 transition-colors">
                      {topic.title}
                    </h2>
                  </div>
                  <Badge
                    variant="secondary"
                    className={categoryColors[topic.category]}
                  >
                    {topic.category}
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

                <div className="flex items-center gap-1 text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
