/**
 * What an author needs to follow a course once learners are in it: statistics, the learners themselves, and the
 * accesses an administrator gives by hand. Progress is the learners' progress as they see it (lib/learning/outline:
 * one rule for every screen); access sources follow lib/access/entitlement. Callers check who may read the course.
 */
import { db } from "@/lib/db";
import { PaymentKind, PaymentStatus } from "@/lib/generated/prisma/browser";
import { decideEntitlement, type EntitlementSource, type LapsedReason } from "@/lib/access/entitlement";
import { loadCourseOutline } from "@/lib/learning/course-state";
import { computeProgress, isItemDone, PASSING_SCORE, type CourseOutline } from "@/lib/learning/outline";
import type { Result } from "./curriculum";

const DAY = 24 * 60 * 60 * 1000;
const fail = (error: string): { success: false; error: string } => ({ success: false, error });

interface LearnerProgressFacts {
  completedLessonIds: Set<string>;
  passedQuizIds: Set<string>;
  examPassed: boolean;
}

/** Done items of every learner of `userIds`, in three queries. */
async function progressFacts(courseId: string, userIds: readonly string[]): Promise<Map<string, LearnerProgressFacts>> {
  const ids = [...userIds];
  const facts = new Map<string, LearnerProgressFacts>(
    ids.map((id) => [id, { completedLessonIds: new Set(), passedQuizIds: new Set(), examPassed: false }]),
  );
  if (ids.length === 0) return facts;
  const [lessons, quizzes, exams] = await Promise.all([
    db.progress.findMany({
      where: { userId: { in: ids }, completed: true, lesson: { courseId } },
      select: { userId: true, lessonId: true },
    }),
    db.quizResult.findMany({
      where: { userId: { in: ids }, quiz: { courseId }, percentage: { gte: PASSING_SCORE } },
      select: { userId: true, quizId: true },
    }),
    db.examResult.findMany({
      where: { userId: { in: ids }, passed: true, exam: { courseId } },
      select: { userId: true },
    }),
  ]);
  for (const row of lessons) facts.get(row.userId)?.completedLessonIds.add(row.lessonId);
  for (const row of quizzes) facts.get(row.userId)?.passedQuizIds.add(row.quizId);
  for (const row of exams) {
    const f = facts.get(row.userId);
    if (f) f.examPassed = true;
  }
  return facts;
}

/** Last time each learner did something in the course (a lesson watched or completed, a quiz or the exam started). */
async function lastActivity(courseId: string, userIds: readonly string[]): Promise<Map<string, Date>> {
  const ids = [...userIds];
  const latest = new Map<string, Date>();
  if (ids.length === 0) return latest;
  const [progress, attempts, exams] = await Promise.all([
    db.progress.groupBy({
      by: ["userId"],
      where: { userId: { in: ids }, lesson: { courseId } },
      _max: { updatedAt: true },
    }),
    db.quizAttempt.groupBy({
      by: ["userId"],
      where: { userId: { in: ids }, quiz: { courseId } },
      _max: { startedAt: true },
    }),
    db.examResult.groupBy({
      by: ["userId"],
      where: { userId: { in: ids }, exam: { courseId } },
      _max: { completedAt: true },
    }),
  ]);
  const keep = (userId: string, date: Date | null | undefined) => {
    if (!date) return;
    const current = latest.get(userId);
    if (!current || date > current) latest.set(userId, date);
  };
  for (const row of progress) keep(row.userId, row._max.updatedAt);
  for (const row of attempts) keep(row.userId, row._max.startedAt);
  for (const row of exams) keep(row.userId, row._max.completedAt);
  return latest;
}

// ---------------------------------------------------------------- statistics

export interface StepStatistic {
  id: string;
  kind: "lesson" | "quiz" | "exam";
  title: string;
  /** Title of the module, `null` for a lesson without module and for the exam. */
  moduleTitle: string | null;
  /** Enrolled learners who completed (lesson) or passed (quiz, exam) the step. */
  done: number;
  /** Share of the enrolled learners, 0 to 100. */
  rate: number;
}

export interface CourseStatistics {
  enrollments: number;
  activeLast7Days: number;
  activeLast30Days: number;
  /** Learners who completed every step. */
  completed: number;
  /** Share of the enrolled learners who completed the course, 0 to 100. */
  completionRate: number;
  /** Average progress of the enrolled learners, 0 to 100. */
  averageProgress: number;
  /** Average of the learners' best score per quiz, `null` without any attempt. */
  averageQuizScore: number | null;
  /** Average of the learners' best exam score, `null` without any attempt. */
  averageExamScore: number | null;
  certificates: number;
  /** Steps in course order, for the drop-off curve. */
  steps: StepStatistic[];
}

