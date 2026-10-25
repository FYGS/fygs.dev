import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { createLogger } from "@/lib/structured-logger";
import { completeCourseIfDone } from "./completion";
import { getLessonAccess } from "./lesson-access";
import { rewardLessonCompleted, type LessonReward } from "./rewards";

export const lessonProgressInput = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().optional(),
  /** Seconds really played since the last report (at most 2 h per report). */
  watchTimeDelta: z.number().min(0).max(7200).optional(),
  /** Where the video is, in seconds: where "resume" starts. */
  lastPosition: z.number().min(0).max(86400).optional(),
});
export type LessonProgressInput = z.infer<typeof lessonProgressInput>;

export interface LessonProgressOutcome {
  success: boolean;
  /** Machine-readable reason when it failed. */
  error?: "UNAUTHORIZED" | "VALIDATION_ERROR" | "LESSON_NOT_FOUND" | "LESSON_NOT_PUBLISHED" | "ACCESS_DENIED" | "INTERNAL_ERROR";
  progress?: { id: string; completed: boolean; watchTime: number; completedAt: Date | null; lastPosition: number };
  /** XP given for this completion, once per lesson. */
  reward?: LessonReward | null;
  /** Set when this call completed the lesson: where the course stands. */
  course?: {
    percent: number;
    isComplete: boolean;
    justIssued: boolean;
    certificate: { id: string; code: string } | null;
  };
}

/**
 * Records what a learner did in a lesson: time watched (added by the database, so two tabs never overwrite each
 * other), the position to resume from, and completion. Only a learner who follows the course records anything:
 * a free preview and the author's look at their own course are read only. Completing a lesson may complete the
 * course and issue its certificate.
 */
export async function recordLessonProgress(
  viewer: { id: string; role?: string | null } | null,
  input: unknown,
): Promise<LessonProgressOutcome> {
  const logger = createLogger({ operation: "recordLessonProgress" });
  if (!viewer) return { success: false, error: "UNAUTHORIZED" };
  const parsed = lessonProgressInput.safeParse(input);
  if (!parsed.success) return { success: false, error: "VALIDATION_ERROR" };
  const { lessonId, completed, watchTimeDelta = 0, lastPosition } = parsed.data;
  const userId = viewer.id;

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { order: true, published: true, courseId: true, course: { select: { slug: true } } },
    });
    if (!lesson) return { success: false, error: "LESSON_NOT_FOUND" };
    if (!lesson.published) return { success: false, error: "LESSON_NOT_PUBLISHED" };
    // Recorded for a learner who follows the course: not for a free preview, not for the author looking at it
    const access = await getLessonAccess(viewer, lessonId);
    if (!access?.canOpen || access.mode !== "full") return { success: false, error: "ACCESS_DENIED" };

    const { updated, completionChanged } = await db.$transaction(async (tx) => {
      const existing = await tx.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
        select: { completed: true, completedAt: true },
      });
      const wasCompleted = existing?.completed ?? false;
      const nowCompleted = completed ?? wasCompleted;

      const updated = await tx.progress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: {
          userId,
          lessonId,
          completed: nowCompleted,
          watchTime: Math.floor(watchTimeDelta),
          lastPosition: Math.floor(lastPosition ?? 0),
          completedAt: nowCompleted ? new Date() : null,
        },
        update: {
          completed: nowCompleted,
          watchTime: { increment: Math.floor(watchTimeDelta) },
          ...(lastPosition !== undefined ? { lastPosition: Math.floor(lastPosition) } : {}),
          // keep the first completion date; un-completing clears it
          completedAt: !nowCompleted ? null : wasCompleted ? existing?.completedAt : new Date(),
        },
        select: { id: true, completed: true, watchTime: true, completedAt: true, lastPosition: true },
      });
      return { updated, completionChanged: nowCompleted !== wasCompleted };
    });

    // Only a change of the completed state needs fresh pages: a watch-time report must not re-render the lesson
    let reward: LessonReward | null = null;
    let course: LessonProgressOutcome["course"];
    if (completionChanged) {
      if (updated.completed) {
        await AnalyticsHelper.recordLessonCompletion(userId, {
          lessonId,
          courseId: lesson.courseId,
          lessonOrder: lesson.order,
          watchTime: updated.watchTime,
          completionPercentage: 100,
          isFirstCompletion: true,
          timestamp: new Date().toISOString(),
        }).catch((e: unknown) => logger.warn("lesson completion analytics failed", { metadata: { error: String(e) } }));
        reward = await rewardLessonCompleted(userId, lessonId);
        const outcome = await completeCourseIfDone(userId, lesson.courseId);
        course = {
          percent: outcome.progress.percent,
          isComplete: outcome.isComplete,
          justIssued: outcome.justIssued,
          certificate: outcome.certificate ? { id: outcome.certificate.id, code: outcome.certificate.code } : null,
        };
      }
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/my-courses");
      revalidatePath(`/formations/${lesson.course.slug}`);
      revalidatePath(`/learn/${lesson.course.slug}`, "layout");
    }

    return { success: true, progress: updated, reward, course };
  } catch (error) {
    logger.error("lesson progress not recorded", {
      metadata: { lessonId, error: error instanceof Error ? error.message : String(error) },
    });
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
