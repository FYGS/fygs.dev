import {
  Brain,
  BrainCircuit,
  Database,
  Layout,
  Network,
} from "lucide-react";
import type { Section } from "../types";

export const fundamentalsSections: Section[] = [
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
];
