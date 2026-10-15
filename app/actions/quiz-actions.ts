"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AccessService } from "@/lib/access-service";
import { headers } from "next/headers";
import { logger } from "@/lib/structured-logger";

/**
 * Quiz grading happens on the server. The browser never receives the correct
 * option or the explanation of a question before answering it: it asks
 * checkQuizAnswer for feedback, and submitQuizAnswers grades the whole attempt
 * and stores the result. A score can no longer be forged by posting numbers.
 */

const checkAnswerSchema = z.object({
  quizId: z.string().min(1).max(64),
  questionId: z.string().min(1).max(64),
  selectedOption: z.number().int().min(0).max(50),
});

const submitAnswersSchema = z.object({
  quizId: z.string().min(1).max(64),
  courseId: z.string().min(1).max(64),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(64),
        selectedOption: z.number().int().min(0).max(50),
      }),
    )
    .max(200),
});

export type QuizFeedback = {
  questionId: string;
  isCorrect: boolean;
  correctOption: number;
  explanation: string;
};

export type CheckQuizAnswerResult =
  | ({ success: true } & QuizFeedback)
  | { success: false; error: string };

export type SubmitQuizAnswersResult =
  | {
      success: true;
      score: number;
      total: number;
      percentage: number;
      review: QuizFeedback[];
    }
  | { success: false; error: string };

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

/**
 * Feedback for one answer. Also verifies that the caller can access the course
 * the quiz belongs to.
 */
export async function checkQuizAnswer(
  input: z.infer<typeof checkAnswerSchema>,
): Promise<CheckQuizAnswerResult> {
  try {
    const parsed = checkAnswerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Réponse invalide" };
    const { quizId, questionId, selectedOption } = parsed.data;

    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Non authentifié" };

    const question = await db.quizQuestion.findFirst({
      where: { id: questionId, quizId },
      select: {
        id: true,
        options: true,
        correct: true,
        explanation: true,
        quiz: { select: { courseId: true } },
      },
    });
    if (!question) return { success: false, error: "Question invalide" };

    const access = await AccessService.checkCourseAccess(
      userId,
      question.quiz.courseId,
    );
    if (!access.canAccessCourse) return { success: false, error: "Accès refusé" };

    if (selectedOption >= question.options.length) {
      return { success: false, error: "Réponse invalide" };
    }

    return {
      success: true,
      questionId: question.id,
      isCorrect: selectedOption === question.correct,
      correctOption: question.correct,
      explanation: question.explanation ?? "",
    };
  } catch (error) {
    logger.error("Error checking quiz answer", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return { success: false, error: "Erreur lors de la vérification" };
  }
}

/**
 * Grade a complete attempt and save the result (retakes overwrite the previous
 * result). Every question of the quiz must be answered exactly once.
 */
export async function submitQuizAnswers(
  input: z.infer<typeof submitAnswersSchema>,
): Promise<SubmitQuizAnswersResult> {
  try {
    const parsed = submitAnswersSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Réponses invalides" };
    const { quizId, courseId, answers } = parsed.data;

    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Non authentifié" };

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: {
        courseId: true,
        questions: {
          select: { id: true, options: true, correct: true, explanation: true },
          orderBy: { order: "asc" },
        },
      },
    });
    if (!quiz || quiz.courseId !== courseId) {
      return { success: false, error: "Quiz invalide" };
    }

    const access = await AccessService.checkCourseAccess(userId, courseId);
    if (!access.canAccessCourse) return { success: false, error: "Accès refusé" };

    const selectedByQuestion = new Map<string, number>();
    for (const answer of answers) {
      if (selectedByQuestion.has(answer.questionId)) {
        return { success: false, error: "Réponses invalides" };
      }
      selectedByQuestion.set(answer.questionId, answer.selectedOption);
    }

    const total = quiz.questions.length;
    const answeredAll =
      total > 0 &&
      selectedByQuestion.size === total &&
      quiz.questions.every((q) => selectedByQuestion.has(q.id));
    if (!answeredAll) return { success: false, error: "Quiz incomplet" };

    const review: QuizFeedback[] = quiz.questions.map((q) => ({
      questionId: q.id,
      isCorrect: selectedByQuestion.get(q.id) === q.correct,
      correctOption: q.correct,
      explanation: q.explanation ?? "",
    }));
    const score = review.filter((r) => r.isCorrect).length;
    const percentage = Math.round((score / total) * 100);

    await db.quizResult.upsert({
      where: { userId_quizId: { userId, quizId } },
      create: { userId, quizId, score, total, percentage },
      update: { score, total, percentage, completedAt: new Date() },
    });

    return { success: true, score, total, percentage, review };
  } catch (error) {
    logger.error("Error submitting quiz answers", {
      metadata: {
        quizId: input?.quizId,
        courseId: input?.courseId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return {
      success: false,
      error: "Erreur lors de la sauvegarde du résultat",
    };
  }
}
