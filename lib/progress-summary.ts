import { cache } from "react";
import { db } from "./db";
import { loadLearnerCourseState } from "./learning/course-state";
import { itemHref } from "./learning/outline";

export interface CourseProgressSummary {
  courseId: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  enrolledAt: Date;
  /** Last lesson activity, or the enrolment date when nothing was started. */
  lastActivityAt: Date;
  /** 0 to 100 over lessons, quizzes and the final exam (lib/learning/outline.ts). */
  percent: number;
  /** Items done and in total (lessons + quizzes + exam). */
  done: number;
  total: number;
  completedLessons: number;
  totalLessons: number;
  totalDurationSec: number;
  consumedDurationSec: number;
  /** A certificate record exists (not just "100 %"). */
  hasCertificate: boolean;
  isComplete: boolean;
  /** Where "continue" goes: the first item not done, the wrap-up once complete, the course page while it has no content. */
  continueHref: string;
}

/** Progress of every course the user is enrolled in, with the one rule used by all screens. */
export async function getUserCoursesProgress(userId: string): Promise<CourseProgressSummary[]> {
  const [enrollments, certificates, watched] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      select: {
        courseId: true,
        enrolledAt: true,
        course: {
          select: { title: true, slug: true, description: true, thumbnail: true, category: true, level: true },
        },
      },
    }),
    db.certificate.findMany({ where: { userId }, select: { courseId: true } }),
    db.progress.findMany({
      where: { userId },
      select: { watchTime: true, updatedAt: true, lesson: { select: { courseId: true } } },
    }),
  ]);

  const certified = new Set(certificates.map((c) => c.courseId));
  const watchedByCourse = new Map<string, number>();
  const activityByCourse = new Map<string, Date>();
  for (const p of watched) {
    const id = p.lesson.courseId;
    watchedByCourse.set(id, (watchedByCourse.get(id) ?? 0) + p.watchTime);
    const last = activityByCourse.get(id);
    if (!last || p.updatedAt > last) activityByCourse.set(id, p.updatedAt);
  }

  const states = await Promise.all(
    enrollments.map(async (e) => ({ e, state: await loadLearnerCourseState(userId, e.courseId) })),
  );

  const summaries: CourseProgressSummary[] = [];
  for (const { e, state } of states) {
    const { progress, outline } = state;
    const totalDurationSec = outline.items.reduce(
      (sum, item) => sum + (item.kind === "lesson" ? (item.duration ?? 0) : 0),
      0,
    );
    summaries.push({
      courseId: e.courseId,
      title: e.course.title,
      slug: e.course.slug,
      description: e.course.description,
      thumbnail: e.course.thumbnail,
      category: e.course.category,
      level: e.course.level,
      enrolledAt: e.enrolledAt,
      lastActivityAt: activityByCourse.get(e.courseId) ?? e.enrolledAt,
      percent: progress.percent,
      done: progress.done,
      total: progress.total,
      completedLessons: progress.lessons.done,
      totalLessons: progress.lessons.total,
      totalDurationSec,
      consumedDurationSec: watchedByCourse.get(e.courseId) ?? 0,
      hasCertificate: certified.has(e.courseId),
      isComplete: progress.isComplete,
      continueHref: progress.next
        ? itemHref(e.course.slug, progress.next)
        : progress.total === 0
          ? `/formations/${e.course.slug}`
          : `/learn/${e.course.slug}/completed`,
    });
  }
  // Most recently active first: the first card is where the learner left off
  return summaries.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
}

/** Same as getUserCoursesProgress, computed once per request however many dashboard blocks ask for it. */
export const getUserCoursesProgressOnce = cache(getUserCoursesProgress);
