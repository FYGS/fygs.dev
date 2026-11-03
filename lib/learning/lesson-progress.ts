import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { createLogger } from "@/lib/structured-logger";
import { completeCourseIfDone } from "./completion";
import { completionDecision, completionRefusalMessage, creditedSeconds, requiredWatchSeconds } from "./engagement";
import { getLessonAccess } from "./lesson-access";
import { advisoryLock } from "./locks";
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
  error?:
    | "UNAUTHORIZED"
    | "VALIDATION_ERROR"
    | "LESSON_NOT_FOUND"
    | "LESSON_NOT_PUBLISHED"
    | "ACCESS_DENIED"
    | "INTERNAL_ERROR"
    | "RATE_LIMITED"
    /** The lesson cannot be completed yet: not enough time spent on it (`remainingSeconds`), completions too close
     * together, or too many today. The time spent is recorded anyway. */
    | "WATCH_MORE"
    | "TOO_FAST"
    | "DAILY_LIMIT";
  /** For WATCH_MORE and TOO_FAST: seconds to wait or to spend. */
  remainingSeconds?: number;
  /** What to tell the learner when completion was refused. */
  refusal?: string;
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
 * Records what a learner did in a lesson: time spent (credited no faster than the clock runs, see engagement.ts), the
 * position to resume from, and completion. Only a learner who follows the course records anything: a free preview and
 * the author's look at their own course are read only. Completing a lesson needs the time spent that engagement.ts asks
 * for and respects the pace limits; it may complete the course and issue its certificate.
 *
 * All of a learner's progress writes run under one lock per learner, so the checks that read state before writing
 * (time since the last completion, completions today) cannot be passed twice by parallel requests, and the
 * completed state changes from false to true exactly once (the reward and the course completion follow that one change).
 */
export async function recordLessonProgress(
  viewer: { id: string; role?: string | null } | null,
  input: unknown,
  options: { now?: Date } = {},
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
      select: {
        order: true,
        published: true,
        courseId: true,
        duration: true,
        videoUrl: true,
        course: { select: { slug: true, published: true } },
      },
    });
    if (!lesson) return { success: false, error: "LESSON_NOT_FOUND" };
    if (!lesson.published || !lesson.course.published) return { success: false, error: "LESSON_NOT_PUBLISHED" };
    // Recorded for a learner who follows the course: not for a free preview, not for the author looking at it
    const access = await getLessonAccess(viewer, lessonId);
    if (!access?.canOpen || access.mode !== "full") return { success: false, error: "ACCESS_DENIED" };

    const now = options.now ?? new Date();
    const { updated, completionChanged, refused } = await db.$transaction(async (tx) => {
      await advisoryLock(tx, `progress:${userId}`);
      const existing = await tx.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
        select: { completed: true, updatedAt: true },
      });
      const wasCompleted = existing?.completed ?? false;
      // Time is credited no faster than it passes since the previous report of this lesson
      const credit = creditedSeconds(watchTimeDelta, existing ? (now.getTime() - existing.updatedAt.getTime()) / 1000 : null);

      // 1. Time spent and position, whatever happens to the completion request
      const select = { id: true, completed: true, watchTime: true, completedAt: true, lastPosition: true } as const;
      const recorded = await tx.progress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: { userId, lessonId, completed: false, watchTime: credit, lastPosition: Math.floor(lastPosition ?? 0) },
        update: {
          watchTime: { increment: credit },
          ...(lastPosition !== undefined ? { lastPosition: Math.floor(lastPosition) } : {}),
        },
        select,
      });

      // 2. The completed state changes at most once per request, and only when the update really matched a row
      let completionChanged = false;
      let refused: ReturnType<typeof completionDecision> | null = null;
      if (completed === true && !wasCompleted) {
        const [last, today] = await Promise.all([
          tx.progress.findFirst({
            where: { userId, completed: true, completedAt: { not: null } },
            orderBy: { completedAt: "desc" },
            select: { completedAt: true },
          }),
          tx.progress.count({ where: { userId, completed: true, completedAt: { gt: new Date(now.getTime() - 86_400_000) } } }),
        ]);
        const decision = completionDecision({
          watchTime: recorded.watchTime,
          requiredSeconds: requiredWatchSeconds(lesson),
          lastCompletionAt: last?.completedAt ?? null,
          completionsLast24h: today,
          now,
        });
        if (decision.allowed) {
          const changed = await tx.progress.updateMany({
            where: { userId, lessonId, completed: false },
            data: { completed: true, completedAt: now },
          });
          completionChanged = changed.count === 1;
        } else {
          refused = decision;
        }
      } else if (completed === false && wasCompleted) {
        const changed = await tx.progress.updateMany({
          where: { userId, lessonId, completed: true },
          data: { completed: false, completedAt: null },
        });
        completionChanged = changed.count === 1;
      }

      const updated = completionChanged ? await tx.progress.findUniqueOrThrow({ where: { userId_lessonId: { userId, lessonId } }, select }) : recorded;
      return { updated, completionChanged, refused };
    });

    if (refused && !refused.allowed) {
      return {
        success: false,
        error: refused.reason,
        progress: updated,
        refusal: completionRefusalMessage(refused),
        ...("remainingSeconds" in refused ? { remainingSeconds: refused.remainingSeconds } : {}),
      };
    }

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
