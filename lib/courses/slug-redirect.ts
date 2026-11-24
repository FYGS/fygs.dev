import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

type Tx = Prisma.TransactionClient;

/**
 * Former addresses of courses. When a course changes its slug, the old one keeps working: the course page and the
 * learning area look it up here when no course answers to the slug, and redirect permanently to the current one.
 * A slug taken again (by the same course or by another one) stops being a redirect.
 */

/** To call in the transaction that changes a course's slug from `previous` to `next`. */
export async function recordSlugChange(tx: Tx, courseId: string, previous: string, next: string): Promise<void> {
  if (previous === next) return;
  await tx.courseSlugRedirect.deleteMany({ where: { slug: next } });
  await tx.courseSlugRedirect.upsert({
    where: { slug: previous },
    create: { slug: previous, courseId },
    update: { courseId },
  });
  // Older addresses of this course point straight at the new one (no chain of redirects to follow).
}

/** To call when a course is created or duplicated with `slug`: that address now belongs to it. */
export async function claimSlug(tx: Tx, slug: string): Promise<void> {
  await tx.courseSlugRedirect.deleteMany({ where: { slug } });
}

/** The current slug of the course that used to answer to `slug`, or null when the address never existed. */
export async function findRedirectedCourseSlug(slug: string): Promise<string | null> {
  const redirect = await db.courseSlugRedirect.findUnique({
    where: { slug },
    select: { course: { select: { slug: true } } },
  });
  return redirect?.course.slug ?? null;
}
