"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Server,
  Database,
  Shield,
  Layers,
  Zap,
  Terminal,
  GitBranch,
  MessageSquare,
  ArrowRight,
  Users,
} from "lucide-react";
import { useState, type ComponentType } from "react";

type Category = "Fondamental" | "Intermédiaire" | "Avancé" | "Expert";

type Topic = {
  title: string;
  description: string;
  category: Category;
  topics: string[];
  href: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  progress?: number;
};

const topics: Topic[] = [
  {
    title: "API Design & REST",
    description:
      "Concevez des APIs RESTful, GraphQL et gRPC robustes — bonnes pratiques, versioning, documentation.",
    category: "Fondamental",
    topics: ["REST", "GraphQL", "gRPC", "WebSocket", "OpenAPI"],
    href: "/tech-mastry/backend/api-design",
    icon: Server,
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    title: "Bases de Données",
    description:
      "SQL vs NoSQL, indexation, transactions ACID, optimisation de requêtes et modélisation.",
    category: "Avancé",
    topics: ["PostgreSQL", "MongoDB", "Redis", "Indexation", "Transactions"],
    href: "/tech-mastry/backend/databases",
    icon: Database,
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    title: "Authentification & Autorisation",
    description:
      "JWT, OAuth 2.0, sessions, RBAC, gestion des tokens et flux d'authentification sécurisés.",
    category: "Intermédiaire",
    topics: ["JWT", "OAuth 2.0", "RBAC", "Sessions", "SSO"],
    href: "/tech-mastry/backend/authentication",
    icon: Users,
    gradient: "from-teal-500/10 to-cyan-500/10",
  },
  {
    title: "Sécurité Backend",
    description:
      "OWASP Top 10, validation d'entrées, chiffrement, rate limiting et protection contre les attaques.",
    category: "Intermédiaire",
    topics: ["OWASP", "Encryption", "CORS", "CSP", "Rate Limiting"],
    href: "/tech-mastry/backend/security",
    icon: Shield,
    gradient: "from-red-500/10 to-pink-500/10",
  },
  {
    title: "Architecture & Patterns",
    description:
      "Clean Architecture, Hexagonal, CQRS, Event Sourcing, microservices et design patterns.",
    category: "Avancé",
    topics: ["Clean Arch", "Hexagonal", "CQRS", "Microservices", "DDD"],
    href: "/tech-mastry/backend/architecture",
    icon: Layers,
    gradient: "from-purple-500/10 to-indigo-500/10",
  },
  {
    title: "Performance & Scaling",
    description:
      "Caching multi-niveaux, load balancing, profiling, lazy loading et optimisation N+1.",
    category: "Avancé",
    topics: [
      "Redis Cache",
      "Load Balancing",
      "Profiling",
      "CDN",
      "Connection Pooling",
    ],
    href: "/tech-mastry/backend/performance",
    icon: Zap,
    gradient: "from-yellow-500/10 to-amber-500/10",
  },
  {
    title: "Testing Backend",
    description:
      "Tests unitaires, d'intégration, E2E, TDD, test de charge et stratégies de couverture.",
    category: "Intermédiaire",
    topics: ["Unit Tests", "Integration", "E2E", "TDD", "Load Testing"],
    href: "/tech-mastry/backend/testing",
    icon: GitBranch,
    gradient: "from-cyan-500/10 to-blue-500/10",
  },
  {
    title: "Messaging & Queues",
    description:
      "Message brokers, event-driven architecture, pub/sub, workers et traitement asynchrone.",
    category: "Expert",
    topics: ["RabbitMQ", "Kafka", "Bull/BullMQ", "Pub/Sub", "CQRS Events"],
    href: "/tech-mastry/backend/messaging",
    icon: MessageSquare,
    gradient: "from-orange-500/10 to-red-500/10",
  },
  {
    title: "DevOps & Infrastructure",
    description:
      "Docker, CI/CD, monitoring, infrastructure as code et déploiement cloud-native.",
    category: "Expert",
    topics: ["Docker", "CI/CD", "Monitoring", "IaC", "Kubernetes"],
    href: "/tech-mastry/backend/devops",
    icon: Terminal,
    gradient: "from-emerald-500/10 to-green-500/10",
  },
];

const categoryColors: Record<Category, string> = {
  Fondamental: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermédiaire: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Avancé: "bg-red-500/10 text-red-500 border-red-500/20",
  Expert: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const categoryOrder: Category[] = [
  "Fondamental",
  "Intermédiaire",
  "Avancé",
  "Expert",
];

export function BackendTopics() {
  const [activeFilter, setActiveFilter] = useState<Category | "all">("all");

  const filtered =
    activeFilter === "all"
      ? topics
      : topics.filter((t) => t.category === activeFilter);

  return (
    <section className="space-y-8">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border/40 text-muted-foreground hover:border-primary/30"
          }`}
        >
          Tous ({topics.length})
        </button>
        {categoryOrder.map((cat) => {
          const count = topics.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeFilter === cat
                  ? categoryColors[cat] + " border-current"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sections", value: topics.length, color: "text-blue-400" },
          {
            label: "Concepts",
            value: topics.reduce((a, t) => a + t.topics.length, 0),
            color: "text-green-400",
          },
          { label: "Interactif", value: "100%", color: "text-purple-400" },
          { label: "Niveaux", value: "4", color: "text-orange-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="text-center p-3 rounded-xl bg-card border border-border/40"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Topic cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((topic) => (
          <Link key={topic.title} href={topic.href}>
            <Card className="group relative overflow-hidden h-full p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/40 hover:border-primary/30">
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <topic.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${categoryColors[topic.category]}`}
                  >
                    {topic.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {topic.topics.slice(0, 4).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                  {topic.topics.length > 4 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-muted-foreground"
                    >
                      +{topic.topics.length - 4}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors pt-2">
                  <span>Explorer</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
