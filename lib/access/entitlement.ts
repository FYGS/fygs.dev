import {
  CourseAccessTier,
  PaymentKind,
  PaymentStatus,
  SubscriptionStatus,
} from "@/lib/generated/prisma/browser";
import { db } from "@/lib/db";

/**
 * Who may follow which course: the one rule every screen, the checkout and the paths read.
 *
 * - A FREE course is open to a signed-in learner who enrolled.
 * - A PREMIUM course is open, once enrolled, with a lifetime purchase (a COMPLETED course payment; a refund
 *   marks it REFUNDED, a chargeback DISPUTED until it is decided), with an ACTIVE or TRIALING subscription whose
 *   period has not been over for more than `SUBSCRIPTION_GRACE_DAYS` without a renewal, or with an access granted
 *   by an administrator (`Enrollment.grantedAt`).
 * - The author of the course and administrators may look at everything (`staff`); what they do is not recorded
 *   unless they also hold a real entitlement.
 *
 * `eligible` says the learner holds a right to the course; `entitled` that they hold it AND enrolled (the
 * enrolment is what puts the course in their space and records progress). An eligible learner who is not enrolled
 * enrols in one click; an enrolled learner who lost the right is `lapsed`, with the reason to show.
 */

export type EntitlementSource = "free" | "purchase" | "subscription" | "grant" | "staff";

/** Why an enrolled learner no longer has access to a premium course. */
export type LapsedReason =
  /** Their subscription ended (cancelled, unpaid) and nothing else opens the course. */
  | "subscription_ended"
  /** Their purchase was refunded. */
  | "refunded"
  /** Their payment is contested with the bank (chargeback): access is suspended until it is decided. */
  | "disputed"
  /** The course became premium after they enrolled for free. */
  | "premium_required";

export interface SubscriptionSnapshot {
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

export interface EntitlementFacts {
  tier: CourseAccessTier;
  enrolled: boolean;
  granted: boolean;
  purchased: boolean;
  refunded: boolean;
  /** The purchase is contested with the bank. */
  disputed?: boolean;
  subscription: SubscriptionSnapshot | null;
  isStaff: boolean;
}

export interface EntitlementDecision {
  /** Holds a right to the course (whether enrolled or not). */
  eligible: boolean;
  /** May follow the course and has it in their space: eligible and enrolled, or staff. */
  entitled: boolean;
  source: EntitlementSource | null;
  lapsed: LapsedReason | null;
}

/**
 * How long after the end of its period a subscription that Stripe still reports ACTIVE keeps opening courses. Stripe
 * normally renews (new period) or cancels (status change) on time and tells us; the grace covers a late delivery. Past
 * it, a missing renewal event must not leave the access open for ever.
 */
export const SUBSCRIPTION_GRACE_DAYS = 3;
const GRACE_MS = SUBSCRIPTION_GRACE_DAYS * 24 * 60 * 60 * 1000;

/**
 * Whether a subscription opens premium courses: ACTIVE or TRIALING (a cancellation scheduled for the end of the period
 * keeps it active until then), and not left behind by more than the grace period. Callers that only know the status
 * (no period end) get the status rule alone.
 */
export function isSubscriptionActive(
  subscription: (Pick<SubscriptionSnapshot, "status"> & { currentPeriodEnd?: Date | null }) | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!subscription) return false;
  if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.TRIALING) return false;
  const end = subscription.currentPeriodEnd;
  if (end instanceof Date && !Number.isNaN(end.getTime()) && now.getTime() > end.getTime() + GRACE_MS) return false;
  return true;
}

/** The rule, without the database. */
export function decideEntitlement(facts: EntitlementFacts): EntitlementDecision {
  let source: EntitlementSource | null = null;
  if (facts.granted) source = "grant";
  else if (facts.tier === CourseAccessTier.FREE) source = "free";
  else if (facts.purchased) source = "purchase";
  else if (isSubscriptionActive(facts.subscription)) source = "subscription";

  const eligible = source !== null;
  if (eligible && facts.enrolled) return { eligible, entitled: true, source, lapsed: null };

  let lapsed: LapsedReason | null = null;
  if (facts.enrolled && !eligible) {
    lapsed = facts.disputed
      ? "disputed"
      : facts.refunded
        ? "refunded"
        : facts.subscription
          ? "subscription_ended"
          : "premium_required";
  }
  if (facts.isStaff) return { eligible, entitled: true, source: "staff", lapsed: null };
  return { eligible, entitled: false, source: eligible ? source : null, lapsed };
}

export interface CourseEntitlement extends EntitlementDecision {
  courseId: string;
  tier: CourseAccessTier;
  published: boolean;
  previewEnabled: boolean;
  enrolled: boolean;
  /** Access given by an administrator. */
  granted: boolean;
  /** A lifetime purchase that still counts (completed, not refunded, not contested). */
  purchased: boolean;
  isStaff: boolean;
}

export interface Entitlements {
  signedIn: boolean;
  subscription: SubscriptionSnapshot | null;
  hasActiveSubscription: boolean;
  courses: Map<string, CourseEntitlement>;
}

interface Viewer {
  id: string;
  role?: string | null;
}

/**
 * Entitlements of a viewer (`null` for a visitor) for several courses, in five queries whatever the number of
 * courses. Unknown course ids are left out of the map.
 */
