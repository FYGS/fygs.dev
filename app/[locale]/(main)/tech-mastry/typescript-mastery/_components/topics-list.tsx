"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Braces, Puzzle, Shield, Layers, Cpu, Swords, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Level = "Intermédiaire" | "Avancé" | "Expert";

const topics = [
  {
    title: "Types Avancés",
    description: "Mapped types, conditional types, template literal types, discriminated unions, branded types, infer et syntaxe moderne (satisfies, using, décorateurs).",
    icon: Braces,
    color: "text-blue-500",
    gradient: "from-blue-500/10 to-blue-500/5",
    href: "/tech-mastry/typescript-mastery/advanced-types",
    level: "Avancé" as Level,
    tags: ["Mapped Types", "Conditional", "Template Literals", "Infer", "Discriminated Unions", "Branded Types", "satisfies"],
  },
  {
    title: "Generics Deep Dive",
    description: "Contraintes, inférence, const type parameters et NoInfer, generics récursifs, higher-kinded types simulés et builder typé.",
    icon: Puzzle,
    color: "text-purple-500",
    gradient: "from-purple-500/10 to-purple-500/5",
    href: "/tech-mastry/typescript-mastery/generics-deep-dive",
    level: "Avancé" as Level,
    tags: ["Constraints", "Inférence", "const / NoInfer", "Récursif", "Builder Pattern"],
  },
  {
    title: "Type Challenges",
    description: "Exercices progressifs de type-level programming : de Easy à Extreme, inspirés de type-challenges.",
    icon: Swords,
    color: "text-red-500",
    gradient: "from-red-500/10 to-red-500/5",
    href: "/tech-mastry/typescript-mastery/type-challenges",
    level: "Expert" as Level,
    tags: ["Easy", "Medium", "Hard", "Extreme", "type-challenges"],
  },
  {
    title: "Design Patterns Typés",
    description: "Builder, Strategy, State Machine, Repository typés. Patterns qui exploitent le système de types.",
    icon: Layers,
    color: "text-orange-500",
    gradient: "from-orange-500/10 to-orange-500/5",
    href: "/tech-mastry/typescript-mastery/design-patterns",
    level: "Avancé" as Level,
    tags: ["Builder", "Strategy", "State Machine", "Repository", "Generics"],
  },
  {
    title: "Sécurité au Runtime",
    description: "Zod, type guards, assertion functions, Result typé, variables d'environnement et narrowing exhaustif. Validez vos données à la frontière du système.",
    icon: Shield,
    color: "text-green-500",
    gradient: "from-green-500/10 to-green-500/5",
    href: "/tech-mastry/typescript-mastery/runtime-safety",
    level: "Intermédiaire" as Level,
    tags: ["Zod", "Type Guards", "Assertions", "Result", "Env", "Exhaustivité"],
  },
  {
    title: "Compiler API & Configuration",
    description: "tsconfig avancé, migration TS 6 / TS 7 (compilateur natif), project references, AST, transformers, codemods et règles de lint personnalisées.",
    icon: Cpu,
    color: "text-cyan-500",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    href: "/tech-mastry/typescript-mastery/compiler-api",
    level: "Expert" as Level,
    tags: ["tsconfig", "TS 6 / 7", "Project References", "AST", "Codemods", "Transformers"],
  },
];

const levelColors: Record<Level, string> = {
  "Intermédiaire": "bg-green-500/10 text-green-500 border-green-500/20",
  "Avancé": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Expert": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function TypeScriptTopicsList() {
  const [filter, setFilter] = useState<Level | "all">("all");
  const filtered = filter === "all" ? topics : topics.filter((t) => t.level === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Modules</h2>
        <div className="flex gap-2">
          {(["all", "Intermédiaire", "Avancé", "Expert"] as const).map((d) => (
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
              className={`p-6 h-full border-border/40 hover:border-blue-500/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${topic.gradient}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-background/50 ${topic.color}`}>
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
              <p className="text-sm text-muted-foreground">{topic.description}</p>
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