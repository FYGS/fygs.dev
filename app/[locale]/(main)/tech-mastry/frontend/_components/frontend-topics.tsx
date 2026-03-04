"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  Component,
  Zap,
  Layers,
  Puzzle,
  TestTube,
  Eye,
  Palette,
  Globe,
  ArrowRight,
} from "lucide-react";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

type Topic = {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
  icon: typeof Component;
  color: string;
  gradient: string;
};

const topics: Topic[] = [
  {
    title: "React Fondamentaux",
    description: "Les concepts essentiels de React et son écosystème moderne.",
    category: "Fondamental",
    topics: ["Hooks", "Components", "Props & State", "Context", "Refs"],
    href: "/tech-mastry/frontend/react-basics",
    icon: Component,
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
  {
    title: "Performance & Optimisation",
    description:
      "Techniques d'optimisation des applications React pour une UX fluide.",
    category: "Avancé",
    topics: [
      "Memoization",
      "Code Splitting",
      "Bundle Size",
      "Virtualization",
      "Profiler",
    ],
    href: "/tech-mastry/frontend/performance",
    icon: Zap,
    color: "text-yellow-400",
    gradient: "from-yellow-500/10 to-yellow-500/5",
  },
  {
    title: "State Management",
    description:
      "Gestion avancée de l'état dans les applications React modernes.",
    category: "Intermédiaire",
    topics: ["Redux", "Zustand", "React Query", "Context API", "Jotai"],
    href: "/tech-mastry/frontend/state-management",
    icon: Layers,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Component Patterns",
    description:
      "Patterns de conception avancés pour des composants réutilisables.",
    category: "Avancé",
    topics: [
      "Compound Components",
      "Render Props",
      "HOC",
      "Custom Hooks",
      "Headless",
    ],
    href: "/tech-mastry/frontend/component-patterns",
    icon: Puzzle,
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Testing & Qualité",
    description: "Stratégies de test complètes et assurance qualité.",
    category: "Intermédiaire",
    topics: ["Vitest", "React Testing Library", "Playwright", "MSW", "CI/CD"],
    href: "/tech-mastry/frontend/testing",
    icon: TestTube,
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
  },
  {
    title: "CSS Avancé",
    description: "Techniques CSS modernes et systèmes de design.",
    category: "Intermédiaire",
    topics: [
      "Grid",
      "Animations",
      "Container Queries",
      "Custom Properties",
      "Tailwind",
    ],
    href: "/tech-mastry/frontend/css-advanced",
    icon: Palette,
    color: "text-pink-400",
    gradient: "from-pink-500/10 to-pink-500/5",
  },
  {
    title: "Accessibilité & UX",
    description:
      "Création d'interfaces accessibles, conformes WCAG et inclusives.",
    category: "Expert",
    topics: [
      "ARIA",
      "Keyboard Nav",
      "Color Contrast",
      "Screen Readers",
      "Focus Management",
    ],
    href: "/tech-mastry/frontend/accessibility",
    icon: Eye,
    color: "text-orange-400",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  {
    title: "Next.js Patterns",
    description: "Server Components, Actions, caching et patterns Next.js 15+.",
    category: "Expert",
    topics: ["RSC", "Server Actions", "ISR", "Middleware", "Parallel Routes"],
    href: "/tech-mastry/frontend/nextjs-patterns",
    icon: Globe,
    color: "text-white",
    gradient: "from-neutral-500/10 to-neutral-500/5",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Avancé: "bg-red-500/10 text-red-500 border-red-500/20",
  Expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function FrontendTopics() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.category === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Modules</h2>
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
