import { db } from "@/lib/db";
import { getPublishedPath } from "./queries";
import { loadUserPath } from "./progress";

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

/**
 * Issues the certificate of every path the learner is enrolled in and has completed (every
 * required course complete). Idempotent: a path that already has its certificate is skipped, a
 * double call or two tabs cannot issue it twice. Call it after a course is completed and when a
 * path or the dashboard is shown.
 */
export async function syncPathCertificates(
  userId: string,
): Promise<{ issued: { pathId: string; slug: string; title: string; code: string }[] }> {
  const enrollments = await db.pathEnrollment.findMany({
    where: { userId, path: { published: true } },
    select: { path: { select: { id: true, slug: true, title: true } } },
  });
  if (enrollments.length === 0) return { issued: [] };

  const certified = new Set(
    (
      await db.pathCertificate.findMany({
        where: { userId, pathId: { in: enrollments.map((e) => e.path.id) } },
        select: { pathId: true },
      })
    ).map((c) => c.pathId),
  );

  const issued: { pathId: string; slug: string; title: string; code: string }[] = [];
  for (const { path } of enrollments) {
    if (certified.has(path.id)) continue;
    const detail = await getPublishedPath(path.slug);
    if (!detail) continue;
    const state = await loadUserPath(userId, detail);
    if (!state.progress.isComplete) continue;
    try {
      const certificate = await db.pathCertificate.create({
        data: { userId, pathId: path.id },
        select: { code: true },
      });
      issued.push({ pathId: path.id, slug: path.slug, title: path.title, code: certificate.code });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error; // issued by a concurrent call
    }
  }
  return { issued };
}

export interface VerifiedPathCertificate {
  code: string;
  issuedAt: Date;
  holderName: string;
  pathTitle: string;
  pathSlug: string;
  courseTitles: string[];
}

/** Public verification of a path certificate. `null` when the code matches nothing. */
export async function verifyPathCertificate(code: string): Promise<VerifiedPathCertificate | null> {
  if (!/^[a-f0-9]{16,64}$/i.test(code)) return null;
  const certificate = await db.pathCertificate.findUnique({
    where: { code: code.toLowerCase() },
    select: {
      code: true,
      issuedAt: true,
      user: { select: { name: true } },
      path: {
        select: {
          title: true,
          slug: true,
          courses: { orderBy: { order: "asc" }, where: { optional: false }, select: { course: { select: { title: true } } } },
        },
      },
    },
  });
  if (!certificate) return null;
  return {
    code: certificate.code,
    issuedAt: certificate.issuedAt,
    holderName: certificate.user.name,
    pathTitle: certificate.path.title,
    pathSlug: certificate.path.slug,
    courseTitles: certificate.path.courses.map((c) => c.course.title),
  };
}
