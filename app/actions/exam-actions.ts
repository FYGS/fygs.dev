"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/structured-logger";
import { completeCourseIfDone } from "@/lib/learning/completion";
import { gradeExam, parseExamQuestions, projectReview, withinTimeLimit, type ExamReview } from "@/lib/learning/exam";
import { gradeSitting, nextSittingInfo, openSitting } from "@/lib/learning/exam-sittings";
import {
  isPreviewAttempt,
  previewAttemptId,
  previewAttemptStart,
  signExamAttempt,
  verifyExamAttempt,
} from "@/lib/learning/exam-token";

/**
 * Final exam. The questions reach the browser without their answers and the server grades. A sitting is a row
 * (`ExamAttempt`): starting one is subject to the cooldown, the daily cap and the "already passed" rule; submitting
 * claims the row exactly once, so the token of a sitting cannot be replayed to try the answers again. A failed sitting
 * reveals which questions were missed but never the right answers or the explanations; a passed one reveals them
 * (lib/learning/exam.ts, `projectReview`).
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
      /** The sitting was already open (page reloaded): the clock did not restart. */
      resumed: boolean;
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
      review: ExamReview;
      /** After a failed sitting: when the next one is possible and how many are left today. */
      next: { retryAt: string | null; sittingsLeftToday: number } | null;
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

const UNAVAILABLE = "Cet examen n’est pas disponible";

export async function startFinalExam(input: z.infer<typeof startSchema>): Promise<StartExamResult> {
  try {
    const parsed = startSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Demande invalide" };
    const { courseId } = parsed.data;

    const uid = await userId();
    if (!uid) return { success: false, error: "Non authentifié" };
    if (await limited(uid, "exam-start", 20)) return { success: false, error: "Trop de requêtes, réessayez dans un instant" };

    const access = await AccessService.checkCourseAccess(uid, courseId);
    if (!access.canAccessCourse) return { success: false, error: "Accès refusé" };
    // The author (or an admin) trying the exam holds no learner's right: nothing is stored. Whoever holds one sits it for real.
    const staff = !access.recordsProgress;

    const exam = await db.finalExam.findFirst({
      where: { courseId, ...(staff ? {} : { published: true }) },
      select: { id: true, title: true, description: true, passingScore: true, timeLimit: true, questions: true },
    });
    const questions = exam ? parseExamQuestions(exam.questions) : [];
    if (!exam || questions.length === 0) return { success: false, error: UNAVAILABLE };

    const publicExam = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passingScore: exam.passingScore,
      timeLimit: exam.timeLimit,
      // the right answers and explanations stay on the server until the sitting is graded
      questions: questions.map((q) => ({ question: q.question, options: q.options })),
    };

    if (staff) {
      const startedAt = Date.now();
      return {
        success: true,
        exam: publicExam,
        token: signExamAttempt(uid, exam.id, previewAttemptId(startedAt)),
        startedAt,
        resumed: false,
      };
    }

    const sitting = await openSitting({ userId: uid, examId: exam.id, timeLimit: exam.timeLimit });
    if (!sitting.ok) return { success: false, error: sitting.error };
    return {
      success: true,
      exam: publicExam,
      token: signExamAttempt(uid, exam.id, sitting.attemptId),
      startedAt: sitting.startedAt.getTime(),
      resumed: sitting.resumed,
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
        published: true,
        passingScore: true,
        timeLimit: true,
        questions: true,
        course: { select: { slug: true } },
      },
    });
    if (!exam) return { success: false, error: "Examen introuvable" };

    const access = await AccessService.checkCourseAccess(uid, exam.courseId);
    if (!access.canAccessCourse) return { success: false, error: "Accès refusé" };
    const staff = !access.recordsProgress;
    // A learner only sits a published exam (the author may try their own drafts). A withdrawn course keeps its exam
    // for the people who hold the course (FR-041).
    if (!staff && !exam.published) return { success: false, error: UNAVAILABLE };

    const attemptId = verifyExamAttempt(token, uid, examId);
    if (attemptId === null) return { success: false, error: "Session d’examen invalide, recommencez" };

    const questions = parseExamQuestions(exam.questions);
    if (answers.length !== questions.length) return { success: false, error: "Réponses invalides" };

    const emptyCourse = { percent: 0, isComplete: false, justIssued: false, certificate: null };

    if (staff) {
      // The author's try-out: a throw-away sitting, nothing is stored, the whole correction is shown
      const startedAt = isPreviewAttempt(attemptId) ? previewAttemptStart(attemptId) : null;
      if (startedAt === null) return { success: false, error: "Session d’examen invalide, recommencez" };
      if (!withinTimeLimit(startedAt, Date.now(), exam.timeLimit)) return { success: false, error: "Le temps imparti est écoulé" };
      const grade = gradeExam(questions, answers, exam.passingScore);
      return {
        success: true,
        score: grade.score,
        total: grade.total,
        percentage: grade.percentage,
        passed: grade.passed,
        passingScore: exam.passingScore,
        review: projectReview(grade, true),
        next: null,
        course: emptyCourse,
      };
    }

    // A learner never presents the token of an author's try-out
    if (isPreviewAttempt(attemptId)) return { success: false, error: "Session d’examen invalide, recommencez" };

    const now = new Date();
    const graded = await gradeSitting({
      userId: uid,
      examId,
      attemptId,
      timeLimit: exam.timeLimit,
      passingScore: exam.passingScore,
      questions,
      answers,
      now,
    });
    if (!graded.ok) return { success: false, error: graded.error };
    const { grade } = graded;

    const outcome = await completeCourseIfDone(uid, exam.courseId);
    const next = grade.passed ? null : await nextSittingInfo(uid, examId, now);
    revalidatePath("/dashboard");
    revalidatePath(`/learn/${exam.course.slug}`, "layout");
    revalidatePath(`/formations/${exam.course.slug}`);

    return {
      success: true,
      score: grade.score,
      total: grade.total,
      percentage: grade.percentage,
      passed: grade.passed,
      passingScore: exam.passingScore,
      review: projectReview(grade),
      next,
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
