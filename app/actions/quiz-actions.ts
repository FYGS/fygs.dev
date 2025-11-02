"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logger } from "@/lib/structured-logger";

/**
 * Submit quiz result and save to database
 */
export async function submitQuizResult(data: {
  quizId: string;
  courseId: string;
  score: number;
  total: number;
  percentage: number;
}) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Non authentifié" };
    }

    const userId = session.user.id;

    // Verify quiz belongs to course
    const quiz = await db.quiz.findUnique({
      where: { id: data.quizId },
      select: { courseId: true },
    });

    if (!quiz || quiz.courseId !== data.courseId) {
      return { success: false, error: "Quiz invalide" };
    }

    // Upsert quiz result (allows retaking quizzes)
    const result = await db.quizResult.upsert({
      where: {
        userId_quizId: {
          userId,
          quizId: data.quizId,
        },
      },
      create: {
        userId,
        quizId: data.quizId,
        score: data.score,
        total: data.total,
        percentage: data.percentage,
      },
      update: {
        score: data.score,
        total: data.total,
        percentage: data.percentage,
        completedAt: new Date(),
      },
    });

    return { success: true, result };
  } catch (error) {
    logger.error("Error submitting quiz result", {
      metadata: {
        quizId: data.quizId,
        courseId: data.courseId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors de la sauvegarde du résultat",
    };
  }
}
