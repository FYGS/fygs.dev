'use server';

import { revalidateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { AccessService } from '@/lib/access-service';
import { toggleLessonProgressSchema, submitReviewSchema } from '@/lib/validators/course';
import { COURSE_TAG_FEATURED, COURSE_TAG_LIST, COURSE_TAG_RECOMMENDATIONS } from '@/lib/repositories/course-repository';

// Helpers
async function getUserOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('UNAUTHORIZED');
  return session.user;
}

function revalidateCourseRelated(slug?: string) {
  revalidateTag(COURSE_TAG_FEATURED, { expire: 0 });
  revalidateTag(COURSE_TAG_LIST, { expire: 0 });
  revalidateTag(COURSE_TAG_RECOMMENDATIONS, { expire: 0 });
  if (slug) revalidateTag(`course:${slug}`, { expire: 0 });
}

// Toggle lesson progress
export async function toggleLessonProgress(formData: FormData) {
  const user = await getUserOrThrow();
  const parsed = toggleLessonProgressSchema.safeParse({
    lessonId: formData.get('lessonId'),
    completed: formData.get('completed') === 'true' ? true : formData.get('completed') === 'false' ? false : undefined,
    watchTime: formData.get('watchTime') ? Number(formData.get('watchTime')) : undefined,
  });
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' };

  const { lessonId, completed, watchTime } = parsed.data;
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true, course: { select: { slug: true, id: true } } } });
  if (!lesson) return { ok: false, error: 'LESSON_NOT_FOUND' };

  // Access check
  const canAccess = await AccessService.canAccessLesson(user.id, lessonId);
  if (!canAccess) return { ok: false, error: 'FORBIDDEN' };

  const existing = await db.progress.findUnique({ where: { userId_lessonId: { userId: user.id, lessonId } } });
  let nextCompleted = completed;
  if (nextCompleted === undefined) {
    nextCompleted = existing ? !existing.completed : true;
  }
  const data = {
    completed: nextCompleted,
    completedAt: nextCompleted ? new Date() : null,
    watchTime: typeof watchTime === 'number' ? watchTime : existing?.watchTime || 0,
  };
  if (existing) {
    await db.progress.update({ where: { userId_lessonId: { userId: user.id, lessonId } }, data });
  } else {
    await db.progress.create({ data: { userId: user.id, lessonId, ...data } });
  }
  revalidateCourseRelated(lesson.course.slug);
  return { ok: true, completed: nextCompleted };
}

// Submit review
export async function submitCourseReview(formData: FormData) {
  const user = await getUserOrThrow();
  const parsed = submitReviewSchema.safeParse({
    courseId: formData.get('courseId'),
    rating: formData.get('rating') ? Number(formData.get('rating')) : undefined,
    comment: formData.get('comment')?.toString(),
  });
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' };
  const { courseId, rating, comment } = parsed.data;

  const access = await AccessService.checkCourseAccess(user.id, courseId);
  if (!access.canAccessCourse) return { ok: false, error: 'FORBIDDEN' };

  const existing = await db.review.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } });
  if (existing) {
    await db.review.update({ where: { userId_courseId: { userId: user.id, courseId } }, data: { rating, comment, updatedAt: new Date() } });
  } else {
    await db.review.create({ data: { userId: user.id, courseId, rating, comment } });
  }
  const course = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  if (course?.slug) revalidateCourseRelated(course.slug);
  return { ok: true };
}
