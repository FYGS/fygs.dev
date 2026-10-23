import { db } from "@/lib/db";
import { awardXp, updateStreak } from "@/lib/gamification";
import { PASSING_SCORE } from "./outline";

/**
 * XP and streak for learning milestones. Each reward is given once and only for something the
 * server has recorded itself (a completed lesson, a passed quiz, a complete course), so calling
 * these twice, or for something not done, gives nothing.
 */

export interface LessonReward {
  xp: number;
  streak: number;
  isFirstLesson: boolean;
}

export async function rewardLessonCompleted(userId: string, lessonId: string): Promise<LessonReward | null> {
  const completed = await db.progress.findFirst({
    where: { userId, lessonId, completed: true },
    select: { id: true },
  });
  if (!completed) return null;

  const already = await db.xpEvent.findFirst({
    where: { userId, reason: "LESSON_COMPLETED", metadata: { path: ["lessonId"], equals: lessonId } },
    select: { id: true },
  });
  if (already) return null;

  const completedLessons = await db.progress.count({ where: { userId, completed: true } });
  const streak = await updateStreak(userId);
  const event = await awardXp(userId, "LESSON_COMPLETED", { lessonId });
  const isFirstLesson = completedLessons === 1;
  if (isFirstLesson) await awardXp(userId, "FIRST_LESSON", { lessonId });

  return { xp: event.amount, streak: streak.currentStreak, isFirstLesson };
}

export async function rewardQuizPassed(userId: string, quizId: string): Promise<{ xp: number } | null> {
  const passed = await db.quizResult.findFirst({
    where: { userId, quizId, percentage: { gte: PASSING_SCORE } },
    select: { id: true },
  });
  if (!passed) return null;

  const already = await db.xpEvent.findFirst({
    where: { userId, reason: "QUIZ_PASSED", metadata: { path: ["quizId"], equals: quizId } },
    select: { id: true },
  });
  if (already) return null;

  await updateStreak(userId);
  const event = await awardXp(userId, "QUIZ_PASSED", { quizId });
  return { xp: event.amount };
}

/** Called by the completion pipeline once the course is complete (see completion.ts). */
export async function rewardCourseCompleted(userId: string, courseId: string): Promise<{ xp: number } | null> {
  const already = await db.xpEvent.findFirst({
    where: { userId, reason: "COURSE_COMPLETED", metadata: { path: ["courseId"], equals: courseId } },
    select: { id: true },
  });
  if (already) return null;
  const event = await awardXp(userId, "COURSE_COMPLETED", { courseId });
  return { xp: event.amount };
}