const percent = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

function moduleTitles(outline: CourseOutline): Map<string, string> {
  const titles = new Map<string, string>();
  for (const section of outline.sections) if (section.module) titles.set(section.module.id, section.module.title);
  return titles;
}

export async function getCourseStatistics(courseId: string, now = new Date()): Promise<CourseStatistics> {
  const [outline, enrollments, quizScores, examScores, certificates] = await Promise.all([
    loadCourseOutline(courseId),
    db.enrollment.findMany({ where: { courseId }, select: { userId: true } }),
    db.quizResult.groupBy({ by: ["userId", "quizId"], where: { quiz: { courseId } }, _max: { percentage: true } }),
    db.examResult.groupBy({ by: ["userId"], where: { exam: { courseId } }, _max: { percentage: true } }),
    db.certificate.count({ where: { courseId } }),
  ]);

  const userIds = enrollments.map((e) => e.userId);
  const [facts, activity] = await Promise.all([progressFacts(courseId, userIds), lastActivity(courseId, userIds)]);

  let completed = 0;
  let progressSum = 0;
  for (const f of facts.values()) {
    const p = computeProgress(outline, f);
    if (p.isComplete) completed++;
    progressSum += p.percent;
  }

  const since7 = now.getTime() - 7 * DAY;
  const since30 = now.getTime() - 30 * DAY;
  const activities = [...activity.values()].map((d) => d.getTime());

  const titles = moduleTitles(outline);
  const steps: StepStatistic[] = outline.items.map((item) => {
    let done = 0;
    for (const f of facts.values()) if (isItemDone(item, f)) done++;
    return {
      id: item.id,
      kind: item.kind,
      title: item.title,
      moduleTitle: item.kind === "exam" ? null : item.moduleId ? (titles.get(item.moduleId) ?? null) : null,
      done,
      rate: percent(done, userIds.length),
    };
  });

  const average = (values: (number | null)[]) => {
    const list = values.filter((v): v is number => v !== null);
    return list.length === 0 ? null : Math.round(list.reduce((a, b) => a + b, 0) / list.length);
  };

  return {
    enrollments: userIds.length,
    activeLast7Days: activities.filter((t) => t >= since7).length,
    activeLast30Days: activities.filter((t) => t >= since30).length,
    completed,
    completionRate: percent(completed, userIds.length),
    averageProgress: userIds.length === 0 ? 0 : Math.round(progressSum / userIds.length),
    averageQuizScore: average(quizScores.map((r) => r._max.percentage)),
    averageExamScore: average(examScores.map((r) => r._max.percentage)),
    certificates,
    steps,
  };
}

// ---------------------------------------------------------------- learners

export type AccessSource = Exclude<EntitlementSource, "staff">;

export interface LearnerRow {
  userId: string;
  name: string;
  email: string;
  enrolledAt: Date;
  /** 0 to 100, the learner's own progress. */
  progress: number;
  completed: boolean;
  lastActivityAt: Date | null;
  /** What opens the course to them, `null` when nothing does any more (see `lapsed`). */
  source: AccessSource | null;
  lapsed: LapsedReason | null;
  /** The access was given by an administrator: it can be withdrawn. */
  granted: boolean;
  grantedByName: string | null;
  certificateCode: string | null;
}

