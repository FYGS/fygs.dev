"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/structured-logger";
import { formatRetryDelay } from "@/lib/quiz-attempt-policy";
import { isCourseStaff } from "@/lib/learning/access";
import { completeCourseIfDone } from "@/lib/learning/completion";
import {
  examRetakeDecision,
  gradeExam,
  parseExamQuestions,
  withinTimeLimit,
  type ExamReviewItem,
} from "@/lib/learning/exam";
import { signExamStart, verifyExamStart } from "@/lib/learning/exam-token";

/**
 * Final exam. Same promise as the quizzes: the questions reach the browser without their answers,
 * the server grades, and the score cannot be forged. The sitting starts with a signed token that
 * carries its start time, so the time limit is enforced here and not only by the clock on the page.
 */

const startSchema = z.object({ courseId: z.string().min(1).max(64) });
const submitSchema = z.object({
  examId: z.string().min(1).max(64),
  token: z.string().min(1).max(200),
  answers: z.array(z.number().int().min(-1).max(50).nullable()).max(500),
});

export type StartExamResult =
  | {
      success: true;
      exam: {
        id: string;
        title: string;
        description: string | null;
        passingScore: number;
        timeLimit: number | null;
        questions: { question: string; options: string[] }[];
      };
      token: string;
      startedAt: number;
    }
  | { success: false; error: string };

export type SubmitExamResult =
  | {
      success: true;
      score: number;
      total: number;
      percentage: number;
      passed: boolean;
      passingScore: number;
      review: ExamReviewItem[];
      course: {
        percent: number;
        isComplete: boolean;
        justIssued: boolean;
        certificate: { id: string; code: string } | null;
      };
    }
  | { success: false; error: string };

async function limited(userId: string, name: string, limit: number): Promise<boolean> {
  const result = await checkRateLimit(await headers(), name, {
    subject: `user:${userId}`,
    limit,
    windowSeconds: 60,
  });
  return !result.allowed;
}

async function userId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function startFinalExam(input: z.infer<typeof startSchema>): Promise<StartExamResult> {
  try {
    const parsed = startSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Demande invalide" };
    const { courseId } = parsed.data;

    const uid = await userId();
    if (!uid) return { success: false, error: "Non authentifié" };
    if (await limited(uid, "exam-start", 20)) return { success: false, error: "Trop de requêtes, réessayez dans un instant" };

    const access = await AccessService.checkCourseAccess(uid, courseId);
    const staff = !access.canAccessCourse && (await isCourseStaff(uid, courseId));
    if (!access.canAccessCourse && !staff) return { success: false, error: "Accès refusé" };

    const exam = await db.finalExam.findFirst({
      where: { courseId, ...(staff ? {} : { published: true }) },
      select: { id: true, title: true, description: true, passingScore: true, timeLimit: true, questions: true },
    });
    const questions = exam ? parseExamQuestions(exam.questions) : [];
    if (!exam || questions.length === 0) return { success: false, error: "Cet examen n’est pas disponible" };

    if (!staff) {
      const last = await db.examResult.findUnique({
        where: { userId_examId: { userId: uid, examId: exam.id } },
        select: { completedAt: true, passed: true },
      });
      const decision = examRetakeDecision(last, new Date());
      if (!decision.allowed) {
        return {
          success: false,
          error:
            decision.reason === "PASSED"
              ? "Vous avez déjà réussi cet examen"
              : `Vous pourrez repasser l’examen ${formatRetryDelay(decision.retryAt, new Date())}`,
        };
      }
    }

    const startedAt = Date.now();
    return {
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit,
        // the right answers and explanations stay on the server until the sitting is graded
        questions: questions.map((q) => ({ question: q.question, options: q.options })),
      },
      token: signExamStart(uid, exam.id, startedAt),
      startedAt,
    };
  } catch (error) {
    logger.error("Error starting final exam", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return { success: false, error: "Erreur lors du démarrage de l’examen" };
  }
}

export async function submitFinalExam(input: z.infer<typeof submitSchema>): Promise<SubmitExamResult> {
  try {
    const parsed = submitSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Réponses invalides" };
    const { examId, token, answers } = parsed.data;

    const uid = await userId();
    if (!uid) return { success: false, error: "Non authentifié" };
    if (await limited(uid, "exam-submit", 10)) return { success: false, error: "Trop de requêtes, réessayez dans un instant" };

    const exam = await db.finalExam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        courseId: true,
        passingScore: true,
        timeLimit: true,
        questions: true,
        course: { select: { slug: true } },
      },
    });
    if (!exam) return { success: false, error: "Examen introuvable" };

    const access = await AccessService.checkCourseAccess(uid, exam.courseId);
    const staff = !access.canAccessCourse && (await isCourseStaff(uid, exam.courseId));
    if (!access.canAccessCourse && !staff) return { success: false, error: "Accès refusé" };

    const startedAt = verifyExamStart(token, uid, examId);
    if (startedAt === null) return { success: false, error: "Session d’examen invalide, recommencez" };
    const now = Date.now();
    if (!withinTimeLimit(startedAt, now, exam.timeLimit)) {
      return { success: false, error: "Le temps imparti est écoulé" };
    }

    const questions = parseExamQuestions(exam.questions);
    if (answers.length !== questions.length) return { success: false, error: "Réponses invalides" };
    const grade = gradeExam(questions, answers, exam.passingScore);

    const emptyCourse = { percent: 0, isComplete: false, justIssued: false, certificate: null };
    const base = {
      success: true as const,
      score: grade.score,
      total: grade.total,
      percentage: grade.percentage,
      passed: grade.passed,
      passingScore: exam.passingScore,
      review: grade.review,
    };
    if (staff) return { ...base, course: emptyCourse };

    // A sitting started before a pass and submitted after it (two tabs) does not erase the pass
    const previous = await db.examResult.findUnique({
      where: { userId_examId: { userId: uid, examId } },
      select: { passed: true },
    });
    if (!previous?.passed) {
      const data = {
        score: grade.score,
        total: grade.total,
        percentage: grade.percentage,
        passed: grade.passed,
        answers: answers as unknown as object,
        completedAt: new Date(now),
      };
      await db.examResult.upsert({
        where: { userId_examId: { userId: uid, examId } },
        create: { userId: uid, examId, ...data },
        update: data,
      });
    }

    const outcome = await completeCourseIfDone(uid, exam.courseId);
    revalidatePath("/dashboard");
    revalidatePath(`/learn/${exam.course.slug}`, "layout");
    revalidatePath(`/formations/${exam.course.slug}`);

    return {
      ...base,
      course: {
        percent: outcome.progress.percent,
        isComplete: outcome.isComplete,
        justIssued: outcome.justIssued,
        certificate: outcome.certificate ? { id: outcome.certificate.id, code: outcome.certificate.code } : null,
      },
    };
  } catch (error) {
    logger.error("Error submitting final exam", {
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return { success: false, error: "Erreur lors de l’enregistrement de l’examen" };
  }
}
