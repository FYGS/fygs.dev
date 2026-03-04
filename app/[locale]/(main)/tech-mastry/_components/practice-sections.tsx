"use client";

import { Card } from "@/components/ui/card";
import { usePagination } from "@/hooks/tech-mastry/use-pagination";
import {
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  Code,
  Code2,
  Database,
  DollarSign,
  FileCode2,
  GitBranch,
  Layout,
  LucideIcon,
  MessageSquare,
  Network,
  Shield,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { Pagination } from "./pagination";

interface Subsection {
  title: string;
  href: string;
  description: string;
}

interface Section {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgColor: string;
  subsections?: Subsection[];
}

const sections: Section[] = [
  {
    title: "Algorithmes & Structures de Données",
    description:
      "Exercices pratiques sur les algorithmes classiques, la complexité et les structures de données.",
    icon: Brain,
    href: "/tech-mastry/algorithms",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    subsections: [
      {
        title: "Complexité",
        href: "/tech-mastry/algorithms/complexity",
        description: "Analyse Big-O, temps et espace",
      },
      {
        title: "Tri",
        href: "/tech-mastry/algorithms/sorting",
        description: "Merge sort, quick sort, heap sort",
      },
      {
        title: "Recherche",
        href: "/tech-mastry/algorithms/searching",
        description: "Recherche binaire, linéaire",
      },
      {
        title: "Algorithmes Gloutons",
        href: "/tech-mastry/algorithms/greedy",
        description: "Huffman, Kruskal, sélection d'activités",
      },
      {
        title: "Backtracking",
        href: "/tech-mastry/algorithms/backtracking",
        description: "N-Queens, Sudoku, permutations",
      },
      {
        title: "Algorithmes de Graphes",
        href: "/tech-mastry/algorithms/graph-algorithms",
        description: "BFS, DFS, Dijkstra",
      },
    ],
  },
  {
    title: "System Design",
    description:
      "Conception de systèmes distribués, scalabilité, et architecture de solutions.",
    icon: Network,
    href: "/tech-mastry/system-design",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    subsections: [
      {
        title: "Architecture Distribuée",
        href: "/tech-mastry/system-design/distributed",
        description: "Microservices, Event-Driven",
      },
      {
        title: "Études de Cas",
        href: "/tech-mastry/system-design/case-studies",
        description: "URL Shortener, Chat, Netflix",
      },
      {
        title: "Whiteboard Interactif",
        href: "/tech-mastry/system-design/whiteboard",
        description: "Exercices guidés étape par étape",
      },
    ],
  },
  {
    title: "Frontend Development",
    description:
      "React, performance, accessibilité, et bonnes pratiques de développement frontend.",
    icon: Layout,
    href: "/tech-mastry/frontend",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    subsections: [
      {
        title: "React Basics",
        href: "/tech-mastry/frontend/react-basics",
        description: "Composants, props, state",
      },
      {
        title: "Component Patterns",
        href: "/tech-mastry/frontend/component-patterns",
        description: "HOC, render props, compound",
      },
      {
        title: "State Management",
        href: "/tech-mastry/frontend/state-management",
        description: "Context, Redux, Zustand",
      },
      {
        title: "Performance",
        href: "/tech-mastry/frontend/performance",
        description: "Optimisation, lazy loading",
      },
      {
        title: "Accessibility",
        href: "/tech-mastry/frontend/accessibility",
        description: "ARIA, clavier, lecteurs d'écran",
      },
      {
        title: "CSS Avancé",
        href: "/tech-mastry/frontend/css-advanced",
        description: "Grid, animations, Container Queries",
      },
      {
        title: "Testing",
        href: "/tech-mastry/frontend/testing",
        description: "Vitest, Testing Library, Playwright",
      },
      {
        title: "Next.js Patterns",
        href: "/tech-mastry/frontend/nextjs-patterns",
        description: "Server Components, Actions, Caching",
      },
    ],
  },
  {
    title: "Backend Development",
    description:
      "API REST, bases de données, sécurité, et architecture backend.",
    icon: Database,
    href: "/tech-mastry/backend",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    subsections: [
      {
        title: "API Design",
        href: "/tech-mastry/backend/api-design",
        description: "REST, GraphQL, gRPC",
      },
      {
        title: "Bases de Données",
        href: "/tech-mastry/backend/databases",
        description: "SQL, NoSQL, indexation",
      },
      {
        title: "Sécurité",
        href: "/tech-mastry/backend/security",
        description: "JWT, OAuth, rate limiting",
      },
      {
        title: "Architecture",
        href: "/tech-mastry/backend/architecture",
        description: "Microservices, CQRS",
      },
      {
        title: "Performance",
        href: "/tech-mastry/backend/performance",
        description: "Caching, profiling",
      },
      {
        title: "DevOps",
        href: "/tech-mastry/backend/devops",
        description: "Monitoring, déploiement",
      },
      {
        title: "Authentification",
        href: "/tech-mastry/backend/authentication",
        description: "OAuth, JWT, sessions, SSO",
      },
      {
        title: "Messaging",
        href: "/tech-mastry/backend/messaging",
        description: "Kafka, RabbitMQ, event-driven",
      },
      {
        title: "Testing",
        href: "/tech-mastry/backend/testing",
        description: "Tests unitaires, intégration, E2E",
      },
    ],
  },
  {
    title: "Data Structures",
    description:
      "Implémentation et utilisation des structures de données fondamentales.",
    icon: BrainCircuit,
    href: "/tech-mastry/data-structures",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    subsections: [
      {
        title: "Tableaux",
        href: "/tech-mastry/data-structures/arrays",
        description: "Manipulation et algorithmes sur tableaux",
      },
      {
        title: "Listes",
        href: "/tech-mastry/data-structures/lists",
        description: "Linked lists, doubly linked",
      },
      {
        title: "Arbres",
        href: "/tech-mastry/data-structures/trees",
        description: "BST, AVL, parcours",
      },
      {
        title: "Hash Maps",
        href: "/tech-mastry/data-structures/hash-maps",
        description: "Tables de hachage, collisions",
      },
      {
        title: "Graphes",
        href: "/tech-mastry/data-structures/graphs",
        description: "BFS, DFS, plus courts chemins",
      },
      {
        title: "Heaps",
        href: "/tech-mastry/data-structures/heaps",
        description: "Tas binaires, files de priorité",
      },
      {
        title: "Piles & Files",
        href: "/tech-mastry/data-structures/stacks-queues",
        description: "LIFO, FIFO",
      },
    ],
  },
  {
    title: "Coding Challenges",
    description:
      "Défis de programmation chronométrés pour simuler des conditions réelles.",
    icon: Timer,
    href: "/tech-mastry/coding-challenges",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    subsections: [
      {
        title: "Tableaux",
        href: "/tech-mastry/coding-challenges/arrays",
        description: "Challenges sur les tableaux",
      },
      {
        title: "Chaînes",
        href: "/tech-mastry/coding-challenges/strings",
        description: "Challenges sur les strings",
      },
      {
        title: "Arbres",
        href: "/tech-mastry/coding-challenges/trees",
        description: "Challenges sur les arbres",
      },
      {
        title: "Graphes",
        href: "/tech-mastry/coding-challenges/graphs",
        description: "Challenges sur les graphes",
      },
      {
        title: "Programmation Dynamique",
        href: "/tech-mastry/coding-challenges/dp",
        description: "DP : memoization, tabulation",
      },
      {
        title: "System Design",
        href: "/tech-mastry/coding-challenges/system-design",
        description: "Conception de systèmes",
      },
      {
        title: "Solutions Expliquées",
        href: "/tech-mastry/challenges/solutions",
        description: "Indices progressifs et solutions optimales",
      },
    ],
  },
  {
    title: "Bonnes Pratiques",
    description:
      "Clean code, patterns de conception, et meilleures pratiques de développement.",
    icon: Code,
    href: "/tech-mastry/best-practices",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    subsections: [
      {
        title: "Qualité du Code",
        href: "/tech-mastry/best-practices/code-quality",
        description: "SOLID, DRY, KISS, refactoring",
      },
      {
        title: "Communication",
        href: "/tech-mastry/best-practices/communication",
        description: "Présenter, argumenter, convaincre",
      },
      {
        title: "Design Patterns",
        href: "/tech-mastry/best-practices/design-patterns",
        description: "GoF patterns avec exemples TypeScript",
      },
      {
        title: "Négociation",
        href: "/tech-mastry/best-practices/negotiation",
        description: "Techniques de négociation",
      },
      {
        title: "Problem Solving",
        href: "/tech-mastry/best-practices/problem-solving",
        description: "Méthodologie de résolution",
      },
      {
        title: "System Design",
        href: "/tech-mastry/best-practices/system-design",
        description: "Bonnes pratiques de conception",
      },
      {
        title: "Exercices Situationnels",
        href: "/tech-mastry/best-practices/exercises",
        description: "Refactoring, code review, SOLID",
      },
    ],
  },
  {
    title: "Q&A Préparation",
    description:
      "Questions & réponses courantes avec quiz interactif et scoring.",
    icon: MessageSquare,
    href: "/tech-mastry/qa",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Préparation Stratégique",
    description:
      "Planning personnalisé, mock interviews, et techniques de gestion du stress.",
    icon: Target,
    href: "/tech-mastry/preparation",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    subsections: [
      {
        title: "Mock Interviews",
        href: "/tech-mastry/preparation/mock-interviews",
        description: "Simulations structurées",
      },
      {
        title: "Gestion du Stress",
        href: "/tech-mastry/preparation/stress-management",
        description: "Techniques de relaxation",
      },
    ],
  },
  {
    title: "Architecture & Design Patterns",
    description:
      "Clean Architecture, SOLID, DDD, et patterns de conception modernes.",
    icon: BrainCircuit,
    href: "/tech-mastry/architecture",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    subsections: [
      {
        title: "Clean Architecture",
        href: "/tech-mastry/architecture/clean-architecture",
        description: "Hexagonale et couches",
      },
      {
        title: "Design Patterns",
        href: "/tech-mastry/architecture/design-patterns",
        description: "Singleton, Factory, Observer",
      },
      {
        title: "SOLID",
        href: "/tech-mastry/architecture/solid",
        description: "Les 5 principes fondamentaux",
      },
      {
        title: "DDD",
        href: "/tech-mastry/architecture/ddd",
        description: "Domain-Driven Design",
      },
    ],
  },
  {
    title: "Sécurité & DevOps",
    description:
      "Sécurité applicative, CI/CD, Cloud Native, et pratiques DevSecOps.",
    icon: Shield,
    href: "/tech-mastry/security-devops",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    subsections: [
      {
        title: "OWASP Top 10",
        href: "/tech-mastry/security-devops/owasp-top-10",
        description: "Vulnérabilités web critiques",
      },
      {
        title: "CI/CD",
        href: "/tech-mastry/security-devops/cicd",
        description: "Pipelines GitHub Actions",
      },
      {
        title: "Docker & K8s",
        href: "/tech-mastry/security-devops/docker-kubernetes",
        description: "Conteneurisation",
      },
      {
        title: "Cloud Native",
        href: "/tech-mastry/security-devops/cloud-native",
        description: "12-Factor, Serverless",
      },
    ],
  },
  {
    title: "Négociation & Carrière",
    description:
      "Négociation salariale, progression de carrière, et développement personnel.",
    icon: DollarSign,
    href: "/tech-mastry/career",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    subsections: [
      {
        title: "Négociation Salariale",
        href: "/tech-mastry/career/salary-negotiation",
        description: "Framework en 5 étapes",
      },
      {
        title: "Progression",
        href: "/tech-mastry/career/progression",
        description: "Junior → Senior → Staff",
      },
      {
        title: "Conseils d'Entretien",
        href: "/tech-mastry/career/interview-tips",
        description: "Méthode STAR, checklist",
      },
    ],
  },
  {
    title: "Simulation d'Entretiens",
    description:
      "Mock interviews avec feedback, banque de questions exhaustive, et scoring.",
    icon: MessageSquare,
    href: "/tech-mastry/interview-simulation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    subsections: [
      {
        title: "Banque de Questions",
        href: "/tech-mastry/interview-simulation/question-bank",
        description: "50+ questions par catégorie",
      },
    ],
  },
  {
    title: "Data Science & Engineering",
    description:
      "Parcours complet du zéro à l'expert : Python, statistiques, ML, Deep Learning, pipelines de données et MLOps.",
    icon: BarChart3,
    href: "/tech-mastry/data-science",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    subsections: [
      {
        title: "Python pour la Data",
        href: "/tech-mastry/data-science/python-data",
        description: "NumPy, Pandas, Matplotlib",
      },
      {
        title: "Statistiques",
        href: "/tech-mastry/data-science/statistics",
        description: "Probabilités, distributions, tests",
      },
      {
        title: "Machine Learning",
        href: "/tech-mastry/data-science/machine-learning",
        description: "Supervised, Unsupervised, Evaluation",
      },
      {
        title: "Deep Learning",
        href: "/tech-mastry/data-science/deep-learning",
        description: "Neural Networks, CNN, RNN, Transformers",
      },
      {
        title: "Data Engineering",
        href: "/tech-mastry/data-science/data-engineering",
        description: "ETL, Pipelines, Big Data, SQL",
      },
      {
        title: "MLOps",
        href: "/tech-mastry/data-science/mlops",
        description: "Déploiement, monitoring, CI/CD ML",
      },
    ],
  },
  {
    title: "IA & Prompt Engineering",
    description:
      "Parcours complet de l'IA : prompt engineering, IA agentiques, configuration Claude & Copilot, outils IA, MCP et Skills.",
    icon: Sparkles,
    href: "/tech-mastry/ai-mastery",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    subsections: [
      {
        title: "Prompt Engineering",
        href: "/tech-mastry/ai-mastery/prompt-engineering",
        description: "Zero-shot, few-shot, CoT, system prompts",
      },
      {
        title: "IA Agentiques",
        href: "/tech-mastry/ai-mastery/agentic-ai",
        description: "ReAct, multi-agents, planification, mémoire",
      },
      {
        title: "Setup Claude",
        href: "/tech-mastry/ai-mastery/claude-setup",
        description: "API, MCP, Claude Code, Projects",
      },
      {
        title: "Setup GitHub Copilot",
        href: "/tech-mastry/ai-mastery/copilot-setup",
        description: "VS Code, instructions, modes agent",
      },
      {
        title: "Outils IA",
        href: "/tech-mastry/ai-mastery/ai-tools",
        description: "Gemini, Cursor, Windsurf, ChatGPT, v0",
      },
      {
        title: "Skills & Agents MCP",
        href: "/tech-mastry/ai-mastery/skills-agents",
        description: "Protocole MCP, serveurs, agents custom",
      },
    ],
  },
  {
    title: "Git Mastery",
    description:
      "Maîtrisez Git en profondeur : branching strategies, commandes avancées, internals, workflows et hooks.",
    icon: GitBranch,
    href: "/tech-mastry/git-mastery",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    subsections: [
      {
        title: "Branching Strategies",
        href: "/tech-mastry/git-mastery/branching-strategies",
        description: "Git Flow, GitHub Flow, Trunk-Based",
      },
      {
        title: "Commandes Avancées",
        href: "/tech-mastry/git-mastery/advanced-commands",
        description: "Rebase, cherry-pick, bisect, reflog",
      },
      {
        title: "Git Internals",
        href: "/tech-mastry/git-mastery/git-internals",
        description: "Blobs, trees, commits, DAG",
      },
      {
        title: "Workflows & Conventions",
        href: "/tech-mastry/git-mastery/workflows",
        description: "Conventional Commits, SemVer, PRs",
      },
      {
        title: "Résolution de Conflits",
        href: "/tech-mastry/git-mastery/conflict-resolution",
        description: "Simulateur de conflits interactif",
      },
      {
        title: "Git Hooks",
        href: "/tech-mastry/git-mastery/git-hooks",
        description: "Husky, lint-staged, commitlint",
      },
    ],
  },
  {
    title: "TypeScript Mastery",
    description:
      "Types avancés, generics en profondeur, type challenges, design patterns typés, sécurité runtime et API du compilateur.",
    icon: FileCode2,
    href: "/tech-mastry/typescript-mastery",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    subsections: [
      {
        title: "Types Avancés",
        href: "/tech-mastry/typescript-mastery/advanced-types",
        description: "Mapped, conditional, template literal",
      },
      {
        title: "Generics en Profondeur",
        href: "/tech-mastry/typescript-mastery/generics-deep-dive",
        description: "Contraintes, inférence, HKT simulés",
      },
      {
        title: "Type Challenges",
        href: "/tech-mastry/typescript-mastery/type-challenges",
        description: "Défis de types progressifs",
      },
      {
        title: "Design Patterns TS",
        href: "/tech-mastry/typescript-mastery/design-patterns",
        description: "Builder, Strategy, State Machine",
      },
      {
        title: "Sécurité Runtime",
        href: "/tech-mastry/typescript-mastery/runtime-safety",
        description: "Zod, type guards, Result pattern",
      },
      {
        title: "Compilateur & Outillage",
        href: "/tech-mastry/typescript-mastery/compiler-api",
        description: "tsconfig, AST, codemods",
      },
    ],
  },
  {
    title: "Ressources & Documentation",
    description:
      "Sélection de livres, cours, et ressources recommandées pour la préparation.",
    icon: BookOpen,
    href: "/tech-mastry/resources",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "Code Playground",
    description:
      "Environnement de codage interactif avec exécution temps réel et collaboration.",
    icon: Code2,
    href: "/tech-mastry/playground",
    color: "text-lime-500",
    bgColor: "bg-lime-500/10",
  },
  {
    title: "Learning Dashboard",
    description:
      "Suivez votre progression, identifiez vos forces et planifiez votre parcours.",
    icon: BarChart3,
    href: "/tech-mastry/dashboard",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

export function PracticeSections() {
  // Augmenter le nombre d'éléments par page pour afficher plus de cartes
  const ITEMS_PER_PAGE = 12;

  const {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    isFirstPage,
    isLastPage,
    isLoading,
  } = usePagination<Section>({
    totalItems: sections.length,
    itemsPerPage: ITEMS_PER_PAGE,
    shouldScrollToTop: true,
  });

  const currentSections = paginatedItems(sections);

  return (
    <section
      className="space-y-12 relative"
      aria-label="Sections de préparation aux entretiens"
    >
      {/* Section title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 inline-flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
            Explorez des domaines d&apos;expertise variés
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez une sélection de ressources et d&apos;exercices pour
          maîtriser les compétences techniques essentielles
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Card
              key={i}
              className="p-6 h-full animate-pulse bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            key={currentPage}
          >
            {currentSections.map((section) => (
              <div key={section.title} className="group">
                <Link
                  href={section.href}
                  className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl block h-full"
                >
                  <Card className="p-6 h-[200px] border border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative backdrop-blur-xs bg-background/80 group-hover:bg-linear-to-br group-hover:from-background group-hover:to-primary/5">
                    {/* Background glow effect */}
                    <div className="absolute -inset-1 bg-linear-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" />

                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        <div
                          className={`inline-flex p-3 rounded-xl ${section.bgColor} group-hover:scale-110 transition-transform duration-300`}
                          aria-hidden="true"
                        >
                          <section.icon
                            className={`w-6 h-6 ${section.color}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <h2 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {section.title}
                          </h2>
                          <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground/80 transition-colors">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      {/* Subtle arrow indicator */}
                      <div className="self-end opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <div className="text-primary">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.16667 10H15.8333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.8333 5L15.8333 10L10.8333 15"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 mt-12 mb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                isFirstPage={isFirstPage}
                isLastPage={isLastPage}
                isLoading={isLoading}
              />
            </div>
          )}

          <div className="sr-only" role="status" aria-live="polite">
            Page {currentPage} sur {totalPages}
          </div>
        </>
      )}
    </section>
  );
}
