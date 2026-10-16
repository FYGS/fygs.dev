import { z } from "zod";

// Schemas
export const moduleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
});
