"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AccessService } from "@/lib/access-service";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/structured-logger";
import { PASSING_SCORE } from "@/lib/learning/outline";
import { isCourseStaff } from "@/lib/learning/access";
import { completeCourseIfDone } from "@/lib/learning/completion";
import { rewardQuizPassed } from "@/lib/learning/rewards";
import {
  QUIZ_MAX_ATTEMPTS_PER_DAY,
  canStartQuizAttempt,
  formatRetryDelay,
  quizAttemptExpiry,
  quizDayStart,
} from "@/lib/quiz-attempt-policy";

/**
 * Quiz grading happens on the server. The browser never receives the correct
 * option or the explanation of a question before answering it: it asks
 * checkQuizAnswer for feedback, and submitQuizAnswers grades the whole attempt
 * and stores the result. A score can no longer be forged by posting numbers, and the
 * right answer cannot be read off before committing: the first answer to a question is
 * final, and a new sitting of the same quiz is limited (lib/quiz-attempt-policy.ts).
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
      /** This sitting reached the passing score. */
      passed: boolean;
      /** Best score kept for the learner (a lower retake never replaces it). */
      bestPercentage: number;
      reward: { xp: number } | null;
      /** Where the course stands once this quiz is counted. */
      course: {
        percent: number;
        isComplete: boolean;
        justIssued: boolean;
        certificate: { id: string; code: string } | null;
      };
    }
  | { success: false; error: string };

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

async function isLimited(userId: string, name: string, limit: number): Promise<boolean> {
  const result = await checkRateLimit(await headers(), name, {
    subject: `user:${userId}`,
    limit,
    windowSeconds: 60,
  });
  return !result.allowed;
}

type OpenAttempt = {
  id: string;
  answers: { questionId: string; selectedOption: number; answeredAt: Date }[];
};

/** The sittings of this quiz the learner has started and not finished (normally one), oldest first. */
async function getOpenAttempts(userId: string, quizId: string, now: Date): Promise<OpenAttempt[]> {
  return db.quizAttempt.findMany({
    where: { userId, quizId, submittedAt: null, startedAt: { gt: quizAttemptExpiry(now) } },
    orderBy: { startedAt: "asc" },
    select: {
      id: true,
      answers: { select: { questionId: true, selectedOption: true, answeredAt: true } },
    },
  });
}

/**
 * Starts a sitting if the cooldown and the daily cap allow it. The error is the message
 * shown to the learner when they do not.
 */
async function startAttempt(
  userId: string,
  quizId: string,
  now: Date,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const finished = await db.quizAttempt.findMany({
    where: { userId, quizId, submittedAt: { gt: quizDayStart(now) } },
    select: { submittedAt: true },
  });
  const decision = canStartQuizAttempt(
    finished.flatMap((attempt) => (attempt.submittedAt ? [attempt.submittedAt] : [])),
    now,
  );
  if (!decision.allowed) {
    const when = formatRetryDelay(decision.retryAt, now);
    return {
      ok: false,
      error:
        decision.reason === "COOLDOWN"
          ? `Vous pourrez refaire ce quiz ${when}`
          : `Limite de ${QUIZ_MAX_ATTEMPTS_PER_DAY} tentatives par jour atteinte, réessayez ${when}`,
    };
  }
  const created = await db.quizAttempt.create({ data: { userId, quizId }, select: { id: true } });
  return { ok: true, id: created.id };
}

/** First answer recorded for each question across the open sittings: it cannot be changed. */
function recordedAnswers(attempts: OpenAttempt[]): Map<string, number> {
  const recorded = new Map<string, { selectedOption: number; answeredAt: number }>();
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const known = recorded.get(answer.questionId);
      if (!known || answer.answeredAt.getTime() < known.answeredAt) {
        recorded.set(answer.questionId, {
          selectedOption: answer.selectedOption,
          answeredAt: answer.answeredAt.getTime(),
        });
      }
    }
  }
  return new Map([...recorded].map(([questionId, { selectedOption }]) => [questionId, selectedOption]));
}

