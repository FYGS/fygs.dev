"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Binary,
  Book,
  BrainCircuit,
  ChevronRight,
  Code2,
  Database,
  DollarSign,
  GitMerge,
  HelpCircle,
  Layers,
  MessagesSquare,
  Search,
  Server,
  Swords,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const topics = [
  {
    title: "Outils Pratiques",
    icon: Code2,
    items: [
      {
        title: "Code Playground",
        href: "/tech-mastry/playground",
        icon: Code2,
        description: "Environnement interactif de codage",
        badge: "Interactif",
      },
      {
        title: "Dashboard",
        href: "/tech-mastry/dashboard",
        icon: BarChart3,
        description: "Tableau de bord de progression",
      },
    ],
  },
  {
    title: "Algorithmes",
    icon: Code2,
    items: [
      {
        title: "Complexité",
        href: "/tech-mastry/algorithms/complexity",
        icon: Binary,
        description: "Analyse de la complexité temporelle et spatiale",
        badge: "Essentiel",
      },
      {
        title: "Tri",
        href: "/tech-mastry/algorithms/sorting",
        icon: GitMerge,
        description: "Algorithmes de tri et leurs applications",
      },
      {
        title: "Recherche",
        href: "/tech-mastry/algorithms/searching",
        icon: Search,
        description: "Techniques de recherche efficaces",
      },
      {
        title: "Structures de Données",
        href: "/tech-mastry/algorithms/data-structures",
        icon: Database,
        description: "Implémentations algorithmiques fondamentales",
        badge: "Nouveau",
      },
      {
        title: "Algorithmes Gloutons",
        href: "/tech-mastry/algorithms/greedy",
        icon: Code2,
        description: "Sélection d'activités, Huffman, Kruskal",
        badge: "Nouveau",
      },
      {
        title: "Backtracking",
        href: "/tech-mastry/algorithms/backtracking",
        icon: Code2,
        description: "N-Queens, Sudoku, permutations",
        badge: "Nouveau",
      },
      {
        title: "Algorithmes de Graphes",
        href: "/tech-mastry/algorithms/graph-algorithms",
        icon: GitMerge,
        description: "BFS, DFS, Dijkstra, tri topologique",
        badge: "Avancé",
      },
    ],
  },
  {
    title: "Structures de Données",
    icon: Database,
    items: [
      {
        title: "Vue d'ensemble",
        href: "/tech-mastry/data-structures",
        icon: Database,
        description: "Introduction aux structures de données",
        badge: "Essentiel",
      },
      {
        title: "Tableaux & Chaînes",
        href: "/tech-mastry/data-structures/arrays",
        icon: Code2,
        description: "Manipulation des tableaux et des chaînes",
      },
      {
        title: "Listes & Files",
        href: "/tech-mastry/data-structures/lists",
        icon: Code2,
        description: "Structures de données linéaires",
      },
      {
        title: "Arbres",
        href: "/tech-mastry/data-structures/trees",
        icon: GitMerge,
        description: "Arbres binaires et parcours",
        badge: "Avancé",
      },
      {
        title: "Hash Maps",
        href: "/tech-mastry/data-structures/hash-maps",
        icon: Database,
        description: "Tables de hachage et résolution de collisions",
        badge: "Nouveau",
      },
      {
        title: "Graphes",
        href: "/tech-mastry/data-structures/graphs",
        icon: GitMerge,
        description: "BFS, DFS, plus courts chemins",
        badge: "Avancé",
      },
      {
        title: "Heaps",
        href: "/tech-mastry/data-structures/heaps",
        icon: Binary,
        description: "Tas binaires et files de priorité",
        badge: "Nouveau",
      },
      {
        title: "Piles & Files",
        href: "/tech-mastry/data-structures/stacks-queues",
        icon: Layers,
        description: "LIFO, FIFO et applications",
        badge: "Nouveau",
      },
    ],
  },
  {
    title: "Architecture & Design",
    icon: BrainCircuit,
    items: [
      {
        title: "Clean Architecture",
        href: "/tech-mastry/architecture/clean-architecture",
        icon: Layers,
        description: "Architecture hexagonale et couches",
        badge: "Avancé",
      },
      {
        title: "Design Patterns",
        href: "/tech-mastry/architecture/design-patterns",
        icon: Workflow,
        description: "Singleton, Factory, Observer, Strategy...",
        badge: "Avancé",
      },
      {
        title: "SOLID",
        href: "/tech-mastry/architecture/solid",
        icon: BrainCircuit,
        description: "Les 5 principes fondamentaux",
        badge: "Essentiel",
      },
      {
        title: "DDD",
        href: "/tech-mastry/architecture/ddd",
        icon: BrainCircuit,
        description: "Domain-Driven Design",
        badge: "Expert",
      },
    ],
  },
  {
    title: "System Design",
    icon: BrainCircuit,
    items: [
      {
        title: "Architecture Distribuée",
        href: "/tech-mastry/system-design/distributed",
        icon: BrainCircuit,
        description: "Microservices, Event-Driven, Service Mesh",
        badge: "Avancé",
      },
      {
        title: "Scalabilité",
        href: "/tech-mastry/system-design/scalability",
        icon: BrainCircuit,
        description: "Techniques de mise à l'échelle",
      },
      {
        title: "Études de Cas",
        href: "/tech-mastry/system-design/case-studies",
        icon: Book,
        description: "URL Shortener, Chat, Netflix...",
        badge: "Nouveau",
      },
      {
        title: "Sécurité Système",
        href: "/tech-mastry/system-design/security",
        icon: Server,
        description: "Auth, chiffrement, defense in depth",
      },
      {
        title: "Monitoring",
        href: "/tech-mastry/system-design/monitoring",
        icon: Binary,
        description: "Observabilité, SLO/SLI/SLA",
        badge: "Nouveau",
      },
      {
        title: "Whiteboard Interactif",
        href: "/tech-mastry/system-design/whiteboard",
        icon: BrainCircuit,
        description: "Exercices de design guidés étape par étape",
        badge: "Interactif",
      },
    ],
  },
  {
    title: "Frontend",
    icon: Layers,
    items: [
      {
        title: "React Basics",
        href: "/tech-mastry/frontend/react-basics",
        icon: Code2,
        description: "Fondamentaux de React",
      },
      {
        title: "Component Patterns",
        href: "/tech-mastry/frontend/component-patterns",
        icon: Code2,
        description: "Patterns de conception de composants React",
        badge: "Nouveau",
      },
      {
        title: "State Management",
        href: "/tech-mastry/frontend/state-management",
        icon: Code2,
        description: "Gestion d'état avancée dans React",
      },
      {
        title: "Performance",
        href: "/tech-mastry/frontend/performance",
        icon: Code2,
        description: "Optimisation des performances React",
        badge: "Nouveau",
      },
      {
        title: "Accessibility",
        href: "/tech-mastry/frontend/accessibility",
        icon: Code2,
        description: "Création d'interfaces accessibles",
        badge: "Nouveau",
      },
      {
        title: "CSS Avancé",
        href: "/tech-mastry/frontend/css-advanced",
        icon: Code2,
        description: "Grid, Flexbox, animations, Container Queries",
        badge: "Nouveau",
      },
      {
        title: "Testing Frontend",
        href: "/tech-mastry/frontend/testing",
        icon: Code2,
        description: "Vitest, Testing Library, Playwright",
        badge: "Nouveau",
      },
      {
        title: "Next.js Patterns",
        href: "/tech-mastry/frontend/nextjs-patterns",
        icon: Layers,
        description: "Server Components, Actions, Caching",
        badge: "Nouveau",
      },
    ],
  },
  {
    title: "Backend",
    icon: Server,
    items: [
      {
        title: "API Design",
        href: "/tech-mastry/backend/api-design",
        icon: Server,
        description: "REST, GraphQL, gRPC, WebSocket",
        badge: "Nouveau",
      },
      {
        title: "Bases de Données",
        href: "/tech-mastry/backend/databases",
        icon: Database,
        description: "SQL, NoSQL, indexation",
        badge: "Nouveau",
      },
      {
        title: "Sécurité Backend",
        href: "/tech-mastry/backend/security",
        icon: Server,
        description: "JWT, OAuth, rate limiting",
        badge: "Nouveau",
      },
      {
        title: "Architecture",
        href: "/tech-mastry/backend/architecture",
        icon: Layers,
        description: "Microservices, Event-Driven, CQRS",
        badge: "Nouveau",
      },
      {
        title: "Performance",
        href: "/tech-mastry/backend/performance",
        icon: Binary,
        description: "Caching, indexation, profiling",
        badge: "Nouveau",
      },
      {
        title: "DevOps Backend",
        href: "/tech-mastry/backend/devops",
        icon: Workflow,
        description: "Monitoring, logging, déploiement",
        badge: "Nouveau",
      },
    ],
  },
  {
    title: "Carrière & Préparation",
    icon: Book,
    items: [
      {
        title: "Plan de préparation",
        href: "/tech-mastry/preparation",
        icon: Workflow,
        description: "Guide étape par étape pour se préparer",
        badge: "Essentiel",
      },
      {
        title: "Mock Interviews",
        href: "/tech-mastry/preparation/mock-interviews",
        icon: MessagesSquare,
        description: "Simulations d'entretiens structurées",
        badge: "Nouveau",
      },
      {
        title: "Gestion du Stress",
        href: "/tech-mastry/preparation/stress-management",
        icon: Book,
        description: "Techniques de relaxation et mindset",
      },
      {
        title: "Négociation",
        href: "/tech-mastry/career/salary-negotiation",
        icon: DollarSign,
        description: "Framework de négociation en 5 étapes",
        badge: "Nouveau",
      },
      {
        title: "Progression",
        href: "/tech-mastry/career/progression",
        icon: Book,
        description: "Junior → Senior → Staff → Principal",
        badge: "Nouveau",
      },
      {
        title: "Conseils d'Entretien",
        href: "/tech-mastry/career/interview-tips",
        icon: MessagesSquare,
        description: "Méthode STAR et checklist",
        badge: "Nouveau",
      },
    ],
  },
  {
    title: "Sécurité & DevOps",
    icon: Server,
    items: [
      {
        title: "OWASP Top 10",
        href: "/tech-mastry/security-devops/owasp-top-10",
        icon: Server,
        description: "Vulnérabilités web critiques",
        badge: "Essentiel",
      },
      {
        title: "CI/CD",
        href: "/tech-mastry/security-devops/cicd",
        icon: Workflow,
        description: "Pipelines GitHub Actions",
        badge: "Nouveau",
      },
      {
        title: "Docker & K8s",
        href: "/tech-mastry/security-devops/docker-kubernetes",
        icon: Server,
        description: "Conteneurisation et orchestration",
        badge: "Nouveau",
      },
      {
        title: "Cloud Native",
        href: "/tech-mastry/security-devops/cloud-native",
        icon: Server,
        description: "12-Factor, Serverless",
        badge: "Nouveau",
      },
    ],
  },
  {
    title: "Pratique",
    icon: Swords,
    items: [
      {
        title: "Défis de Code",
        href: "/tech-mastry/coding-challenges",
        icon: Swords,
        description: "Exercices de programmation pratiques",
        badge: "Interactif",
      },
      {
        title: "Challenges Avancés",
        href: "/tech-mastry/challenges",
        icon: Swords,
        description: "Défis avec métriques de performance",
        badge: "Nouveau",
      },
      {
        title: "Simulation d'Entretiens",
        href: "/tech-mastry/interview-simulation",
        icon: MessagesSquare,
        description: "Mock interviews avec feedback IA",
        badge: "Interactif",
      },
      {
        title: "Banque de Questions",
        href: "/tech-mastry/interview-simulation/question-bank",
        icon: HelpCircle,
        description: "50+ questions classées par catégorie",
        badge: "Nouveau",
      },
      {
        title: "Solutions Expliquées",
        href: "/tech-mastry/challenges/solutions",
        icon: Swords,
        description: "Indices progressifs et solutions optimales",
        badge: "Nouveau",
      },
      {
        title: "Collaboration",
        href: "/tech-mastry/collaboration",
        icon: Code2,
        description: "Codage collaboratif en temps réel",
        badge: "Beta",
      },
      {
        title: "Architecture Studio",
        href: "/tech-mastry/system-design/architecture",
        icon: BrainCircuit,
        description: "Outil de diagramming système",
        badge: "Nouveau",
      },
      {
        title: "Visualisations",
        href: "/tech-mastry/algorithms/visualizations",
        icon: Binary,
        description: "Visualisations d'algorithmes interactives",
        badge: "Interactif",
      },
      {
        title: "Questions & Réponses",
        href: "/tech-mastry/qa",
        icon: HelpCircle,
        description: "FAQ des entretiens techniques",
      },
      {
        title: "Exercices Situationnels",
        href: "/tech-mastry/best-practices/exercises",
        icon: BrainCircuit,
        description: "Refactoring, code review, SOLID",
        badge: "Nouveau",
      },
    ],
  },
];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case "Nouveau":
      return "default";
    case "Essentiel":
      return "secondary";
    case "Avancé":
      return "outline";
    case "Expert":
      return "destructive";
    case "Soft Skills":
      return "blue";
    case "Interactif":
      return "green";
    default:
      return "secondary";
  }
};

export function TopicsNav() {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="px-3">
        <Link
          href="/tech-mastry"
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
            pathname === "/tech-mastry" ? "bg-accent" : "transparent",
          )}
        >
          <Book className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span className="flex-1">Introduction</span>
          {pathname === "/tech-mastry" && (
            <motion.div
              layoutId="activeSection"
              className="h-1 w-1 rounded-full bg-primary"
            />
          )}
        </Link>
      </div>

      {topics.map((section) => (
        <div key={section.title} className="px-3">
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === section.title ? null : section.title,
              )
            }
            className="group mb-2 flex w-full items-center justify-between px-3 text-left"
          >
            <div className="flex items-center gap-3">
              <section.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-primary">
                {section.title}
              </span>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-all group-hover:text-primary",
                expandedSection === section.title && "rotate-90",
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === section.title && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 px-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={getBadgeVariant(item.badge) as any}
                            className="ml-auto"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {pathname === item.href && (
                          <motion.div
                            layoutId="activeItem"
                            className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs opacity-80">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
