"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { awardXp, updateStreak } from "@/lib/gamification";
import { db } from "@/lib/db";

/**
 * Called when a lesson is marked as completed.
 * Awards XP + updates streak.
 */
export async function onLessonCompleted(lessonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userId = session.user.id;

  // Only reward a lesson this user has really completed (server-side progress)
  const completed = await db.progress.findFirst({
    where: { userId, lessonId, completed: true },
    select: { id: true },
  });
  if (!completed) return null;

  // Check if already rewarded (idempotent)
  const existing = await db.xpEvent.findFirst({
    where: {
      userId,
      reason: "LESSON_COMPLETED",
      metadata: { path: ["lessonId"], equals: lessonId },
    },
  });

  if (existing) return null;

  // Check if this is user's first ever lesson
  const lessonCount = await db.progress.count({
    where: { userId, completed: true },
  });

  const streakResult = await updateStreak(userId);

  // Award XP
  const xpEvent = await awardXp(userId, "LESSON_COMPLETED", { lessonId });

  // First lesson bonus
  if (lessonCount === 1) {
    await awardXp(userId, "FIRST_LESSON", { lessonId });
  }

  return {
    xp: xpEvent.amount,
    streak: streakResult.currentStreak,
    isFirstLesson: lessonCount === 1,
  };
}

/**
 * Called when a quiz is passed (>= 70%)
 */
export async function onQuizPassed(quizId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userId = session.user.id;

  // Only reward a quiz this user has really passed (>= 70%)
  const passed = await db.quizResult.findFirst({
    where: { userId, quizId, percentage: { gte: 70 } },
    select: { id: true },
  });
  if (!passed) return null;

  const existing = await db.xpEvent.findFirst({
    where: {
      userId,
      reason: "QUIZ_PASSED",
      metadata: { path: ["quizId"], equals: quizId },
    },
  });

  if (existing) return null;

  await updateStreak(userId);
  const xpEvent = await awardXp(userId, "QUIZ_PASSED", { quizId });

  return { xp: xpEvent.amount };
}

/**
 * Called when all lessons + quizzes in a course are completed
 */
export async function onCourseCompleted(courseId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userId = session.user.id;

  // Validate completion before awarding XP
  const [publishedLessons, courseQuizzes, completedLessons, passedQuizzes] =
    await Promise.all([
      db.lesson.findMany({
        where: { courseId, published: true },
        select: { id: true },
      }),
      db.quiz.findMany({
        where: { courseId },
        select: { id: true },
      }),
      db.progress.findMany({
        where: {
          userId,
          completed: true,
          lesson: { courseId, published: true },
        },
        select: { lessonId: true },
      }),
      db.quizResult.findMany({
        where: {
          userId,
          percentage: { gte: 70 },
          quiz: { courseId },
        },
        select: { quizId: true },
      }),
    ]);

  const totalItems = publishedLessons.length + courseQuizzes.length;
  const completedItems = completedLessons.length + passedQuizzes.length;

  if (totalItems === 0 || completedItems < totalItems) {
    return null;
  }

  const existing = await db.xpEvent.findFirst({
    where: {
      userId,
      reason: "COURSE_COMPLETED",
      metadata: { path: ["courseId"], equals: courseId },
    },
  });

  if (existing) return null;

  const xpEvent = await awardXp(userId, "COURSE_COMPLETED", { courseId });
  return { xp: xpEvent.amount };
}
