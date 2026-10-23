import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import { CertificateService } from "@/lib/certificate-service";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { emailService } from "@/lib/email-service";
import { SITE_URL } from "@/app/_lib/constants";
import { syncPathCertificates } from "@/lib/paths/certificates";
import { loadLearnerCourseState } from "./course-state";
import { rewardCourseCompleted } from "./rewards";
import type { CourseProgress } from "./outline";

export interface IssuedCertificate {
  id: string;
  code: string;
  issuedAt: Date;
}

export interface CompletionOutcome {
  progress: CourseProgress;
  /** Every item done (the certificate may still be missing when access lapsed). */
  isComplete: boolean;
  certificate: IssuedCertificate | null;
  /** True only for the call that issued it: the one that should celebrate. */
  justIssued: boolean;
  courseXp: number | null;
}

/** Shape the progress summary API has always returned for one course. */
export function toBreakdown(progress: CourseProgress) {
  const pct = (done: number, total: number) => (total === 0 ? 100 : Math.floor((done / total) * 100));
  return {
    lessons: {
      completed: progress.lessons.done,
      total: progress.lessons.total,
      percentage: pct(progress.lessons.done, progress.lessons.total),
    },
    quizzes: {
      passed: progress.quizzes.done,
      total: progress.quizzes.total,
      percentage: pct(progress.quizzes.done, progress.quizzes.total),
    },
    exam: {
      passed: progress.exam.passed,
      required: progress.exam.required,
      percentage: progress.exam.required ? (progress.exam.passed ? 100 : 0) : 100,
    },
    overall: { percentage: progress.percent, isComplete: progress.isComplete },
  };
}

/**
 * What follows the first issue of a certificate: enrolment marked complete, course XP, a
 * notification, an email, the analytics event and the certificate of any learning path this course
 * completed. Each part is best effort and none can
 * undo the certificate.
 */
export async function afterCertificateIssued(
  userId: string,
  courseId: string,
  certificate: IssuedCertificate,
): Promise<{ courseXp: number | null }> {
  const [course, watched, lessonCount] = await Promise.all([
    db.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } }),
    db.progress.aggregate({ where: { userId, lesson: { courseId } }, _sum: { watchTime: true } }),
    db.lesson.count({ where: { courseId, published: true } }),
  ]);

  await db.enrollment
    .updateMany({ where: { userId, courseId, completedAt: null }, data: { completedAt: certificate.issuedAt } })
    .catch((e) => console.warn("[completion] enrolment not marked complete", e));

  let courseXp: number | null = null;
  try {
    courseXp = (await rewardCourseCompleted(userId, courseId))?.xp ?? null;
  } catch (e) {
    console.warn("[completion] course XP failed", e);
  }

  try {
    await db.notification.create({
      data: {
        recipientId: userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "Certificat obtenu",
        message: `Bravo, vous avez terminé « ${course?.title ?? "la formation"} ». Votre certificat est disponible.`,
        data: { kind: "certificate", courseId, certificateId: certificate.id, code: certificate.code },
      },
    });
  } catch (e) {
    console.warn("[completion] notification failed", e);
  }

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (user && course) {
      const template = emailService.certificateEarnedEmail(
        user.name || user.email,
        course.title,
        `${SITE_URL}/certificates/verify/${certificate.code}`,
      );
      await emailService.sendEmail({ to: user.email, subject: template.subject, html: template.html });
    }
  } catch (e) {
    console.warn("[completion] certificate email failed", e);
  }

  try {
    await AnalyticsHelper.recordCertificateIssuance(userId, {
      certificateId: certificate.id,
      courseId,
      courseTitle: course?.title,
      completionDate: certificate.issuedAt.toISOString(),
      totalLessons: lessonCount,
      totalWatchTime: watched._sum.watchTime ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("[completion] analytics failed", e);
  }

  // A path may have just been completed by this course
  try {
    await syncPathCertificates(userId);
  } catch (e) {
    console.warn("[completion] path certificates failed", e);
  }

  return { courseXp };
}

/**
 * Called after anything that can finish a course (lesson marked done, quiz graded, exam graded).
 * Idempotent: when everything is done and the learner is entitled it issues the certificate once
 * and reports `justIssued` to that call only.
 */
export async function completeCourseIfDone(userId: string, courseId: string): Promise<CompletionOutcome> {
  const { progress } = await loadLearnerCourseState(userId, courseId);

  const existing = await db.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, code: true, issuedAt: true },
  });
  if (existing) {
    return { progress, isComplete: progress.isComplete, certificate: existing, justIssued: false, courseXp: null };
  }
  if (!progress.isComplete) {
    return { progress, isComplete: false, certificate: null, justIssued: false, courseXp: null };
  }

  // Finished, but a certificate is only for a learner who is still entitled to the course
  const access = await AccessService.checkCourseAccess(userId, courseId);
  if (!access.canAccessCourse) {
    return { progress, isComplete: true, certificate: null, justIssued: false, courseXp: null };
  }

  const result = await CertificateService.issueCertificate({
    userId,
    courseId,
    completedLessons: progress.lessons.done,
    totalLessons: progress.lessons.total,
    completionPercentage: progress.percent,
  });
  if (!result.success || !result.certificate) {
    return { progress, isComplete: true, certificate: null, justIssued: false, courseXp: null };
  }
  if (result.alreadyIssued) {
    return { progress, isComplete: true, certificate: result.certificate, justIssued: false, courseXp: null };
  }

  const { courseXp } = await afterCertificateIssued(userId, courseId, result.certificate);
  return { progress, isComplete: true, certificate: result.certificate, justIssued: true, courseXp };
}
