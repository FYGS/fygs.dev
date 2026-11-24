import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { ReviewData } from "@/components/reviews/review-display";

/** Published reviews of a course, as the course page shows them: a summary, then pages of reviews. */

export const REVIEW_PAGE_SIZE = 10;
export type ReviewSort = "recent" | "helpful" | "best" | "worst";
export const REVIEW_SORTS: readonly ReviewSort[] = ["recent", "helpful", "best", "worst"];

export interface ReviewSummary {
  count: number;
  /** 0 when there is no review. */
  average: number;
  /** Number of reviews per rating, 1 to 5. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function getReviewSummary(courseId: string): Promise<ReviewSummary> {
  const rows = await db.review.groupBy({
    by: ["rating"],
    where: { courseId, status: "APPROVED" },
    _count: { _all: true },
  });
  const distribution: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;
  for (const row of rows) {
    const rating = Math.min(5, Math.max(1, row.rating)) as 1 | 2 | 3 | 4 | 5;
    distribution[rating] += row._count._all;
    count += row._count._all;
    sum += row.rating * row._count._all;
  }
  return { count, average: count ? sum / count : 0, distribution };
}

const ORDER: Record<ReviewSort, Prisma.ReviewOrderByWithRelationInput[]> = {
  recent: [{ createdAt: "desc" }],
  helpful: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
  best: [{ rating: "desc" }, { createdAt: "desc" }],
  worst: [{ rating: "asc" }, { createdAt: "desc" }],
};

/** One page of published reviews, with replies and the viewer's own vote, in a single query. */
export async function getReviewPage(input: {
  courseId: string;
  viewerId: string | null;
  sort?: ReviewSort;
  rating?: number | null;
  offset?: number;
}): Promise<{ reviews: ReviewData[]; hasMore: boolean }> {
  const sort = input.sort && REVIEW_SORTS.includes(input.sort) ? input.sort : "recent";
  const rating = input.rating && input.rating >= 1 && input.rating <= 5 ? Math.round(input.rating) : null;
  const rows = await db.review.findMany({
    where: { courseId: input.courseId, status: "APPROVED", ...(rating && { rating }) },
    orderBy: [...ORDER[sort], { id: "asc" }],
    skip: Math.max(0, input.offset ?? 0),
    take: REVIEW_PAGE_SIZE + 1,
    select: {
      id: true,
      rating: true,
      comment: true,
      verified: true,
      helpfulCount: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, name: true, image: true, role: true } },
        },
      },
      votes: input.viewerId ? { where: { userId: input.viewerId }, select: { helpful: true } } : false,
    },
  });

  const reviews: ReviewData[] = rows.slice(0, REVIEW_PAGE_SIZE).map((r) => {
    const vote = Array.isArray(r.votes) ? r.votes[0] : undefined;
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? "",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      isModerated: true,
      isFlagged: false,
      status: "PUBLISHED",
      verified: r.verified,
      user: { id: r.user.id, name: r.user.name, image: r.user.image },
      helpfulCount: r.helpfulCount,
      votes: { helpful: r.helpfulCount, unhelpful: 0, userVote: vote ? { helpful: vote.helpful } : null },
      replies: r.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: {
          id: reply.user.id,
          name: reply.user.name,
          avatar: reply.user.image,
          role: reply.user.role === "ADMIN" ? "ADMIN" : reply.user.role === "INSTRUCTOR" ? "INSTRUCTOR" : "STUDENT",
        },
        isInstructorReply: reply.user.role === "INSTRUCTOR" || reply.user.role === "ADMIN",
      })),
    };
  });
  return { reviews, hasMore: rows.length > REVIEW_PAGE_SIZE };
}

export interface OwnReview {
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
}

export async function getOwnReview(userId: string, courseId: string): Promise<OwnReview | null> {
  return db.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { rating: true, comment: true, status: true },
  });
}
