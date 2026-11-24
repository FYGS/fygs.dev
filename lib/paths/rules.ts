import type { CourseLevel } from "@/lib/generated/prisma/browser";
import { LEVEL_LABELS } from "@/lib/courses/labels";
/**
 * Pure rules of learning paths (parcours). No database here: the same functions run in the
 * service, in server actions and in the admin editor.
 *
 * Progress of a path comes from the progress of its courses (lib/learning/outline.ts is the one
 * rule for a course). A path is complete when every REQUIRED course is complete. Optional courses
 * and courses that are no longer published never block the certificate.
 */

export const MIN_PATH_COURSES = 2;
export const MAX_PATH_COURSES = 30;

export interface PathCourseState {
  courseId: string;
  optional: boolean;
  /** False for a course that has been unpublished since it was added: it does not count. */
  available: boolean;
  /** 0 to 100, from the course progress rule */
  percent: number;
  isComplete: boolean;
}

export interface PathProgress {
  /** Required courses that count (published) */
  requiredTotal: number;
  requiredDone: number;
  /** Mean of the progress of the required courses, 100 only when the path is complete */
  percent: number;
  isComplete: boolean;
  /** First required course, in path order, that is not complete: where "continue" goes */
  nextCourseId: string | null;
}

export function computePathProgress(courses: PathCourseState[]): PathProgress {
  const required = courses.filter((c) => !c.optional && c.available);
  const requiredDone = required.filter((c) => c.isComplete).length;
  const isComplete = required.length > 0 && requiredDone === required.length;
  const mean =
    required.length === 0
      ? 0
      : required.reduce((sum, c) => sum + (c.isComplete ? 100 : c.percent), 0) / required.length;
  return {
    requiredTotal: required.length,
    requiredDone,
    percent: isComplete ? 100 : Math.min(99, Math.floor(mean)),
    isComplete,
    nextCourseId: required.find((c) => !c.isComplete)?.courseId ?? null,
  };
}

export type PathCourseStatus =
  | "completed"
  | "in_progress"
  | "not_started"
  /** Premium course the learner can neither read nor enrol in yet */
  | "needs_access"
  /** Unpublished since it was added */
  | "unavailable";

export function pathCourseStatus(input: {
  available: boolean;
  entitled: boolean;
  enrolled: boolean;
  percent: number;
  isComplete: boolean;
}): PathCourseStatus {
  if (!input.available) return "unavailable";
  if (input.isComplete) return "completed";
  if (!input.entitled) return "needs_access";
  if (input.enrolled && input.percent > 0) return "in_progress";
  return "not_started";
}

export const PATH_COURSE_STATUS_LABELS: Record<PathCourseStatus, string> = {
  completed: "Terminé",
  in_progress: "En cours",
  not_started: "À faire",
  needs_access: "Abonnement ou achat requis",
  unavailable: "Indisponible",
};

export interface PublishCandidate {
  description: string;
  thumbnail: string | null;
  courses: { title: string; published: boolean; optional: boolean; lessonsCount: number }[];
}

/** What stops a path from being published. Empty means it can go live. */
export function pathPublishIssues(path: PublishCandidate): string[] {
  const issues: string[] = [];
  if (path.description.trim().length < 20) issues.push("La description doit faire au moins 20 caractères.");
  if (!path.thumbnail) issues.push("Ajoutez une image de couverture.");
  if (path.courses.length < MIN_PATH_COURSES) {
    issues.push(`Un parcours contient au moins ${MIN_PATH_COURSES} formations.`);
  }
  for (const course of path.courses.filter((c) => !c.published)) {
    issues.push(`« ${course.title} » n'est pas publiée.`);
  }
  // A course with nothing to do can never be completed, so the certificate would be out of reach.
  for (const course of path.courses.filter((c) => c.published && c.lessonsCount === 0)) {
    issues.push(`« ${course.title} » n'a aucune leçon publiée : elle ne pourrait pas être terminée.`);
  }
  if (path.courses.length >= MIN_PATH_COURSES && path.courses.every((c) => c.optional)) {
    issues.push("Au moins une formation doit être obligatoire.");
  }
  return issues;
}

/** Path levels are course levels; their names come from lib/courses/labels.ts. */
export type PathLevel = CourseLevel;
export const PATH_LEVELS = Object.keys(LEVEL_LABELS) as PathLevel[];

export const PATH_SORTS = [
  { value: "featured", label: "À la une" },
  { value: "recent", label: "Plus récents" },
  { value: "title", label: "Titre (A-Z)" },
  { value: "courses", label: "Nombre de formations" },
] as const;
export type PathSort = (typeof PATH_SORTS)[number]["value"];

export function parsePathSort(value: string | undefined): PathSort {
  return PATH_SORTS.find((s) => s.value === value)?.value ?? "featured";
}

export function parsePathLevel(value: string | undefined): PathLevel | undefined {
  return PATH_LEVELS.find((l) => l === value);
}
