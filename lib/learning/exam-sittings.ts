import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { formatRetryDelay } from "@/lib/quiz-attempt-policy";
import {
  examBlockMessage,
  examSittingDecision,
  examSittingWindowMs,
  gradeExam,
  EXAM_MAX_SITTINGS_PER_DAY,
  type ExamGrade,
  type ExamQuestion,
  type ExamSittingDecision,
} from "./exam";
import { advisoryLock } from "./locks";

/**
 * The sittings of a final exam, kept in `ExamAttempt` rows. A sitting is OPEN from the moment it starts until it is
 * submitted (claimed once) or abandoned (its window ran out). Every rule that depends on the history of a learner is
 * evaluated under one advisory lock per learner and exam, so parallel requests cannot both pass a check.
 */

type Tx = Prisma.TransactionClient;

const DAY_MS = 24 * 60 * 60_000;

export const examLockKey = (userId: string, examId: string) => `exam:${userId}:${examId}`;

/** What the learner has already done on this exam: passed once, and the end times of the last 24 hours of sittings. */
export async function loadSittingHistory(
  client: Tx | typeof db,
  userId: string,
  examId: string,
  now: Date,
): Promise<{ passedBefore: boolean; recent: Date[] }> {
  const [passedAttempts, recent, anyAttempt, legacyResult] = await Promise.all([
    client.examAttempt.count({ where: { userId, examId, passed: true } }),
    client.examAttempt.findMany({
      where: { userId, examId, submittedAt: { gt: new Date(now.getTime() - DAY_MS) } },
      select: { submittedAt: true },
    }),
    client.examAttempt.count({ where: { userId, examId } }),
    client.examResult.findUnique({
      where: { userId_examId: { userId, examId } },
      select: { passed: true, completedAt: true },
    }),
  ]);
  const recentDates = recent.flatMap((attempt) => (attempt.submittedAt ? [attempt.submittedAt] : []));
  // A result recorded before sittings were kept (no sitting row at all) still counts
  if (anyAttempt === 0 && legacyResult && now.getTime() - legacyResult.completedAt.getTime() < DAY_MS) {
    recentDates.push(legacyResult.completedAt);
  }
  return { passedBefore: passedAttempts > 0 || legacyResult?.passed === true, recent: recentDates };
}

/** Why the learner cannot start a sitting now, in words, or null. Same rule as `openSitting`, asked up front by the page. */
export async function getExamStartBlock(userId: string, examId: string, now = new Date()): Promise<string | null> {
  const open = await db.examAttempt.findFirst({
    where: { userId, examId, submittedAt: null },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true, exam: { select: { timeLimit: true } } },
  });
  if (open && now.getTime() - open.startedAt.getTime() <= examSittingWindowMs(open.exam.timeLimit)) return null; // resumable
  const decision = examSittingDecision(await loadSittingHistory(db, userId, examId, now), now);
  return decision.allowed ? null : describeBlock(decision, now);
}

export function describeBlock(decision: Exclude<ExamSittingDecision, { allowed: true }>, now: Date): string {
  const when = decision.reason === "PASSED" ? "" : formatRetryDelay(decision.retryAt, now);
  return examBlockMessage(decision, when);
}

export type OpenSittingResult =
  | { ok: true; attemptId: string; startedAt: Date; resumed: boolean }
  | { ok: false; error: string };

/**
 * Starts a sitting, or returns the one already open (a reload does not cost a sitting and does not restart the clock).
 * Sittings whose window ran out are closed first as failed ones, dated at the end of their window: they count for the
 * cooldown and the daily cap, so leaving a sitting unsubmitted is not a way around them.
 */
