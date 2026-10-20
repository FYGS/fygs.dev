import { db } from "@/lib/db";
import { ReportStatus, ReviewStatus } from "@/lib/generated/prisma/client";
import { logger } from "@/lib/structured-logger";
import { ReviewAnalyticsService } from "./review-analytics";
import { ReviewNotificationService } from "./review-notification";

export type ModerationDecision = "APPROVE" | "REJECT";

export type ModerationOutcome =
  | { ok: true; status: ReviewStatus; changed: boolean }
  | { ok: false; error: "NOT_FOUND" };

const TARGET: Record<ModerationDecision, ReviewStatus> = {
  APPROVE: ReviewStatus.APPROVED,
  REJECT: ReviewStatus.REJECTED,
};

/**
 * A moderator approves or rejects a review.
 *
 * Idempotent (deciding what is already decided changes nothing) and safe against two moderators
 * acting at once: the status is only written if it is still the one that was read, so a lost race
 * answers `changed: false` instead of writing a second, contradictory decision. The decision is
 * kept in `ReviewModeration`, the reports still open on the review are closed with it, and the
 * course instructor learns about a review the moment it becomes public.
 */
export async function moderateReview(input: {
  reviewId: string;
  decision: ModerationDecision;
  moderatorId: string;
  note?: string;
}): Promise<ModerationOutcome> {
  const target = TARGET[input.decision];
  const review = await db.review.findUnique({
    where: { id: input.reviewId },
    select: { id: true, status: true, courseId: true },
  });
  if (!review) return { ok: false, error: "NOT_FOUND" };
  if (review.status === target) return { ok: true, status: target, changed: false };

  const changed = await db.$transaction(async (tx) => {
    const updated = await tx.review.updateMany({
      where: { id: review.id, status: review.status },
      data: { status: target },
    });
    if (updated.count === 0) return false; // somebody else decided in the meantime

    await tx.reviewModeration.create({
      data: {
        reviewId: review.id,
        moderatorId: input.moderatorId,
        fromStatus: review.status,
        toStatus: target,
        note: input.note?.trim() || null,
      },
    });
    // an approval says the reports were unfounded; a rejection settles them
    await tx.reviewReport.updateMany({
      where: { reviewId: review.id, status: ReportStatus.PENDING },
      data: { status: target === ReviewStatus.APPROVED ? ReportStatus.DISMISSED : ReportStatus.RESOLVED },
    });
    return true;
  });

  if (!changed) return { ok: true, status: target, changed: false };

  ReviewAnalyticsService.invalidateCourseCache(review.courseId);
  logger.info("Review moderated", {
    eventType: "review.moderated",
    userId: input.moderatorId,
    resourceType: "review",
    resourceId: review.id,
    fromState: review.status,
    toState: target,
  });

  // A review nobody could see yet is news for the instructor only once it is public
  if (target === ReviewStatus.APPROVED && review.status === ReviewStatus.PENDING) {
    await ReviewNotificationService.notifyNewReview(review.id);
  }

  return { ok: true, status: target, changed: true };
}

export interface ModerationCounts {
  pending: number;
  flagged: number;
  approvedLast24h: number;
  rejectedLast24h: number;
}

/** What the moderation page shows above the queue: real counts, the decisions come from the trail. */
export async function getModerationCounts(now: Date = new Date()): Promise<ModerationCounts> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const [pending, flagged, approvedLast24h, rejectedLast24h] = await Promise.all([
    db.review.count({ where: { status: ReviewStatus.PENDING } }),
    db.review.count({ where: { status: ReviewStatus.FLAGGED } }),
    db.reviewModeration.count({ where: { toStatus: ReviewStatus.APPROVED, createdAt: { gte: since } } }),
    db.reviewModeration.count({ where: { toStatus: ReviewStatus.REJECTED, createdAt: { gte: since } } }),
  ]);
  return { pending, flagged, approvedLast24h, rejectedLast24h };
}
