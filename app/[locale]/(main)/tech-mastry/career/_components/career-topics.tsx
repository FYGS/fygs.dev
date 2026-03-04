"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const topics = [
  {
    title: "Négociation Salariale",
    description:
      "Framework en 5 étapes, scripts de négociation, recherche de marché et mises en situation.",
    icon: DollarSign,
    color: "text-emerald-500",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    href: "/tech-mastry/career/salary-negotiation",
    tags: ["Salaire", "Stratégies", "Scripts", "Contre-offre", "Data-driven"],
  },
  {
    title: "Progression de Carrière",
    description:
      "Échelle de carrière, matrice de compétences, IC vs Management et personal branding.",
    icon: TrendingUp,
    color: "text-blue-500",
    gradient: "from-blue-500/10 to-blue-500/5",
    href: "/tech-mastry/career/progression",
    tags: ["Junior → Senior", "Staff", "IC Track", "Management", "Mentoring"],
  },
  {
    title: "Conseils d'Entretien",
    description:
      "Méthode STAR, présentation technique, questions comportementales et checklist pré-entretien.",
    icon: UserCheck,
    color: "text-purple-500",
    gradient: "from-purple-500/10 to-purple-500/5",
    href: "/tech-mastry/career/interview-tips",
    tags: ["STAR", "Behavioral", "Présentation", "Recherche", "Red Flags"],
  },
];

export function CareerTopics() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Explorer les Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card
              className={`p-6 h-full border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${topic.gradient}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-background/50 ${topic.color}`}
                >
                  <topic.icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {topic.title}
                </h2>
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
