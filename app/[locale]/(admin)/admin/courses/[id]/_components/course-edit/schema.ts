import { z } from "zod";
import { CourseCategory, CourseLevel, CourseAccessTier } from "@prisma/client";
import type { UseFormReturn } from "react-hook-form";

// Zod schema for validation
export const courseEditSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
    ),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  category: z.nativeEnum(CourseCategory),
  level: z.nativeEnum(CourseLevel),
  accessTier: z.nativeEnum(CourseAccessTier),
  price: z.number().min(0).nullable(),
  duration: z.number().min(1).nullable(),
  published: z.boolean(),
  featured: z.boolean(),
  previewEnabled: z.boolean(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()),
  publicStructure: z.string().optional(),
  publicResources: z.string().optional(),
  publicEvaluation: z.string().optional(),
  publicPrerequisites: z.string().optional(),
  trailerUrl: z.string().optional(),
  faq: z.string().optional(),
});

export type CourseEditFormData = z.infer<typeof courseEditSchema>;

/** Form API shared by the section components. */
export type CourseEditFormApi = UseFormReturn<CourseEditFormData>;

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