export interface LearnerPage {
  rows: LearnerRow[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}

export const LEARNERS_PAGE_SIZE = 20;

export async function listCourseLearners(
  courseId: string,
  query: { search?: string; page?: number } = {},
): Promise<LearnerPage> {
  const search = query.search?.trim();
  const where = {
    courseId,
    ...(search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };
  const [course, total] = await Promise.all([
    db.course.findUnique({ where: { id: courseId }, select: { accessTier: true } }),
    db.enrollment.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / LEARNERS_PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(query.page ?? 1)), pages);
  if (!course || total === 0) return { rows: [], total, page, pages, pageSize: LEARNERS_PAGE_SIZE };

  const enrollments = await db.enrollment.findMany({
    where,
    orderBy: { enrolledAt: "desc" },
    skip: (page - 1) * LEARNERS_PAGE_SIZE,
    take: LEARNERS_PAGE_SIZE,
    select: {
      userId: true,
      enrolledAt: true,
      grantedAt: true,
      grantedBy: { select: { name: true, email: true } },
      user: { select: { name: true, email: true, subscriptions: { select: { status: true, cancelAtPeriodEnd: true, currentPeriodEnd: true } } } },
    },
  });
  const userIds = enrollments.map((e) => e.userId);

  const [outline, payments, certificates] = await Promise.all([
    loadCourseOutline(courseId),
    db.payment.findMany({
      where: {
        courseId,
        userId: { in: userIds },
        kind: PaymentKind.COURSE,
        status: { in: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED] },
      },
      select: { userId: true, status: true },
    }),
    db.certificate.findMany({ where: { courseId, userId: { in: userIds } }, select: { userId: true, code: true } }),
  ]);
  const [facts, activity] = await Promise.all([progressFacts(courseId, userIds), lastActivity(courseId, userIds)]);

  const purchased = new Set(payments.filter((p) => p.status === PaymentStatus.COMPLETED).map((p) => p.userId));
  const refunded = new Set(payments.filter((p) => p.status === PaymentStatus.REFUNDED).map((p) => p.userId));
  const certificateOf = new Map(certificates.map((c) => [c.userId, c.code]));

  const rows: LearnerRow[] = enrollments.map((e) => {
    const decision = decideEntitlement({
      tier: course.accessTier,
      enrolled: true,
      granted: e.grantedAt !== null,
      purchased: purchased.has(e.userId),
      refunded: refunded.has(e.userId) && !purchased.has(e.userId),
      subscription: e.user.subscriptions ?? null,
      isStaff: false,
    });
    const progress = computeProgress(outline, facts.get(e.userId)!);
    return {
      userId: e.userId,
      name: e.user.name || e.user.email,
      email: e.user.email,
      enrolledAt: e.enrolledAt,
      progress: progress.percent,
      completed: progress.isComplete,
      lastActivityAt: activity.get(e.userId) ?? null,
      source: decision.source === "staff" ? null : decision.source,
      lapsed: decision.lapsed,
      granted: e.grantedAt !== null,
      grantedByName: e.grantedBy ? e.grantedBy.name || e.grantedBy.email : null,
      certificateCode: certificateOf.get(e.userId) ?? null,
    };
  });

  return { rows, total, page, pages, pageSize: LEARNERS_PAGE_SIZE };
}

// ---------------------------------------------------------------- granted access

/**
 * Gives a person access to the course without purchase or subscription. The person must have an account.
 * An existing enrolment keeps its date and progress and gains the grant; otherwise an enrolment is created,
 * dated like the grant (that is how `revokeCourseAccess` knows the grant created it).
 */
export async function grantCourseAccess(
  courseId: string,
  email: string,
  grantedById: string,
): Promise<Result<{ userId: string; name: string; created: boolean }>> {
  const address = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return fail("Saisissez une adresse e-mail valide.");
  const user = await db.user.findFirst({
    where: { email: { equals: address, mode: "insensitive" } },
    select: { id: true, name: true, email: true },
  });
  if (!user) return fail("Aucun compte n'utilise cette adresse. La personne doit d'abord créer son compte.");

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { grantedAt: true },
  });
  if (existing?.grantedAt) return fail("Cette personne a déjà un accès offert à la formation.");

  const now = new Date();
  if (existing) {
    await db.enrollment.update({
      where: { userId_courseId: { userId: user.id, courseId } },
      data: { grantedById, grantedAt: now },
    });
  } else {
    await db.enrollment.create({ data: { userId: user.id, courseId, enrolledAt: now, grantedById, grantedAt: now } });
  }
  return { success: true, userId: user.id, name: user.name || user.email, created: !existing };
}

/**
 * Withdraws an access given by hand. When the grant created the enrolment and the learner has not started, the
 * enrolment goes too (nothing is lost); otherwise it stays with its progress, and the course is open again only
 * through the usual ways (free course, purchase, subscription).
 */
export async function revokeCourseAccess(
  courseId: string,
  userId: string,
): Promise<Result<{ removedEnrollment: boolean }>> {
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { enrolledAt: true, grantedAt: true },
  });
  if (!enrollment?.grantedAt) return fail("Cette personne n'a pas d'accès offert à retirer.");

  const createdByGrant = enrollment.enrolledAt.getTime() === enrollment.grantedAt.getTime();
  const started =
    createdByGrant &&
    ((await db.progress.count({ where: { userId, lesson: { courseId } } })) > 0 ||
      (await db.quizAttempt.count({ where: { userId, quiz: { courseId } } })) > 0 ||
      (await db.examResult.count({ where: { userId, exam: { courseId } } })) > 0);

  if (createdByGrant && !started) {
    await db.enrollment.delete({ where: { userId_courseId: { userId, courseId } } });
    return { success: true, removedEnrollment: true };
  }
  await db.enrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: { grantedById: null, grantedAt: null },
  });
  return { success: true, removedEnrollment: false };
}

/** Learners enrolled and not done yet: changing what the certificate requires concerns them. */
export async function learnersInProgress(courseId: string): Promise<number> {
  return db.enrollment.count({ where: { courseId, completedAt: null } });
}
