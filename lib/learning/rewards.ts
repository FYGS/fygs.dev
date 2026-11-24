import { db } from "@/lib/db";
import { awardXp, updateStreak } from "@/lib/gamification";
import { PASSING_SCORE } from "./outline";

/**
 * XP and streak for learning milestones. Each reward is given once and only for something the server has recorded
 * itself (a completed lesson, a passed quiz, a complete course). "Once" is a unique key in the database (user, reason,
 * target), so calling these twice, in parallel or not, or for something not done, gives nothing the second time.
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

  const event = await awardXp(userId, "LESSON_COMPLETED", lessonId, { lessonId });
  if (!event) return null; // already rewarded

  const streak = await updateStreak(userId);
  // One bonus per learner, ever: the first lesson that was rewarded (the unique key refuses any later one)
  const firstLesson = await awardXp(userId, "FIRST_LESSON", "first-lesson", { lessonId });
  return { xp: event.amount, streak: streak.currentStreak, isFirstLesson: firstLesson !== null };
}

export async function rewardQuizPassed(userId: string, quizId: string): Promise<{ xp: number } | null> {
  const passed = await db.quizResult.findFirst({
    where: { userId, quizId, percentage: { gte: PASSING_SCORE } },
    select: { id: true },
  });
  if (!passed) return null;

  const event = await awardXp(userId, "QUIZ_PASSED", quizId, { quizId });
  if (!event) return null;
  await updateStreak(userId);
  return { xp: event.amount };
}

/** Called by the completion pipeline once the course is complete (see completion.ts). */
export async function rewardCourseCompleted(userId: string, courseId: string): Promise<{ xp: number } | null> {
  const event = await awardXp(userId, "COURSE_COMPLETED", courseId, { courseId });
  return event ? { xp: event.amount } : null;
}
