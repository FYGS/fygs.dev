import type { Topic } from "../types";

export const toolsTopics: Topic[] = [
  {
    route: "/tech-mastry/playground",
    title: "Code Playground",
    description: "Environnement interactif de codage",
    kind: "tool",
    level: "intermediate",
    minutes: 60,
    tags: ["éditeur de code", "code editor", "exécution", "execution", "javascript"],
  },
  {
    route: "/tech-mastry/resources",
    title: "Ressources & Documentation",
    description: "Livres, cours, podcasts et communautés recommandés pour la préparation.",
    kind: "tool",
    level: "intermediate",
    minutes: 25,
    tags: ["livres", "books", "cours", "courses", "podcasts"],
  },
];
