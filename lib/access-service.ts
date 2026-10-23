import { CourseAccessTier, PaymentKind, PaymentStatus, SubscriptionStatus } from "@/lib/generated/prisma/browser";
import { db } from "./db";
import { loadCourseOutline } from "./learning/course-state";

export interface UserAccess {
  hasActiveSubscription: boolean; // Premium subscription (ACTIVE)
  isEnrolledInCourse: boolean; // Explicit enrollment always required for dashboard/progress
  canAccessCourse: boolean; // Enrolled AND entitled (free tier, lifetime purchase or active subscription), FR-003
  canAccessLessons: boolean; // Alias (kept for compatibility)
  subscriptionStatus?: string;
  subscriptionCancelAtPeriodEnd?: boolean;
  enrollmentDate?: Date;
  canPreviewFirstLesson?: boolean; // Can watch first lesson as preview (only first lesson, not enrolled, premium course)
  isFreeCourse?: boolean; // Course is free tier (still requires enrollment for tracking)
  isPremiumCourse?: boolean; // Course requires premium (subscription entitlement + enrollment)
  accessReason?: "ok" | "not_enrolled" | "preview_only" | "premium_locked";
}

export interface CourseAccessContext {
  enrollment?: {
    id: string;
    enrolledAt: Date;
  } | null;
  course: {
    id: string;
    accessTier: string;
    previewEnabled?: boolean;
  };
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  } | null;
  payments?: Array<{
    id: string;
    kind: string;
    status: string;
    courseId?: string | null;
  }>;
}

export interface CourseAccessResult {
  allowed: boolean;
  reason:
    | "NOT_ENROLLED"
    | "FREE_COURSE"
    | "LIFETIME_PURCHASE"
    | "ACTIVE_SUBSCRIPTION"
    | "PREMIUM_LOCKED";
  source: "enrollment" | "subscription" | "payment" | "course_tier";
}

