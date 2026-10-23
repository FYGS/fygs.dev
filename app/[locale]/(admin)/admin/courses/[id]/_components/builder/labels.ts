import type { CourseAccessTier, CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  FULLSTACK: "Fullstack",
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
  FREE: "Gratuit",
  PREMIUM: "Premium",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as CourseCategory,
  label,
}));

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({
  value: value as CourseLevel,
  label,
}));
