"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Sigma,
  Brain,
  Cpu,
  Database,
  GitBranch,
  ArrowRight,
} from "lucide-react";

type Level = "all" | "fondamental" | "intermédiaire" | "avancé";

const topics = [
  {
    slug: "python-data",
    title: "Python pour la Data",
    desc: "NumPy, Pandas, Matplotlib, Seaborn — manipulation et visualisation de données",
    icon: FlaskConical,
    level: "fondamental" as const,
    color: "from-blue-500/20 to-blue-600/5",
  },
  {
    slug: "statistics",
    title: "Statistiques & Probabilités",
    desc: "Distributions, tests d'hypothèses, intervalles de confiance, stats bayésiennes",
    icon: Sigma,
    level: "fondamental" as const,
    color: "from-green-500/20 to-green-600/5",
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    desc: "Supervisé, non-supervisé, évaluation, sélection de features, pipelines ML",
    icon: Brain,
    level: "intermédiaire" as const,
    color: "from-amber-500/20 to-amber-600/5",
  },
  {
    slug: "deep-learning",
    title: "Deep Learning",
    desc: "Réseaux de neurones, CNN, RNN, Transformers, architectures modernes",
    icon: Cpu,
    level: "avancé" as const,
    color: "from-red-500/20 to-red-600/5",
  },
  {
    slug: "data-engineering",
    title: "Data Engineering",
    desc: "ETL, pipelines de données, Big Data, data warehouses, streaming",
    icon: Database,
    level: "intermédiaire" as const,
    color: "from-cyan-500/20 to-cyan-600/5",
  },
  {
    slug: "mlops",
    title: "MLOps & Déploiement",
    desc: "CI/CD ML, monitoring, versioning de modèles, infrastructure ML en production",
    icon: GitBranch,
    level: "avancé" as const,
    color: "from-teal-500/20 to-teal-600/5",
  },
];

const filters: { key: Level; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "fondamental", label: "Fondamental" },
  { key: "intermédiaire", label: "Intermédiaire" },
  { key: "avancé", label: "Avancé" },
];

export function DataScienceTopics() {
  const [filter, setFilter] = useState<Level>("all");
  const visible =
    filter === "all" ? topics : topics.filter((t) => t.level === filter);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Parcours complet</h2>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((t) => (
          <Link key={t.slug} href={`/tech-mastry/data-science/${t.slug}`}>
            <Card
              className={`group relative p-5 bg-gradient-to-br ${t.color} border-border/30 hover:border-primary/40 transition-all duration-300 hover:shadow-lg cursor-pointer h-full`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/60">
                  <t.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.title}</h3>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                <span className="text-[10px] text-muted-foreground">
                  Explorer le module
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