export class AccessService {
  /**
   * Pure function to evaluate course access based on context
   * Returns explicit access decision with reasoning
   */
  static evaluateCourseAccess(
    context: CourseAccessContext
  ): CourseAccessResult {
    const { enrollment, course, subscription, payments = [] } = context;

    // Must be enrolled for any access (enrollment-gated system)
    if (!enrollment) {
      return { allowed: false, reason: "NOT_ENROLLED", source: "enrollment" };
    }

    // Free courses allow access once enrolled
    if (course.accessTier === CourseAccessTier.FREE) {
      return { allowed: true, reason: "FREE_COURSE", source: "course_tier" };
    }

    // Check for lifetime course purchase
    const hasLifetimePurchase = payments.some(
      (payment) =>
        payment.kind === PaymentKind.COURSE &&
        payment.status === PaymentStatus.COMPLETED &&
        payment.courseId === course.id
    );
    if (hasLifetimePurchase) {
      return { allowed: true, reason: "LIFETIME_PURCHASE", source: "payment" };
    }

    // Check for active subscription (access continues until period end even if cancellation is scheduled)
    if (subscription?.status === SubscriptionStatus.ACTIVE) {
      return {
        allowed: true,
        reason: "ACTIVE_SUBSCRIPTION",
        source: "subscription",
      };
    } // Premium course without valid entitlement
    return { allowed: false, reason: "PREMIUM_LOCKED", source: "enrollment" };
  }
  /**
   * Fetch course access context for evaluation
   */
  static async getCourseAccessContext(
    userId: string,
    courseId: string
  ): Promise<CourseAccessContext> {
    const [subscription, enrollment, course, payments] = await Promise.all([
      db.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE },
        select: {
          id: true,
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      }),
      db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true, enrolledAt: true },
      }),
      db.course.findUnique({
        where: { id: courseId },
        select: { id: true, accessTier: true, previewEnabled: true },
      }),
      db.payment.findMany({
        where: {
          userId,
          OR: [
            { courseId },
            { kind: PaymentKind.SUBSCRIPTION }, // subscription payments
          ],
        },
        select: {
          id: true,
          kind: true,
          status: true,
          courseId: true,
        },
      }),
    ]);

    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    return {
      enrollment,
      course,
      subscription,
      payments,
    };
  }

  /**
   * Resolve coarse-grained access state for a course combining subscription, purchase, and enrollment
   * Used for card rendering & CTA decisions (LOCKED | OWNED | ENROLLED | FREE)
   */
  static resolveAccessState(
    access: UserAccess
  ): "LOCKED" | "ENROLLED" | "FREE" {
    // FREE still shows badge but requires enrollment for progress/dashboard listing.
    if (access.isFreeCourse && !access.isEnrolledInCourse) return "FREE";
    if (access.isEnrolledInCourse) return "ENROLLED";
    return "LOCKED";
  }
  /**
   * Check comprehensive user access for a specific course
   */
  static async checkCourseAccess(
    userId: string,
    courseId: string
  ): Promise<UserAccess> {
    const [subscription, enrollment, course, purchase] = await Promise.all([
      db.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE },
        select: {
          id: true,
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      }),
      db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true, enrolledAt: true },
      }),
      db.course.findUnique({
        where: { id: courseId },
        select: { id: true, accessTier: true, previewEnabled: true, published: true },
      }),
      db.payment.findFirst({
        where: {
          userId,
          courseId,
          kind: PaymentKind.COURSE,
          status: PaymentStatus.COMPLETED,
        },
        select: { id: true, kind: true, status: true, courseId: true },
      }),
    ]);

    if (!course) {
      return {
        hasActiveSubscription: !!subscription,
        isEnrolledInCourse: !!enrollment,
        canAccessCourse: false,
        canAccessLessons: false,
        subscriptionStatus: subscription?.status,
        subscriptionCancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
        enrollmentDate: enrollment?.enrolledAt,
        canPreviewFirstLesson: false,
        isFreeCourse: false,
        isPremiumCourse: false,
      };
    }

    // Simplified binary tier: FREE vs PREMIUM. We require ENROLLMENT for all access (even free) to appear in user space / progress.
    const isFreeCourse = course.accessTier === CourseAccessTier.FREE;
    const hasActiveSubscription = !!subscription; // ACTIVE premium subscription
    const isEnrolledInCourse = !!enrollment; // Represents explicit enrollment (free, subscription add, or one-time purchase)
    // Enrollment alone is not enough on a premium course: the entitlement must still be valid
    // (lifetime purchase or active subscription), so a cancelled subscriber loses access (FR-005).
    const canAccessCourse = AccessService.evaluateCourseAccess({
      enrollment,
      course,
      subscription,
      payments: purchase ? [purchase] : [],
    }).allowed;
    const canAccessLessons = canAccessCourse;
    // Preview allowed only for premium locked courses (not free) when previewEnabled flag set,
    // and never for a course that is not published (a draft is not public)
    const canPreviewFirstLesson =
      !canAccessCourse &&
      !isFreeCourse &&
      !!course.previewEnabled &&
      !!course.published;
    const accessReason: UserAccess["accessReason"] = canAccessCourse
      ? "ok"
      : canPreviewFirstLesson
      ? "preview_only"
      : isEnrolledInCourse
      ? "premium_locked"
      : "not_enrolled";

    return {
      hasActiveSubscription,
      isEnrolledInCourse,
      canAccessCourse,
      canAccessLessons,
      subscriptionStatus: subscription?.status,
      subscriptionCancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
      enrollmentDate: enrollment?.enrolledAt,
      canPreviewFirstLesson,
      isFreeCourse,
      isPremiumCourse: !isFreeCourse,
      accessReason,
    };
  }

  /**
   * Check if user has active subscription
   * A subscription is considered active if it has status "ACTIVE"
   * (even if scheduled for cancellation, as they retain access until period end)
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        // Note: cancelAtPeriodEnd filter removed - users with cancelAtPeriodEnd=true
        // should still be considered active until the current period ends
      },
      select: { id: true },
    });

    return !!subscription;
  }

  /**
   * Check if user is enrolled in specific course
   */
  static async isEnrolledInCourse(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });

    return !!enrollment;
  }

  /**
   * Get user's course progress
   */
  static async getCourseProgress(userId: string, courseId: string) {
    const progress = await db.progress.findMany({
      where: {
        userId,
        lesson: {
          courseId,
        },
      },
      select: {
        lessonId: true,
        completed: true,
        completedAt: true,
      },
    });

    return progress;
  }

  /**
   * Check if user can access specific lesson.
   * Entitled learners open every lesson. Others open the free sample lessons of a published
   * course: the lessons flagged `isPreview`, or, when none is flagged and the course allows
   * previews, its first lesson in learning order (same rule as `canOpenItem`).
   */
  static async canAccessLesson(
    userId: string,
    lessonId: string
  ): Promise<boolean> {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        courseId: true,
        published: true,
        isPreview: true,
        course: { select: { published: true } },
      },
    });
    if (!lesson) return false;
    const access = await this.checkCourseAccess(userId, lesson.courseId);
    if (access.canAccessLessons) return true;
    if (!lesson.published || !lesson.course.published) return false;
    if (lesson.isPreview) return true;
    if (!access.canPreviewFirstLesson) return false;

    const flagged = await db.lesson.count({
      where: { courseId: lesson.courseId, published: true, isPreview: true },
    });
    if (flagged > 0) return false;
    const outline = await loadCourseOutline(lesson.courseId);
    const first = outline.items.find((item) => item.kind === "lesson");
    return first?.id === lessonId;
  }

  /**
   * Bulk check access for multiple courses
   */
  static async checkMultipleCoursesAccess(
    userId: string,
    courseIds: string[]
  ): Promise<Record<string, UserAccess>> {
    const results: Record<string, UserAccess> = {};
    if (courseIds.length === 0) return results;

    const [subscription, enrollments, courses, purchases] = await Promise.all([
      db.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE },
        select: { id: true, status: true, cancelAtPeriodEnd: true },
      }),
      db.enrollment.findMany({
        where: { userId, courseId: { in: courseIds } },
        select: { id: true, courseId: true, enrolledAt: true },
      }),
      db.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true, accessTier: true, previewEnabled: true, published: true },
      }),
      db.payment.findMany({
        where: {
          userId,
          courseId: { in: courseIds },
          kind: PaymentKind.COURSE,
          status: PaymentStatus.COMPLETED,
        },
        select: { id: true, kind: true, status: true, courseId: true },
      }),
    ]);

    const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));
    const courseMap = new Map(courses.map((c) => [c.id, c]));
    const hasActiveSubscription = !!subscription;

    for (const courseId of courseIds) {
      const course = courseMap.get(courseId);
      if (!course) continue;
      const isFreeCourse = course.accessTier === CourseAccessTier.FREE;
      const enrollment = enrollmentMap.get(courseId);
      const isEnrolledInCourse = !!enrollment;
      const canAccessCourse = AccessService.evaluateCourseAccess({
        enrollment,
        course,
        subscription,
        payments: purchases.filter((p) => p.courseId === courseId),
      }).allowed;
      const canPreviewFirstLesson =
        !canAccessCourse &&
        !isFreeCourse &&
        !!course.previewEnabled &&
        !!course.published;

      const accessReason: UserAccess["accessReason"] = canAccessCourse
        ? "ok"
        : canPreviewFirstLesson
        ? "preview_only"
        : isEnrolledInCourse
        ? "premium_locked"
        : "not_enrolled";
      results[courseId] = {
        hasActiveSubscription,
        isEnrolledInCourse,
        canAccessCourse,
        canAccessLessons: canAccessCourse,
        subscriptionStatus: subscription?.status,
        subscriptionCancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
        enrollmentDate: enrollment?.enrolledAt,
        canPreviewFirstLesson,
        isFreeCourse,
        isPremiumCourse: !isFreeCourse,
        accessReason,
      };
    }
    return results;
  }
}

export const accessService = AccessService;
