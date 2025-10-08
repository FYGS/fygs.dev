"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Analytics } from "@/lib/analytics";
import { AccessService } from "@/lib/access-service";
import { emailService } from "@/lib/email-service";
import { SITE_URL } from "@/app/_lib/constants";

interface MarkProgressInput {
  lessonId: string;
  completed?: boolean;
  watchTimeIncrement?: number; // seconds to add (clamped)
}

export async function markLessonProgress(input: MarkProgressInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, error: 'UNAUTHENTICATED' } as const;
  }

  const { lessonId, completed = false } = input;
  if (!lessonId) return { ok: false, error: 'MISSING_LESSON_ID' } as const;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true, published: true, order: true, course: { select: { accessTier: true, previewEnabled: true } } }
  });
  if (!lesson || !lesson.published) return { ok: false, error: 'LESSON_NOT_FOUND' } as const;

  const access = await AccessService.checkCourseAccess(userId, lesson.courseId);
  if (!access.canAccessLessons) {
    // allow preview first lesson if preview mode implicit
    if (!access.canPreviewFirstLesson) return { ok: false, error: 'NO_ACCESS' } as const;
    // Validate it is first lesson
    const first = await db.lesson.findFirst({ where: { courseId: lesson.courseId, published: true }, orderBy: { order: 'asc' }, select: { id: true } });
    if (first?.id !== lesson.id) return { ok: false, error: 'NO_ACCESS' } as const;
  }

  const now = new Date();
  const watchTimeIncrement = Math.min(Math.max(input.watchTimeIncrement || 0, 0), 60 * 30); // clamp to 30min per call

  const progress = await db.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      completed: completed || false,
      completedAt: completed ? now : null,
      watchTime: watchTimeIncrement,
    },
    update: {
      watchTime: { increment: watchTimeIncrement },
      ...(completed ? { completed: true, completedAt: now } : {}),
    },
    select: { id: true, completed: true, watchTime: true, completedAt: true }
  });

  if (completed) {
    Analytics.lessonCompleted(userId, { lessonId, courseId: lesson.courseId });
    // After marking completion, check if course now fully completed and issue certificate if not existing
    try {
      const [publishedLessons, userProgresses, existingCert] = await Promise.all([
        db.lesson.findMany({ where: { courseId: lesson.courseId, published: true }, select: { id: true } }),
        db.progress.findMany({ where: { userId, lesson: { courseId: lesson.courseId } }, select: { lessonId: true, completed: true } }),
        db.certificate.findUnique({ where: { userId_courseId: { userId, courseId: lesson.courseId } } }).catch(()=>null) as any,
      ]);
      const total = publishedLessons.length;
      if (total > 0) {
        const completedCount = new Set(userProgresses.filter(p=>p.completed).map(p=>p.lessonId)).size;
        if (completedCount === total && !existingCert) {
          await db.certificate.create({ data: { userId, courseId: lesson.courseId } });
          Analytics.certificateIssued(userId, { courseId: lesson.courseId });
          try {
            const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
            const courseInfo = await db.course.findUnique({ where: { id: lesson.courseId }, select: { id: true, title: true, slug: true } });
            if (user && courseInfo) {
              const tpl = emailService.certificateEarnedEmail(user.name || user.email, courseInfo.title, `${SITE_URL}/certificates/${courseInfo.id}`);
              await emailService.sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
            }
          } catch (e) {
            console.warn('[certificate email] failed', e);
          }
        }
      }
    } catch (e) {
      console.warn('[progress] certificate issuance check failed', e);
    }
  }

  return { ok: true, progress } as const;
}

export async function getCourseProgressSummary(userId: string, courseId: string) {
  const lessons = await db.lesson.findMany({ where: { courseId, published: true }, select: { id: true, duration: true } });
  const progresses = await db.progress.findMany({ where: { userId, lesson: { courseId } }, select: { lessonId: true, completed: true, watchTime: true } });
  const completedSet = new Set(progresses.filter(p => p.completed).map(p => p.lessonId));
  const totalLessons = lessons.length;
  const completedLessons = completedSet.size;
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const totalDurationSec = lessons.reduce((acc,l)=> acc + (l.duration || 0), 0);
  const consumedDurationSec = progresses.reduce((acc,p)=> acc + p.watchTime, 0);
  return { totalLessons, completedLessons, percent, totalDurationSec, consumedDurationSec };
}