export async function getEntitlements(viewer: Viewer | string | null, courseIds: readonly string[]): Promise<Entitlements> {
  const ids = [...new Set(courseIds)];
  const userId = typeof viewer === "string" ? viewer : (viewer?.id ?? null);
  const knownRole = typeof viewer === "object" && viewer !== null ? viewer.role : undefined;

  const [courses, user, subscription, enrollments, payments] = await Promise.all([
    ids.length
      ? db.course.findMany({
          where: { id: { in: ids } },
          select: { id: true, accessTier: true, published: true, previewEnabled: true, instructorId: true },
        })
      : Promise.resolve([]),
    userId && knownRole === undefined
      ? db.user.findUnique({ where: { id: userId }, select: { role: true } })
      : Promise.resolve(null),
    userId
      ? db.subscription.findUnique({
          where: { userId },
          select: { status: true, cancelAtPeriodEnd: true, currentPeriodEnd: true },
        })
      : Promise.resolve(null),
    userId && ids.length
      ? db.enrollment.findMany({ where: { userId, courseId: { in: ids } }, select: { courseId: true, grantedAt: true } })
      : Promise.resolve([]),
    userId && ids.length
      ? db.payment.findMany({
          where: {
            userId,
            kind: PaymentKind.COURSE,
            courseId: { in: ids },
            status: { in: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED, PaymentStatus.DISPUTED] },
          },
          select: { courseId: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  const role = knownRole ?? user?.role ?? null;
  const enrollmentByCourse = new Map(enrollments.map((e) => [e.courseId, e]));
  const purchased = new Set(payments.filter((p) => p.status === PaymentStatus.COMPLETED).map((p) => p.courseId));
  const refunded = new Set(payments.filter((p) => p.status === PaymentStatus.REFUNDED).map((p) => p.courseId));
  const disputed = new Set(payments.filter((p) => p.status === PaymentStatus.DISPUTED).map((p) => p.courseId));

  const map = new Map<string, CourseEntitlement>();
  for (const course of courses) {
    const enrollment = enrollmentByCourse.get(course.id);
    const isStaff = !!userId && (role === "ADMIN" || (role === "INSTRUCTOR" && course.instructorId === userId));
    const facts: EntitlementFacts = {
      tier: course.accessTier,
      enrolled: !!enrollment,
      granted: !!enrollment?.grantedAt,
      purchased: purchased.has(course.id),
      refunded: refunded.has(course.id) && !purchased.has(course.id),
      disputed: disputed.has(course.id) && !purchased.has(course.id),
      subscription,
      isStaff,
    };
    map.set(course.id, {
      ...decideEntitlement(facts),
      courseId: course.id,
      tier: course.accessTier,
      published: course.published,
      previewEnabled: course.previewEnabled,
      enrolled: facts.enrolled,
      granted: facts.granted,
      purchased: facts.purchased,
      isStaff,
    });
  }

  return {
    signedIn: !!userId,
    subscription,
    hasActiveSubscription: isSubscriptionActive(subscription),
    courses: map,
  };
}

/** Entitlement of one course; `null` when the course does not exist. */
export async function getEntitlement(viewer: Viewer | string | null, courseId: string): Promise<CourseEntitlement | null> {
  return (await getEntitlements(viewer, [courseId])).courses.get(courseId) ?? null;
}

/** Whether the viewer holds an active (or trialing) subscription, grace period included. */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await db.subscription.findUnique({ where: { userId }, select: { status: true, currentPeriodEnd: true } });
  return isSubscriptionActive(subscription);
}

/**
 * A learner who holds a real right to a published course and followed it: enrolled and eligible by a purchase,
 * subscription, free course or granted access. Staff do not count (they look at courses, they do not learn in them):
 * this is what reviews, certificates and anything that rewards learning ask for.
 */
export async function isEntitledLearner(userId: string, courseId: string): Promise<boolean> {
  const entitlement = await getEntitlement(userId, courseId);
  return !!entitlement && entitlement.published && entitlement.entitled && entitlement.source !== "staff";
}

/**
 * Free sample lessons, one rule for the catalog, the course page and the learning area: the published lessons
 * flagged as preview, plus the first lesson in course order when the course offers it (`Course.previewEnabled`).
 * Only a published course has samples. `lessons` must be the published lessons in course order.
 */
export function previewLessonIds(
  course: { published: boolean; previewEnabled: boolean },
  lessons: readonly { id: string; isPreview: boolean }[],
): Set<string> {
  const ids = new Set<string>();
  if (!course.published) return ids;
  for (const lesson of lessons) if (lesson.isPreview) ids.add(lesson.id);
  if (course.previewEnabled && lessons[0]) ids.add(lessons[0].id);
  return ids;
}

/** The courses (among `courseIds`) that offer at least one free sample lesson, by the rule above, in one query. */
export async function coursesWithPreview(courseIds: readonly string[]): Promise<Set<string>> {
  if (courseIds.length === 0) return new Set();
  const rows = await db.course.findMany({
    where: {
      id: { in: [...courseIds] },
      published: true,
      OR: [
        { previewEnabled: true, lessons: { some: { published: true } } },
        { lessons: { some: { published: true, isPreview: true } } },
      ],
    },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}
