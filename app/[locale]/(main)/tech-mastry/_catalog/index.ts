import type { Area, Topic } from "./types";
import { aiMasteryTopics } from "./areas/ai-mastery";
import { algorithmsTopics } from "./areas/algorithms";
import { architectureTopics } from "./areas/architecture";
import { backendTopics } from "./areas/backend";
import { bestPracticesTopics } from "./areas/best-practices";
import { careerTopics } from "./areas/career";
import { dataScienceTopics } from "./areas/data-science";
import { dataStructuresTopics } from "./areas/data-structures";
import { frontendTopics } from "./areas/frontend";
import { gitMasteryTopics } from "./areas/git-mastery";
import { practiceTopics } from "./areas/practice";
import { securityDevopsTopics } from "./areas/security-devops";
import { systemDesignTopics } from "./areas/system-design";
import { toolsTopics } from "./areas/tools";
import { typescriptMasteryTopics } from "./areas/typescript-mastery";

export type { Area, Topic, TopicKind, TopicLevel } from "./types";

import { normalizeRoute } from "./normalize";

export { normalizeRoute };
export const SECTION_ROUTE = "/tech-mastry";

/** The areas, in the order a learner is advised to go through them. */
export const AREAS: Array<Area & { topics: Topic[] }> = [
  { id: "algorithms", title: "Algorithmes", description: "Complexité, tri, recherche, programmation dynamique, graphes", route: "/tech-mastry/algorithms", topics: algorithmsTopics },
  { id: "data-structures", title: "Structures de données", description: "Tableaux, listes, piles, files, tables de hachage, arbres, graphes, tas", route: "/tech-mastry/data-structures", topics: dataStructuresTopics },
  { id: "architecture", title: "Architecture & design", description: "Principes SOLID, design patterns, architecture propre, DDD", route: "/tech-mastry/architecture", topics: architectureTopics },
  { id: "system-design", title: "System design", description: "Scalabilité, stockage, systèmes distribués, supervision, études de cas", route: "/tech-mastry/system-design", topics: systemDesignTopics },
  { id: "frontend", title: "Frontend", description: "React, état, performances, accessibilité, tests, Next.js", route: "/tech-mastry/frontend", topics: frontendTopics },
  { id: "backend", title: "Backend", description: "API, bases de données, authentification, messagerie, performance, tests", route: "/tech-mastry/backend", topics: backendTopics },
  { id: "typescript-mastery", title: "TypeScript", description: "Types avancés, génériques, sûreté à l'exécution, patterns", route: "/tech-mastry/typescript-mastery", topics: typescriptMasteryTopics },
  { id: "git-mastery", title: "Git", description: "Branches, commandes avancées, conflits, hooks, internes", route: "/tech-mastry/git-mastery", topics: gitMasteryTopics },
  { id: "security-devops", title: "Sécurité & DevOps", description: "OWASP, CI/CD, conteneurs, cloud native", route: "/tech-mastry/security-devops", topics: securityDevopsTopics },
  { id: "data-science", title: "Data science & engineering", description: "Statistiques, Python, machine learning, deep learning, MLOps, data engineering", route: "/tech-mastry/data-science", topics: dataScienceTopics },
  { id: "ai-mastery", title: "IA & prompt engineering", description: "Outils, prompts, agents, configuration d'assistants de code", route: "/tech-mastry/ai-mastery", topics: aiMasteryTopics },
  { id: "best-practices", title: "Bonnes pratiques", description: "Qualité de code, communication, négociation, résolution de problèmes", route: "/tech-mastry/best-practices", topics: bestPracticesTopics },
  { id: "career", title: "Carrière & préparation", description: "Entretiens, progression, négociation salariale, gestion du stress", route: "/tech-mastry/career", topics: careerTopics },
  { id: "practice", title: "Pratique", description: "Défis de code, simulation d'entretien, questions-réponses", route: null, topics: practiceTopics },
  { id: "tools", title: "Outils", description: "Playground et ressources", route: null, topics: toolsTopics },
];

export const TOPICS: Topic[] = AREAS.flatMap((area) => area.topics);

const byRoute = new Map(TOPICS.map((topic) => [topic.route, topic]));
const areaOfRoute = new Map(AREAS.flatMap((area) => area.topics.map((topic) => [topic.route, area] as const)));

export function getTopic(path: string): Topic | undefined {
  return byRoute.get(normalizeRoute(path));
}

export function getArea(path: string): (Area & { topics: Topic[] }) | undefined {
  return areaOfRoute.get(normalizeRoute(path));
}

/** The lessons and practice of an area, in reading order (the landing page is not one of them). */
export function lessonsOf(area: { topics: Topic[] }): Topic[] {
  return area.topics.filter((topic) => topic.kind !== "hub");
}

/** Every topic a learner can complete, in the order of the whole path. */
export const PATH: Topic[] = AREAS.filter((area) => area.id !== "tools").flatMap(lessonsOf);

export interface Neighbours {
  previous: Topic | null;
  next: Topic | null;
}

/** Previous and next lesson along the whole path; the first lesson of an area follows the last of the area before. */
export function neighbours(path: string): Neighbours {
  const route = normalizeRoute(path);
  const index = PATH.findIndex((topic) => topic.route === route);
  if (index < 0) return { previous: null, next: null };
  return { previous: PATH[index - 1] ?? null, next: PATH[index + 1] ?? null };
}

/** The closest lessons of the same area first, then the rest of the area, then lessons that share a tag. */
export function relatedTo(path: string, limit = 3): Topic[] {
  const topic = getTopic(path);
  const area = getArea(path);
  if (!topic || !area) return [];
  const lessons = lessonsOf(area);
  const me = lessons.findIndex((other) => other.route === topic.route);
  const siblings = lessons
    .map((other, index) => ({ other, distance: Math.abs(index - me) }))
    .filter(({ other }) => other.route !== topic.route)
    .sort((x, y) => x.distance - y.distance)
    .map(({ other }) => other);
  const shared = PATH.filter((other) => other.route !== topic.route && !siblings.includes(other) && other.tags.some((tag) => topic.tags.includes(tag)));
  return [...siblings, ...shared].slice(0, limit);
}

export const LEVEL_LABEL = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" } as const;
