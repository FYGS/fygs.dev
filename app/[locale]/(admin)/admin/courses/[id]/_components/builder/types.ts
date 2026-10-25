import type { CourseAccessTier, CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";
import type { FaqEntry } from "@/lib/curriculum/content";

/** A course as the builder edits it (plain data, safe to send to the browser). */
export interface CourseInfo {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: CourseCategory;
  level: CourseLevel;
  accessTier: CourseAccessTier;
  price: number | null;
  /** Minutes typed by the author; the lessons' total is shown instead as soon as a published lesson has a duration. */
  duration: number | null;
  previewEnabled: boolean;
  featured: boolean;
  published: boolean;
  instructorId: string | null;
  objectives: string[];
  faq: FaqEntry[];
  trailerUrl: string;
  publicPrerequisites: string;
  publicStructure: string;
  publicResources: string;
  publicEvaluation: string;
  tagIds: string[];
}

export interface TagOption {
  id: string;
  name: string;
  color: string;
}

export interface InstructorOption {
  id: string;
  name: string;
  email: string;
}

export type SectionId =
  | "infos"
  | "programme"
  | "evaluations"
  | "supports"
  | "vente"
  | "apercu"
  | "statistiques"
  | "apprenants"
  | "parametres";

