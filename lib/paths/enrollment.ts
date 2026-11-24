import { db } from "@/lib/db";
import { getEntitlements } from "@/lib/access/entitlement";
import { courseOffer, offerPriceLabel, viewerStatus, type CourseOffer, type ViewerStatus } from "@/lib/access/offer";

export interface PathEnrollmentResult {
  ok: boolean;
  error?: "NOT_FOUND";
  alreadyEnrolled: boolean;
  /** Courses the learner was just enrolled in */
  enrolledCourseIds: string[];
  /** Premium courses of the path that need a subscription or a purchase first: no access is granted here */
  needsAccess: { courseId: string; slug: string; title: string; optional: boolean }[];
}

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

/** Enrols `userId` in every course of `courseIds` they may take and are not enrolled in yet; returns the new ones. */
async function enrollEligible(userId: string, courseIds: string[]): Promise<{ enrolled: string[]; locked: Set<string> }> {
  const all = await getEntitlements(userId, courseIds);
  const enrolled: string[] = [];
  const locked = new Set<string>();
  for (const id of courseIds) {
    const entitlement = all.courses.get(id);
    if (!entitlement || entitlement.enrolled) continue;
    if (!entitlement.eligible) {
      locked.add(id);
      continue;
    }
    try {
      await db.enrollment.create({ data: { userId, courseId: id } });
      enrolled.push(id);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return { enrolled, locked };
}

/**
 * Enrols a learner in a path, and in every published course of it they may take (the one entitlement rule:
 * free course, lifetime purchase, subscription, access granted). Premium courses they cannot take are reported,
 * never unlocked. Safe to call again: a returning learner gets the courses that became available since.
 */
export async function enrollInPath(userId: string, pathId: string): Promise<PathEnrollmentResult> {
  const path = await db.path.findFirst({
    where: { id: pathId, published: true },
    select: {
      id: true,
      courses: {
        orderBy: { order: "asc" },
        select: { optional: true, course: { select: { id: true, slug: true, title: true, published: true } } },
      },
    },
  });
  if (!path) return { ok: false, error: "NOT_FOUND", alreadyEnrolled: false, enrolledCourseIds: [], needsAccess: [] };

  const courses = path.courses.filter((pc) => pc.course.published);
  const existing = await db.pathEnrollment.findUnique({ where: { userId_pathId: { userId, pathId } }, select: { id: true } });
  if (!existing) {
    try {
      await db.pathEnrollment.create({ data: { userId, pathId } });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error; // a double click enrolled first
    }
  }

  const { enrolled, locked } = await enrollEligible(userId, courses.map((pc) => pc.course.id));
  return {
    ok: true,
    alreadyEnrolled: existing !== null,
    enrolledCourseIds: enrolled,
    needsAccess: courses
      .filter((pc) => locked.has(pc.course.id))
      .map((pc) => ({ courseId: pc.course.id, slug: pc.course.slug, title: pc.course.title, optional: pc.optional })),
  };
}

/**
 * After a purchase, a subscription or an access granted: the courses of the learner's paths that just became open
 * are added to their space, as `enrollInPath` would have done. Returns the courses enrolled.
 */
export async function syncPathEnrollments(userId: string): Promise<string[]> {
  const rows = await db.pathCourse.findMany({
    where: { path: { published: true, enrollments: { some: { userId } } }, course: { published: true } },
    select: { courseId: true },
  });
  if (rows.length === 0) return [];
  const { enrolled } = await enrollEligible(userId, [...new Set(rows.map((r) => r.courseId))]);
  return enrolled;
}

/** What a course of a path asks of the viewer, for the path page. */
export interface PathCourseAccess {
  courseId: string;
  offer: CourseOffer;
  /** "Gratuite", "49,99 €", "Inclus dans Premium". */
  priceLabel: string;
  status: ViewerStatus;
  /**
   * - `open`: followed already (or staff)
   * - `enrol`: may be taken now, one click
   * - `buy_or_subscribe`: premium, sold on its own and included in Premium
   * - `subscribe`: premium, only through the subscription
   * - `sign_in`: the visitor is not signed in
   */
  needs: "open" | "enrol" | "buy_or_subscribe" | "subscribe" | "sign_in";
}

export async function pathCourseAccess(
  viewer: { id: string; role?: string | null } | null,
  courses: { courseId: string; accessTier: string; price: number | string | { toString(): string } | null }[],
): Promise<Map<string, PathCourseAccess>> {
  const all = viewer ? await getEntitlements(viewer, courses.map((c) => c.courseId)) : null;
  return new Map(
    courses.map((c) => {
      const entitlement = all?.courses.get(c.courseId) ?? null;
      const offer = courseOffer(c.accessTier, c.price);
      const needs: PathCourseAccess["needs"] = entitlement?.entitled
        ? "open"
        : entitlement?.eligible || (viewer && offer.kind === "free")
          ? "enrol"
          : !viewer
            ? "sign_in"
            : offer.kind === "premium" && offer.price !== null
              ? "buy_or_subscribe"
              : "subscribe";
      return [c.courseId, { courseId: c.courseId, offer, priceLabel: offerPriceLabel(offer), status: viewerStatus(entitlement), needs }];
    }),
  );
}
