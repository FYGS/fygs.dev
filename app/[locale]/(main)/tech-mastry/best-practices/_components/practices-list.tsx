"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { type Category } from "./practice-header";
import {
  MessageSquare,
  Puzzle,
  Code2,
  CalendarCheck,
  HelpCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";

type Practice = {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
  icon: typeof MessageSquare;
  color: string;
  gradient: string;
};

const practices: Practice[] = [
  {
    title: "Communication",
    description:
      "Comment communiquer efficacement pendant un entretien technique.",
    category: "Soft Skills",
    topics: ["Clarification", "Pensée à voix haute", "Questions pertinentes"],
    href: "/tech-mastry/best-practices/communication",
    icon: MessageSquare,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Problem Solving",
    description: "Approche structurée pour résoudre des problèmes techniques.",
    category: "Technique",
    topics: ["STAR Method", "Edge Cases", "Optimisation", "Trade-offs"],
    href: "/tech-mastry/best-practices/problem-solving",
    icon: Puzzle,
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
  },
  {
    title: "Code Quality",
    description: "Bonnes pratiques pour écrire du code propre et maintenable.",
    category: "Technique",
    topics: ["Clean Code", "Tests", "Documentation", "SOLID"],
    href: "/tech-mastry/best-practices/code-quality",
    icon: Code2,
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
  {
    title: "Préparation",
    description:
      "Comment se préparer efficacement pour un entretien technique.",
    category: "Organisation",
    topics: ["Planning", "Mock Interviews", "Resources", "Timeline"],
    href: "/tech-mastry/best-practices/preparation",
    icon: CalendarCheck,
    color: "text-yellow-400",
    gradient: "from-yellow-500/10 to-yellow-500/5",
  },
  {
    title: "Questions & Réponses",
    description: "Questions courantes et stratégies de réponse efficaces.",
    category: "Soft Skills",
    topics: ["Behavioral", "Technical", "Culture Fit", "Follow-up"],
    href: "/tech-mastry/best-practices/qa",
    icon: HelpCircle,
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Négociation",
    description: "Techniques de négociation pour le salaire et les avantages.",
    category: "Carrière",
    topics: ["Salaire", "Avantages", "Contre-offres", "Equity"],
    href: "/tech-mastry/best-practices/negotiation",
    icon: DollarSign,
    color: "text-emerald-400",
    gradient: "from-emerald-500/10 to-emerald-500/5",
  },
];

const categoryColors: Record<Category, string> = {
  "Soft Skills": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Technique: "bg-green-500/10 text-green-500 border-green-500/20",
  Organisation: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Carrière: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function PracticesList() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const filtered =
    filter === "all"
      ? practices
      : practices.filter((p) => p.category === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Pratiques</h2>
        <div className="flex gap-2">
          {(
            [
              "all",
              "Soft Skills",
              "Technique",
              "Organisation",
              "Carrière",
            ] as const
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
        {filtered.map((practice) => {
          const Icon = practice.icon;
          return (
            <Link key={practice.title} href={practice.href}>
              <Card
                className={`p-6 h-full border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${practice.gradient}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-background/50 ${practice.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {practice.title}
                    </h2>
                  </div>
                  <Badge
                    variant="secondary"
                    className={categoryColors[practice.category]}
                  >
                    {practice.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {practice.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {practice.topics.map((topic) => (
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
