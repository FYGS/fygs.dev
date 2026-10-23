import { db } from "@/lib/db";
import { courseEntitlements } from "./progress";

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

/**
 * Enrols a learner in a path. Enrolling in the path enrols them in every published course they are
 * entitled to (free tier, lifetime purchase, active subscription: the rule of `enrollCourse`).
 * Premium courses they are not entitled to are reported, never unlocked. Safe to call again:
 * a returning learner gets the courses that became available since (a new subscription, a new course).
 */
export async function enrollInPath(userId: string, pathId: string): Promise<PathEnrollmentResult> {
  const path = await db.path.findFirst({
    where: { id: pathId, published: true },
    select: {
      id: true,
      courses: {
        orderBy: { order: "asc" },
        select: {
          optional: true,
          course: { select: { id: true, slug: true, title: true, accessTier: true, published: true } },
        },
      },
    },
  });
  if (!path) return { ok: false, error: "NOT_FOUND", alreadyEnrolled: false, enrolledCourseIds: [], needsAccess: [] };

  const courses = path.courses.filter((pc) => pc.course.published);
  const existing = await db.pathEnrollment.findUnique({
    where: { userId_pathId: { userId, pathId } },
    select: { id: true },
  });
  if (!existing) {
    try {
      await db.pathEnrollment.create({ data: { userId, pathId } });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error; // a double click enrolled first
    }
  }

  const entitlements = await courseEntitlements(
    userId,
    courses.map((pc) => ({ courseId: pc.course.id, accessTier: pc.course.accessTier })),
  );
  const already = new Set(
    (
      await db.enrollment.findMany({
        where: { userId, courseId: { in: courses.map((pc) => pc.course.id) } },
        select: { courseId: true },
      })
    ).map((e) => e.courseId),
  );

  const enrolledCourseIds: string[] = [];
  const needsAccess: PathEnrollmentResult["needsAccess"] = [];
  for (const pc of courses) {
    const { id, slug, title } = pc.course;
    if (already.has(id)) continue;
    if (!entitlements.get(id)) {
      needsAccess.push({ courseId: id, slug, title, optional: pc.optional });
      continue;
    }
    try {
      await db.enrollment.create({ data: { userId, courseId: id } });
      enrolledCourseIds.push(id);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  return { ok: true, alreadyEnrolled: existing !== null, enrolledCourseIds, needsAccess };
}
