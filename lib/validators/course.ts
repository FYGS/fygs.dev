import { z } from "zod";

// Zod schemas for course related mutations (to be used in server actions)

export const toggleLessonProgressSchema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().optional(), // if omitted, will toggle
  watchTime: z.number().int().min(0).optional(),
});

export const submitReviewSchema = z.object({
  courseId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(2000).optional(),
});

export type ToggleLessonProgressInput = z.infer<typeof toggleLessonProgressSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
