"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntitlement } from "@/lib/access/entitlement";
import { submitReviewSchema } from "@/lib/validators/course";
import { ReviewContentValidator } from "@/lib/validators/review-validators";
import { ReviewPermissionsService } from "@/lib/services/review-permissions";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { ReviewNotificationService } from "@/lib/services/review-notification";
import { getReviewPage, type ReviewSort } from "@/lib/reviews/course-reviews";
import { COURSE_TAG_FEATURED, COURSE_TAG_LIST, COURSE_TAG_RECOMMENDATIONS } from "@/lib/repositories/course-repository";
import { logger } from "@/lib/structured-logger";

export type SubmitReviewResult =
  | { ok: true; status: "APPROVED" | "PENDING"; message: string }
  | { ok: false; message: string };

/**
 * Writes (or rewrites) the review of a learner who follows the course. Same moderation as the reviews API: the
 * text is checked, a confident text from a verified account is published at once, the rest waits for a moderator.
 */
export async function submitCourseReview(input: { courseId: string; rating: number; comment?: string }): Promise<SubmitReviewResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { ok: false, message: "Connectez-vous pour laisser un avis." };
  const user = session.user;

  const parsed = submitReviewSchema.safeParse({
    courseId: input.courseId,
    rating: input.rating,
    comment: input.comment?.trim() || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Choisissez une note de 1 à 5 et un commentaire de 3 à 2 000 caractères." };
  const { courseId, rating, comment } = parsed.data;

  const entitlement = await getEntitlement({ id: user.id, role: user.role }, courseId);
  if (!entitlement?.entitled || entitlement.source === "staff") {
    return { ok: false, message: "Seuls les apprenants qui suivent la formation peuvent laisser un avis." };
  }

  const existing = await db.review.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  // A first review goes through the same eligibility as the reviews API (followed enough of the course, account and
  // enrolment old enough, not suspended); rewriting your own review needs the right to the course, checked above
  if (!existing) {
    const eligibility = await ReviewPermissionsService.canCreateReview(user.id, courseId);
    if (!eligibility.allowed) return { ok: false, message: eligibility.reason ?? "Vous ne pouvez pas encore laisser d'avis." };
  }
  const limit = await ReviewPermissionsService.checkRateLimit(user.id, existing ? "edit" : "create");
  if (!limit.allowed) return { ok: false, message: limit.reason ?? "Trop de tentatives, réessayez plus tard." };

  let confidence = 1;
  if (comment) {
    const check = ReviewContentValidator.validateContent(comment);
    if (!check.isValid) return { ok: false, message: `Votre commentaire ne peut pas être publié : ${check.issues.join(", ")}.` };
    confidence = check.confidence;
  }
  const status = confidence > 0.8 && user.emailVerified ? "APPROVED" : "PENDING";

  const review = existing
    ? await db.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment ?? null, status, updatedAt: new Date() },
        select: { id: true },
      })
    : await db.review.create({
        data: { userId: user.id, courseId, rating, comment: comment ?? null, status, verified: !!user.emailVerified },
        select: { id: true },
      });

  ReviewAnalyticsService.invalidateCourseCache(courseId);
  if (status === "APPROVED" && !existing) {
    ReviewNotificationService.notifyNewReview(review.id).catch((error) =>
      logger.error("Failed to send review notification", {
        metadata: { reviewId: review.id, error: error instanceof Error ? error.message : String(error) },
      }),
    );
  }

  const course = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  revalidateTag(COURSE_TAG_FEATURED, { expire: 0 });
  revalidateTag(COURSE_TAG_LIST, { expire: 0 });
  revalidateTag(COURSE_TAG_RECOMMENDATIONS, { expire: 0 });
  if (course) revalidatePath(`/fr/formations/${course.slug}`);

  return status === "APPROVED"
    ? { ok: true, status, message: existing ? "Votre avis a été mis à jour." : "Merci, votre avis est publié." }
    : { ok: true, status, message: "Merci, votre avis sera publié après relecture." };
}

/** Another page of the published reviews of a course (sort and rating filter of the course page). */
export async function loadCourseReviews(input: { courseId: string; sort?: ReviewSort; rating?: number | null; offset?: number }) {
  const session = await auth.api.getSession({ headers: await headers() });
  return getReviewPage({ ...input, viewerId: session?.user?.id ?? null });
}
