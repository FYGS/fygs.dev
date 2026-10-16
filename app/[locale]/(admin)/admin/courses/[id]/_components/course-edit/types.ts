import { CourseCategory, CourseLevel, CourseAccessTier } from "@prisma/client";

// Types for the props
export type TagType = {
  id: string;
  name: string;
  color: string;
};

export type CourseType = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  accessTier: CourseAccessTier;
  price: number | null;
  duration: number | null;
  published: boolean;
  featured: boolean;
  previewEnabled: boolean;
  thumbnail: string | null;
  publicStructure: string | null;
  publicResources: string | null;
  publicEvaluation: string | null;
  publicPrerequisites: string | null;
  trailerUrl: string | null;
  faq: Array<{ q: string; a: string }> | null;
  tags: { tag: TagType }[];
  modules: {
    id: string;
    title: string;
    slug: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      duration: number | null;
      order: number;
    }[];
  }[];
};

export interface CourseEditFormProps {
  course: CourseType;
  tags: TagType[];
}
