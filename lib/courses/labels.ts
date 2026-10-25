import type { CourseAccessTier, CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";

/** The one place where course categories, levels and access tiers get their French names and badge colours. */

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Full-stack",
  CLOUD: "Cloud",
  AI: "Intelligence artificielle",
  DEVOPS: "DevOps",
  PRODUCTIVITY: "Productivité",
};

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

export const TIER_LABELS: Record<CourseAccessTier, string> = {
  FREE: "Gratuite",
  PREMIUM: "Premium",
};

/** Badge colours readable in the light and the dark theme (contrast checked by the accessibility audit). */
export const LEVEL_BADGE_CLASSES: Record<CourseLevel, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  INTERMEDIATE: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  ADVANCED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  EXPERT: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as CourseCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

export const LEVEL_OPTIONS = (Object.keys(LEVEL_LABELS) as CourseLevel[]).map((value) => ({
  value,
  label: LEVEL_LABELS[value],
}));

/** Labels for values that may come from a URL or older data: falls back to the raw value. */
export const categoryLabel = (value: string) => CATEGORY_LABELS[value as CourseCategory] ?? value;
export const levelLabel = (value: string) => LEVEL_LABELS[value as CourseLevel] ?? value;
