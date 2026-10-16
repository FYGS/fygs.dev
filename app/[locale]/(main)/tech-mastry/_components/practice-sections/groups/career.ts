import {
  BrainCircuit,
  Code,
  DollarSign,
  MessageSquare,
  Shield,
  Target,
  Timer,
} from "lucide-react";
import type { Section } from "../types";

export const careerSections: Section[] = [
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
];
