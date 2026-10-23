import { db } from "@/lib/db";
import { AccessService } from "@/lib/access-service";
import type { CourseOutline, OutlineItem } from "./outline";

/**
 * How a visitor may use the learning area of one course.
 * - `full`: enrolled and entitled, everything is open and progress is recorded.
 * - `staff`: the author (or an admin) looking at their own course, published or not; read only, nothing is recorded.
 * - `preview`: not entitled, but the course is published and has free sample lessons (`Lesson.isPreview`,
 *   or its first lesson when the course allows previews and none is flagged).
 * - `none`: nothing to see, the course page explains why.
 */
export type LearnerMode = "full" | "staff" | "preview" | "none";

export interface LearnerAccessInput {
  userId: string;
  role?: string | null;
  course: {
    id: string;
    published: boolean;
    instructorId: string | null;
  };
}

export interface LearnerAccess {
  mode: LearnerMode;
  /** Why `none`: shown on the course page. */
  reason?: "not_enrolled" | "premium_locked" | "unpublished";
  isEnrolled: boolean;
  /** An active subscription: premium courses are open to it once enrolled. */
  hasActiveSubscription: boolean;
}

export async function resolveLearnerAccess(input: LearnerAccessInput): Promise<LearnerAccess> {
  const { userId, role, course } = input;
  const isStaff = role === "ADMIN" || (role === "INSTRUCTOR" && course.instructorId === userId);
  const access = await AccessService.checkCourseAccess(userId, course.id);

  if (isStaff && !access.canAccessCourse) {
    return { mode: "staff", isEnrolled: access.isEnrolledInCourse, hasActiveSubscription: access.hasActiveSubscription };
  }
  const base = { isEnrolled: access.isEnrolledInCourse, hasActiveSubscription: access.hasActiveSubscription };
  if (!course.published) return { mode: "none", reason: "unpublished", ...base };
  if (access.canAccessCourse) return { mode: "full", ...base, isEnrolled: true };

  const hasPreview = await courseHasPreview(course.id, access.canPreviewFirstLesson ?? false);
  if (hasPreview) return { mode: "preview", ...base };

  return {
    mode: "none",
    reason: access.isEnrolledInCourse ? "premium_locked" : "not_enrolled",
    ...base,
  };
}

async function courseHasPreview(courseId: string, firstLessonPreview: boolean): Promise<boolean> {
  if (firstLessonPreview) return true;
  const flagged = await db.lesson.count({ where: { courseId, published: true, isPreview: true } });
  return flagged > 0;
}

/**
 * Whether `item` can be opened in `mode`. Lessons follow the preview rule; quizzes and the exam
 * need full access (they record results), the staff may open anything.
 */
export function canOpenItem(
  mode: LearnerMode,
  item: OutlineItem,
  outline: CourseOutline,
  hasFlaggedPreview: boolean,
): boolean {
  if (mode === "full" || mode === "staff") return true;
  if (mode === "none") return false;
  if (item.kind !== "lesson") return false;
  if (item.isPreview) return true;
  // No lesson flagged: the course falls back to its first lesson as the free sample.
  if (hasFlaggedPreview) return false;
  const first = outline.items.find((i) => i.kind === "lesson");
  return first?.id === item.id;
}

export function outlineHasFlaggedPreview(outline: CourseOutline): boolean {
  return outline.items.some((i) => i.kind === "lesson" && i.isPreview);
}

/** The author of the course or an admin: they may look at everything, nothing they do is recorded. */
export async function isCourseStaff(userId: string, courseId: string): Promise<boolean> {
  const [user, course] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { role: true } }),
    db.course.findUnique({ where: { id: courseId }, select: { instructorId: true } }),
  ]);
  if (!user || !course) return false;
  return user.role === "ADMIN" || (user.role === "INSTRUCTOR" && course.instructorId === userId);
}
