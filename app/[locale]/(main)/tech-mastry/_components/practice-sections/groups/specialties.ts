import {
  BarChart3,
  BookOpen,
  Code2,
  FileCode2,
  GitBranch,
  Sparkles,
} from "lucide-react";
import type { Section } from "../types";

export const specialtiesSections: Section[] = [
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