/**
 * Feedback for one answer. Also verifies that the caller can access the course
 * the quiz belongs to. The first answer to a question is recorded on the learner's
 * current sitting and is final: asking again with another option returns the feedback
 * for the recorded one, so the right answer cannot be found by trying every option.
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
    if (await isLimited(userId, "quiz-check", 120)) {
      return { success: false, error: "Trop de requêtes, réessayez dans un instant" };
    }

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
    const staffPreview = !access.canAccessCourse && (await isCourseStaff(userId, question.quiz.courseId));
    if (!access.canAccessCourse && !staffPreview) return { success: false, error: "Accès refusé" };

    if (selectedOption >= question.options.length) {
      return { success: false, error: "Réponse invalide" };
    }

    // The author trying their own quiz sees the feedback; nothing is recorded
    if (staffPreview) {
      return {
        success: true,
        questionId: question.id,
        isCorrect: selectedOption === question.correct,
        correctOption: question.correct,
        explanation: question.explanation ?? "",
      };
    }

    const now = new Date();
    const open = await getOpenAttempts(userId, quizId, now);
    let effectiveOption = recordedAnswers(open).get(questionId);

    if (effectiveOption === undefined) {
      let attemptId = open.at(-1)?.id;
      if (!attemptId) {
        const started = await startAttempt(userId, quizId, now);
        if (!started.ok) return { success: false, error: started.error };
        attemptId = started.id;
      }
      // a parallel request may have recorded this question first: its answer wins
      await db.quizAttemptAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId } },
        create: { attemptId, questionId, selectedOption },
        update: {},
      });
      effectiveOption = selectedOption;
    }

    return {
      success: true,
      questionId: question.id,
      isCorrect: effectiveOption === question.correct,
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
 * result). Every question of the quiz must be answered exactly once. A question
 * whose feedback was already shown is graded on the answer recorded then, whatever
 * the browser sends now; the others on the submitted answer. A new sitting is subject to
 * the cooldown and the daily cap (lib/quiz-attempt-policy.ts).
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
    if (await isLimited(userId, "quiz-submit", 30)) {
      return { success: false, error: "Trop de requêtes, réessayez dans un instant" };
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: {
        courseId: true,
        course: { select: { slug: true } },
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
    const staffPreview = !access.canAccessCourse && (await isCourseStaff(userId, courseId));
    if (!access.canAccessCourse && !staffPreview) return { success: false, error: "Accès refusé" };

    const submitted = new Map<string, number>();
    for (const answer of answers) {
      if (submitted.has(answer.questionId)) {
        return { success: false, error: "Réponses invalides" };
      }
      submitted.set(answer.questionId, answer.selectedOption);
    }

    const total = quiz.questions.length;
    const answeredAll =
      total > 0 &&
      submitted.size === total &&
      quiz.questions.every((q) => submitted.has(q.id));
    if (!answeredAll) return { success: false, error: "Quiz incomplet" };

    if (staffPreview) {
      const review: QuizFeedback[] = quiz.questions.map((q) => ({
        questionId: q.id,
        isCorrect: submitted.get(q.id) === q.correct,
        correctOption: q.correct,
        explanation: q.explanation ?? "",
      }));
      const score = review.filter((r) => r.isCorrect).length;
      const percentage = Math.round((score / total) * 100);
      return {
        success: true,
        score,
        total,
        percentage,
        review,
        passed: percentage >= PASSING_SCORE,
        bestPercentage: percentage,
        reward: null,
        course: { percent: 0, isComplete: false, justIssued: false, certificate: null },
      };
    }

    const now = new Date();
    const open = await getOpenAttempts(userId, quizId, now);
    const attemptIds = open.map((attempt) => attempt.id);
    if (attemptIds.length === 0) {
      // answered without asking for feedback (direct call): still one sitting
      const started = await startAttempt(userId, quizId, now);
      if (!started.ok) return { success: false, error: started.error };
      attemptIds.push(started.id);
    }

    const recorded = recordedAnswers(open);
    const selectedByQuestion = new Map(
      quiz.questions.map((q) => [q.id, recorded.get(q.id) ?? submitted.get(q.id)!] as const),
    );

    const review: QuizFeedback[] = quiz.questions.map((q) => ({
      questionId: q.id,
      isCorrect: selectedByQuestion.get(q.id) === q.correct,
      correctOption: q.correct,
      explanation: q.explanation ?? "",
    }));
    const score = review.filter((r) => r.isCorrect).length;
    const percentage = Math.round((score / total) * 100);

    // The stored result is the best one: a worse retake is graded and shown but does not replace it
    const previous = await db.quizResult.findUnique({
      where: { userId_quizId: { userId, quizId } },
      select: { percentage: true },
    });
    const keepsPrevious = previous !== null && previous.percentage > percentage;
    await db.$transaction([
      db.quizResult.upsert({
        where: { userId_quizId: { userId, quizId } },
        create: { userId, quizId, score, total, percentage },
        update: keepsPrevious ? {} : { score, total, percentage, completedAt: now },
      }),
      db.quizAttempt.updateMany({
        where: { id: { in: attemptIds }, submittedAt: null },
        data: { submittedAt: now },
      }),
    ]);

    const bestPercentage = keepsPrevious ? previous.percentage : percentage;
    const passed = percentage >= PASSING_SCORE;
    const reward = passed ? await rewardQuizPassed(userId, quizId) : null;
    const outcome = await completeCourseIfDone(userId, courseId);
    revalidatePath("/dashboard");
    revalidatePath(`/learn/${quiz.course.slug}`, "layout");
    revalidatePath(`/formations/${quiz.course.slug}`);

    return {
      success: true,
      score,
      total,
      percentage,
      review,
      passed,
      bestPercentage,
      reward,
      course: {
        percent: outcome.progress.percent,
        isComplete: outcome.isComplete,
        justIssued: outcome.justIssued,
        certificate: outcome.certificate ? { id: outcome.certificate.id, code: outcome.certificate.code } : null,
      },
    };
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
