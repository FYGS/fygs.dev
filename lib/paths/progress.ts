import { db } from "@/lib/db";
import { getEntitlements } from "@/lib/access/entitlement";
import { loadLearnerCourseState } from "@/lib/learning/course-state";
import { itemHref } from "@/lib/learning/outline";
import type { PathCourseView, PathDetail } from "./queries";
import {
  computePathProgress,
  pathCourseStatus,
  type PathCourseStatus,
  type PathProgress,
} from "./rules";

/**
 * Which of these courses may the user take (the question "may I be enrolled", not "am I")? The one rule of
 * `lib/access/entitlement.ts`: a free course, a lifetime purchase, an active subscription or an access granted.
 */
export async function courseEntitlements(
  userId: string,
  courses: { courseId: string; accessTier?: string }[],
): Promise<Map<string, boolean>> {
  const all = await getEntitlements(userId, courses.map((c) => c.courseId));
  return new Map(courses.map((c) => [c.courseId, all.courses.get(c.courseId)?.eligible ?? false]));
}

export interface PathCourseProgressView extends PathCourseView {
  status: PathCourseStatus;
  percent: number;
  isComplete: boolean;
  enrolled: boolean;
  entitled: boolean;
  /** Where the button of this course goes: the next item when started, the course page otherwise */
  href: string;
}

export interface UserPathProgress {
  enrolled: boolean;
  progress: PathProgress;
  courses: PathCourseProgressView[];
  next: PathCourseProgressView | null;
  certificate: { code: string; issuedAt: Date } | null;
}

/** The state of one path for one learner. */
export async function loadUserPath(userId: string, path: PathDetail): Promise<UserPathProgress> {
  const available = path.courses.filter((c) => c.available);
  const [pathEnrollment, certificate, enrollments, entitlements, states] = await Promise.all([
    db.pathEnrollment.findUnique({
      where: { userId_pathId: { userId, pathId: path.id } },
      select: { id: true },
    }),
    db.pathCertificate.findUnique({
      where: { userId_pathId: { userId, pathId: path.id } },
      select: { code: true, issuedAt: true },
    }),
    db.enrollment.findMany({
      where: { userId, courseId: { in: available.map((c) => c.courseId) } },
      select: { courseId: true },
    }),
    courseEntitlements(userId, available),
    Promise.all(available.map((c) => loadLearnerCourseState(userId, c.courseId))),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const stateByCourse = new Map(available.map((c, i) => [c.courseId, states[i]]));

  const courses: PathCourseProgressView[] = path.courses.map((c) => {
    const state = stateByCourse.get(c.courseId);
    const percent = state?.progress.percent ?? 0;
    const isComplete = state?.progress.isComplete ?? false;
    const enrolled = enrolledIds.has(c.courseId);
    const entitled = entitlements.get(c.courseId) ?? false;
    const next = state?.progress.next;
    const href =
      enrolled && entitled && next && !isComplete
        ? itemHref(c.slug, next)
        : `/formations/${c.slug}`;
    return {
      ...c,
      status: pathCourseStatus({ available: c.available, entitled, enrolled, percent, isComplete }),
      percent,
      isComplete,
      enrolled,
      entitled,
      href,
    };
  });

  const progress = computePathProgress(
    courses.map((c) => ({
      courseId: c.courseId,
      optional: c.optional,
      available: c.available,
      percent: c.percent,
      isComplete: c.isComplete,
    })),
  );

  return {
    enrolled: pathEnrollment !== null,
    progress,
    courses,
    next: courses.find((c) => c.courseId === progress.nextCourseId) ?? null,
    certificate,
  };
}