export async function openSitting(params: {
  userId: string;
  examId: string;
  timeLimit: number | null;
  now?: Date;
}): Promise<OpenSittingResult> {
  const { userId, examId, timeLimit } = params;
  const now = params.now ?? new Date();
  const windowMs = examSittingWindowMs(timeLimit);

  return db.$transaction(async (tx) => {
    await advisoryLock(tx, examLockKey(userId, examId));

    const open = await tx.examAttempt.findMany({
      where: { userId, examId, submittedAt: null },
      orderBy: { startedAt: "desc" },
      select: { id: true, startedAt: true },
    });
    const live = open.find((attempt) => now.getTime() - attempt.startedAt.getTime() <= windowMs);
    for (const attempt of open) {
      if (attempt === live) continue;
      const endedAt = new Date(Math.min(attempt.startedAt.getTime() + windowMs, now.getTime()));
      await tx.examAttempt.update({ where: { id: attempt.id }, data: { submittedAt: endedAt, passed: false } });
    }
    if (live) return { ok: true as const, attemptId: live.id, startedAt: live.startedAt, resumed: true };

    const decision = examSittingDecision(await loadSittingHistory(tx, userId, examId, now), now);
    if (!decision.allowed) return { ok: false as const, error: describeBlock(decision, now) };

    const created = await tx.examAttempt.create({
      data: { userId, examId, startedAt: now },
      select: { id: true, startedAt: true },
    });
    return { ok: true as const, attemptId: created.id, startedAt: created.startedAt, resumed: false };
  });
}

export type GradeSittingResult =
  | { ok: true; grade: ExamGrade }
  | { ok: false; error: string };

/**
 * Grades a sitting and records it, exactly once. Under the learner's lock: the sitting must exist, belong to this
 * learner and exam, still be inside its window and be unsubmitted; the history is checked again; then the row is claimed
 * with a conditional update (one winner whatever happens) in the same transaction as the result.
 */
export async function gradeSitting(params: {
  userId: string;
  examId: string;
  attemptId: string;
  timeLimit: number | null;
  passingScore: number;
  questions: ExamQuestion[];
  answers: (number | null)[];
  now?: Date;
}): Promise<GradeSittingResult> {
  const { userId, examId, attemptId, timeLimit, passingScore, questions, answers } = params;
  const now = params.now ?? new Date();

  return db.$transaction(async (tx) => {
    await advisoryLock(tx, examLockKey(userId, examId));

    const attempt = await tx.examAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true, examId: true, startedAt: true, submittedAt: true },
    });
    if (!attempt || attempt.userId !== userId || attempt.examId !== examId) {
      return { ok: false as const, error: "Session d’examen invalide, recommencez" };
    }
    if (attempt.submittedAt) return { ok: false as const, error: "Cette session d’examen a déjà été envoyée" };

    const windowMs = examSittingWindowMs(timeLimit);
    if (now.getTime() - attempt.startedAt.getTime() > windowMs) {
      // Closed as a failed sitting dated at the end of its window; the next start opens a fresh one if allowed
      await tx.examAttempt.updateMany({
        where: { id: attemptId, submittedAt: null },
        data: { submittedAt: new Date(attempt.startedAt.getTime() + windowMs), passed: false },
      });
      return { ok: false as const, error: "Le temps imparti est écoulé" };
    }

    const decision = examSittingDecision(await loadSittingHistory(tx, userId, examId, now), now);
    if (!decision.allowed) return { ok: false as const, error: describeBlock(decision, now) };

    const grade = gradeExam(questions, answers, passingScore);
    const claimed = await tx.examAttempt.updateMany({
      where: { id: attemptId, userId, examId, submittedAt: null },
      data: { submittedAt: now, passed: grade.passed },
    });
    if (claimed.count !== 1) return { ok: false as const, error: "Cette session d’examen a déjà été envoyée" };

    const data = {
      score: grade.score,
      total: grade.total,
      percentage: grade.percentage,
      passed: grade.passed,
      answers: answers as unknown as object,
      completedAt: now,
    };
    await tx.examResult.upsert({
      where: { userId_examId: { userId, examId } },
      create: { userId, examId, ...data },
      update: data,
    });
    return { ok: true as const, grade };
  });
}

/** What the learner can still do after a failed sitting, to tell them (or null when passed or capped for good). */
export async function nextSittingInfo(
  userId: string,
  examId: string,
  now: Date,
): Promise<{ retryAt: string | null; sittingsLeftToday: number }> {
  const history = await loadSittingHistory(db, userId, examId, now);
  const decision = examSittingDecision(history, now);
  const left = Math.max(0, EXAM_MAX_SITTINGS_PER_DAY - history.recent.length);
  return {
    retryAt: !decision.allowed && decision.reason !== "PASSED" ? decision.retryAt.toISOString() : null,
    sittingsLeftToday: left,
  };
}
