import { z } from "zod";
import { CourseCategory, CourseLevel, CourseAccessTier } from "@prisma/client";
import type { UseFormReturn } from "react-hook-form";

// Schema aligned with Prisma model
export const courseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  category: z.nativeEnum(CourseCategory),
  level: z.nativeEnum(CourseLevel),
  accessTier: z.nativeEnum(CourseAccessTier),
  price: z.number().min(0).optional(),
  duration: z.number().min(1).optional(), // Duration in minutes
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  previewEnabled: z.boolean().default(true),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publicStructure: z.string().optional(),
  publicResources: z.string().optional(),
  publicEvaluation: z.string().optional(),
  publicPrerequisites: z.string().optional(),
  trailerUrl: z.string().optional(),
  faq: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Types for props
export type TagType = {
  id: string;
  name: string;
  color: string;
};

/** Form API shared by the section components. */
export type CourseFormApi = UseFormReturn<
  z.input<typeof courseSchema>,
  unknown,
  CourseFormData
>;

// Auto-generate slug from title
export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
