import { z } from "zod";
import { MAX_PATH_COURSES, PATH_LEVELS } from "./rules";

/** Words that are a route of their own under /parcours */
export const RESERVED_SLUGS = ["verification"];

export const PATH_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** What the editor sends on save: the whole path, courses in order. */
export const pathInputSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit faire au moins 3 caractères").max(120, "120 caractères maximum"),
  slug: z
    .string()
    .trim()
    .min(3, "Le slug doit faire au moins 3 caractères")
    .max(80, "80 caractères maximum")
    .regex(PATH_SLUG_PATTERN, "Lettres minuscules, chiffres et tirets uniquement")
    .refine((slug) => !RESERVED_SLUGS.includes(slug), "Ce mot est réservé, choisissez une autre adresse"),
  description: z.string().trim().min(1, "La description est requise").max(2000, "2000 caractères maximum"),
  thumbnail: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"), "URL d'image invalide")
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  level: z.enum(PATH_LEVELS as [string, ...string[]]),
  objectives: z
    .array(z.string().trim().min(1).max(160, "160 caractères maximum par objectif"))
    .max(8, "8 objectifs maximum"),
  featured: z.boolean().default(false),
  courses: z
    .array(z.object({ courseId: z.string().min(1), optional: z.boolean().default(false) }))
    .max(MAX_PATH_COURSES, `${MAX_PATH_COURSES} formations maximum`)
    .refine((list) => new Set(list.map((c) => c.courseId)).size === list.length, "Une formation ne peut figurer qu'une fois"),
});

export type PathInput = z.input<typeof pathInputSchema>;
export type ParsedPathInput = z.output<typeof pathInputSchema>;
