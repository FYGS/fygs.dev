"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  Scale,
  Server,
  Database,
  Shield,
  Activity,
  FileText,
  PenTool,
  Building2,
  ArrowRight,
} from "lucide-react";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

type Topic = {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
  icon: typeof Scale;
  color: string;
  gradient: string;
};

const topics: Topic[] = [
  {
    title: "Scalabilité & Performance",
    description:
      "Techniques pour concevoir des systèmes hautement évolutifs et performants.",
    category: "Fondamental",
    topics: [
      "Load Balancing",
      "Caching",
      "Database Sharding",
      "CDN",
      "Auto-Scaling",
    ],
    href: "/tech-mastry/system-design/scalability",
    icon: Scale,
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-500/5",
  },
  {
    title: "Architecture Distribuée",
    description: "Conception de systèmes distribués robustes et fiables.",
    category: "Avancé",
    topics: [
      "Microservices",
      "Event-Driven",
      "Message Queues",
      "Service Mesh",
      "CQRS",
    ],
    href: "/tech-mastry/system-design/distributed",
    icon: Server,
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "Stockage & Bases de Données",
    description:
      "Choix et conception des systèmes de stockage de données à grande échelle.",
    category: "Intermédiaire",
    topics: [
      "SQL vs NoSQL",
      "ACID",
      "Réplication",
      "Partitionnement",
      "Consistency",
    ],
    href: "/tech-mastry/system-design/storage",
    icon: Database,
    color: "text-orange-400",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  {
    title: "Sécurité & Authentification",
    description:
      "Sécurisation des systèmes et gestion des identités à l'échelle.",
    category: "Intermédiaire",
    topics: ["OAuth", "JWT", "SSL/TLS", "Rate Limiting", "Zero Trust"],
    href: "/tech-mastry/system-design/security",
    icon: Shield,
    color: "text-red-400",
    gradient: "from-red-500/10 to-red-500/5",
  },
  {
    title: "Monitoring & Fiabilité",
    description:
      "Surveillance, observabilité et maintenance des systèmes critiques.",
    category: "Avancé",
    topics: ["Logging", "Metrics", "Alerting", "SLO/SLA", "Chaos Engineering"],
    href: "/tech-mastry/system-design/monitoring",
    icon: Activity,
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
  {
    title: "Architecture Studio",
    description:
      "Outil de diagramme pour assembler clients, passerelles, services, caches et bases de données à partir de modèles.",
    category: "Intermédiaire",
    topics: [
      "Diagramme interactif",
      "Modèles d'architecture",
      "Load Balancer",
      "Cache",
      "CDN",
    ],
    href: "/tech-mastry/system-design/architecture",
    icon: Building2,
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    title: "Études de Cas",
    description: "Analyses détaillées de systèmes réels à grande échelle.",
    category: "Expert",
    topics: [
      "URL Shortener",
      "Chat System",
      "Social Network",
      "Video Streaming",
      "E-Commerce",
    ],
    href: "/tech-mastry/system-design/case-studies",
    icon: FileText,
    color: "text-yellow-400",
    gradient: "from-yellow-500/10 to-yellow-500/5",
  },
  {
    title: "Whiteboard Interactif",
    description: "Exercices guidés de conception système étape par étape.",
    category: "Expert",
    topics: [
      "Design Process",
      "Estimation",
      "Trade-offs",
      "Diagrammes",
      "Présentation",
    ],
    href: "/tech-mastry/system-design/whiteboard",
    icon: PenTool,
    color: "text-pink-400",
    gradient: "from-pink-500/10 to-pink-500/5",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Avancé: "bg-red-500/10 text-red-500 border-red-500/20",
  Expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function DesignTopics() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.category === filter);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Explorer les Domaines</h2>
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
