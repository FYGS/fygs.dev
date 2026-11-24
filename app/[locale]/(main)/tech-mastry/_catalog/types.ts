/**
 * TechMastery catalog: the one description of every page of the section. The navigation, the search, the
 * breadcrumbs, the topic shell (previous / next, completion, time) and the dashboard read it, and
 * tests/unit/tech-mastry/catalog.test.ts fails when a page, the navigation or the search index drift from it.
 */

/** hub: an area's landing page · guide: a lesson · practice: exercises, challenges, simulations · tool: a sandbox */
export type TopicKind = "hub" | "guide" | "practice" | "tool";
export type TopicLevel = "beginner" | "intermediate" | "advanced";

export interface Topic {
  /** The path without the locale, e.g. "/tech-mastry/git-mastery/workflows" */
  route: string;
  title: string;
  description: string;
  kind: TopicKind;
  level: TopicLevel;
  /** Reading and practice time, in minutes */
  minutes: number;
  tags: string[];
  /** Routes worth knowing before this topic */
  prerequisites?: string[];
  /** What to remember: three to five short sentences */
  takeaways?: string[];
}

export interface Area {
  id: string;
  title: string;
  description: string;
  /** The area's landing page, when it has one */
  route: string | null;
}
