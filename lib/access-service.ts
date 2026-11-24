import { CourseAccessTier } from "@/lib/generated/prisma/browser";
import { db } from "./db";
import {
  coursesWithPreview,
  getEntitlement,
  getEntitlements,
  hasActiveSubscription as hasActiveSubscriptionRule,
  previewLessonIds,
  type CourseEntitlement,
} from "./access/entitlement";
import { loadCourseOutline } from "./learning/course-state";

/**
 * Course access as the server actions ask for it. Every answer comes from `lib/access/entitlement.ts`, the one
 * rule of the platform; this class only shapes it for its callers.
 */
export interface UserAccess {
  /** An ACTIVE or TRIALING subscription. */
  hasActiveSubscription: boolean;
  isEnrolledInCourse: boolean;
  /** Enrolled and entitled (free course, lifetime purchase, subscription or access granted), or staff. */
  canAccessCourse: boolean;
  /** Same as `canAccessCourse`. */
  canAccessLessons: boolean;
  /** Entitled by a real right (not only as staff): progress, results and certificates are recorded. */
  recordsProgress: boolean;
  subscriptionStatus?: string;
  subscriptionCancelAtPeriodEnd?: boolean;
  /** Not entitled, but the published course offers free sample lessons (see `previewLessonIds`). */
  canPreviewFirstLesson?: boolean;
  isFreeCourse?: boolean;
  isPremiumCourse?: boolean;
  accessReason?: "ok" | "not_enrolled" | "preview_only" | "premium_locked";
  entitlement: CourseEntitlement | null;
}

export class AccessService {
  /** Access of a signed-in user to a course. */
  static async checkCourseAccess(userId: string, courseId: string): Promise<UserAccess> {
    const all = await getEntitlements(userId, [courseId]);
    const entitlement = all.courses.get(courseId) ?? null;
    const { subscription, hasActiveSubscription } = all;

    if (!entitlement) {
      return {
        hasActiveSubscription,
        isEnrolledInCourse: false,
        canAccessCourse: false,
        canAccessLessons: false,
        recordsProgress: false,
        subscriptionStatus: subscription?.status,
        subscriptionCancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
        canPreviewFirstLesson: false,
        isFreeCourse: false,
        isPremiumCourse: false,
        accessReason: "not_enrolled",
        entitlement: null,
      };
    }

    // FR-041: withdrawing a course from the catalogue does not take it away from the people who hold it. An entitled
    // learner keeps every lesson, their progress and their certificate; what an unpublished course loses is its
    // visibility, new enrolments and the free sample (see `coursesWithPreview`, which only counts published courses).
    const canAccessCourse = entitlement.entitled;
    const canPreviewFirstLesson = !canAccessCourse && (await coursesWithPreview([courseId])).has(courseId);
    const accessReason: UserAccess["accessReason"] = canAccessCourse
      ? "ok"
      : canPreviewFirstLesson
        ? "preview_only"
        : entitlement.enrolled
          ? "premium_locked"
          : "not_enrolled";

    return {
      hasActiveSubscription,
      isEnrolledInCourse: entitlement.enrolled,
      canAccessCourse,
      canAccessLessons: canAccessCourse,
      recordsProgress: canAccessCourse && entitlement.source !== "staff",
      subscriptionStatus: subscription?.status,
      subscriptionCancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
      canPreviewFirstLesson,
      isFreeCourse: entitlement.tier === CourseAccessTier.FREE,
      isPremiumCourse: entitlement.tier === CourseAccessTier.PREMIUM,
      accessReason,
      entitlement,
    };
  }

  /** An ACTIVE or TRIALING subscription (a cancellation scheduled for the end of the period keeps it active). */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    return hasActiveSubscriptionRule(userId);
  }

  /**
   * Whether the user may OPEN a lesson: entitled learners and staff open every lesson; others open the free sample
   * lessons of a published course (`previewLessonIds`).
   */
  static async canAccessLesson(userId: string, lessonId: string): Promise<boolean> {
    const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true, published: true } });
    if (!lesson) return false;
    const entitlement = await getEntitlement(userId, lesson.courseId);
    if (!entitlement) return false;
    if (entitlement.entitled) return true;
    if (!lesson.published || !entitlement.published) return false;
    return (await AccessService.previewLessonsOf(lesson.courseId, entitlement)).has(lessonId);
  }

  /**
   * Whether the user's work on a lesson is RECORDED (progress, watch position): a real entitlement is needed.
   * Free samples and the staff's look at a course record nothing.
   */
  static async canRecordLessonProgress(userId: string, lessonId: string): Promise<boolean> {
    const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true, published: true } });
    if (!lesson?.published) return false;
    const entitlement = await getEntitlement(userId, lesson.courseId);
    return !!entitlement?.entitled && entitlement.source !== "staff";
  }

  private static async previewLessonsOf(
    courseId: string,
    course: { published: boolean; previewEnabled: boolean },
  ): Promise<Set<string>> {
    const outline = await loadCourseOutline(courseId);
    const lessons = outline.items.flatMap((item) =>
      item.kind === "lesson" ? [{ id: item.id, isPreview: item.isPreview }] : [],
    );
    return previewLessonIds(course, lessons);
  }
}
