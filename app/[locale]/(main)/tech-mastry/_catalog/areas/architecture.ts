import type { Topic } from "../types";

export const architectureTopics: Topic[] = [
  {
    route: "/tech-mastry/architecture",
    title: "Architecture & design",
    description: "Principes SOLID, design patterns, architecture propre, DDD",
    kind: "hub",
    level: "intermediate",
    minutes: 15,
    tags: [],
  },
  {
    route: "/tech-mastry/architecture/clean-architecture",
    title: "Clean Architecture",
    description: "Architecture hexagonale et couches",
    kind: "guide",
    level: "advanced",
    minutes: 20,
    tags: ["architecture hexagonale", "hexagonal architecture", "architecture en oignon", "onion architecture", "couches"],
  },
  {
    route: "/tech-mastry/architecture/design-patterns",
    title: "Design Patterns",
    description: "Singleton, Factory, Observer, Strategy...",
    kind: "guide",
    level: "intermediate",
    minutes: 15,
    tags: ["singleton", "factory", "observer", "strategy", "decorator"],
  },
  {
    route: "/tech-mastry/architecture/solid",
    title: "SOLID",
    description: "Les 5 principes fondamentaux",
    kind: "guide",
    level: "beginner",
    minutes: 15,
    tags: ["responsabilité unique", "single responsibility", "ouvert/fermé", "open/closed", "substitution de liskov"],
  },
  {
    route: "/tech-mastry/architecture/ddd",
    title: "DDD",
    description: "Domain-Driven Design",
    kind: "guide",
    level: "advanced",
    minutes: 15,
    tags: ["ddd", "contexte borné", "bounded context", "langage omniprésent", "ubiquitous language"],
  },
];
