"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Cloud,
  Container,
  GitBranch,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Category = "Sécurité" | "DevOps" | "Cloud";

const topics = [
  {
    title: "OWASP Top 10",
    description:
      "Les 10 vulnérabilités web les plus critiques avec code vulnérable vs sécurisé.",
    icon: ShieldAlert,
    color: "text-red-500",
    gradient: "from-red-500/10 to-red-500/5",
    href: "/tech-mastry/security-devops/owasp-top-10",
    category: "Sécurité" as Category,
    tags: ["XSS", "SQL Injection", "CSRF", "Auth", "SSRF"],
  },
  {
    title: "CI/CD Pipelines",
    description:
      "Conception et optimisation de pipelines d'intégration et déploiement continus.",
    icon: GitBranch,
    color: "text-blue-500",
    gradient: "from-blue-500/10 to-blue-500/5",
    href: "/tech-mastry/security-devops/cicd",
    category: "DevOps" as Category,
    tags: ["GitHub Actions", "Pipelines", "Déploiement", "Tests", "Artifacts"],
  },
  {
    title: "Docker & Kubernetes",
    description:
      "Conteneurisation et orchestration pour des déploiements fiables et scalables.",
    icon: Container,
    color: "text-cyan-500",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    href: "/tech-mastry/security-devops/docker-kubernetes",
    category: "DevOps" as Category,
    tags: ["Containers", "Pods", "Services", "Helm", "Multi-stage"],
  },
  {
    title: "Cloud Native",
    description:
      "Architecture 12-Factor, serverless et bonnes pratiques cloud.",
    icon: Cloud,
    color: "text-purple-500",
    gradient: "from-purple-500/10 to-purple-500/5",
    href: "/tech-mastry/security-devops/cloud-native",
    category: "Cloud" as Category,
    tags: ["12-Factor", "Serverless", "AWS/GCP/Azure", "IaC", "Terraform"],
  },
];

const categoryColors: Record<Category, string> = {
  Sécurité: "bg-red-500/10 text-red-500 border-red-500/20",
  DevOps: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Cloud: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function SecurityTopics() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.category === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Domaines</h2>
        <div className="flex gap-2">
          {(["all", "Sécurité", "DevOps", "Cloud"] as const).map((d) => (
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
              className={`p-6 h-full border-border/40 hover:border-yellow-500/30 hover:shadow-xl transition-all duration-300 space-y-4 group bg-gradient-to-br ${topic.gradient}`}
            >
              <div className="flex items-start justify-between">
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
