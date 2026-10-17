/**
 * Integration tests for Review API endpoints
 * Tests full request/response cycles against the real route handlers and a
 * real database. Every test builds the rows it needs (unique per test) and the
 * database is emptied before each one.
 */

import { describe, it, expect, beforeEach, vi, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ReviewStatus, Role } from "@/lib/generated/prisma/client";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { createCourse, createUser } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";

// API handlers under test
import {
  GET as getReviews,
  POST as createReview,
} from "@/app/api/reviews/route";
import {
  GET as getReview,
  PUT as updateReview,
  DELETE as deleteReview,
} from "@/app/api/reviews/[reviewId]/route";
import { POST as voteReview } from "@/app/api/reviews/[reviewId]/vote/route";
import { POST as replyToReview } from "@/app/api/reviews/[reviewId]/replies/route";

// The signed-in user of the current test (null = anonymous)
const current = vi.hoisted(() => ({
  user: null as null | Record<string, unknown>,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () =>
        current.user ? { user: current.user } : null,
      ),
    },
  },
}));

// Notifications are fire-and-forget e-mails: not what these tests are about
vi.mock("@/lib/services/review-notification", () => ({
  ReviewNotificationService: {
    notifyNewReview: vi.fn(async () => undefined),
    notifyHelpfulVote: vi.fn(async () => undefined),
    notifyInstructorReply: vi.fn(async () => undefined),
  },
}));

const BASE = "http://localhost:3000/api/reviews";
const HOUR = 60 * 60 * 1000;
const hoursAgo = (h: number) => new Date(Date.now() - h * HOUR);

type DbUser = Awaited<ReturnType<typeof createUser>>;

function signIn(user: DbUser | null) {
  current.user = user;
}

const ctx = (reviewId: string) => ({ params: Promise.resolve({ reviewId }) });

function jsonRequest(url: string, method: string, body: unknown) {
  return new NextRequest(url, {
    method,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

/** A published course taught by a fresh instructor. */
async function seedCourse() {
  const instructor = await createUser({ role: Role.INSTRUCTOR });
  const course = await createCourse({ instructorId: instructor.id });
  return { instructor, course };
}

/** A student who may write a review: account and enrollment are old enough. */
async function seedEligibleStudent(courseId: string, emailVerified = true) {
  const student = await createUser({
    emailVerified,
    createdAt: hoursAgo(72),
  });
  await db.enrollment.create({
    data: { userId: student.id, courseId, enrolledAt: hoursAgo(48) },
  });
  return student;
}

async function seedReview(
  courseId: string,
  data: {
    userId?: string;
    rating?: number;
    comment?: string | null;
    status?: ReviewStatus;
    createdAt?: Date;
  } = {},
) {
  const userId = data.userId ?? (await createUser()).id;
  const createdAt = data.createdAt ?? new Date();
  return db.review.create({
    data: {
      userId,
      courseId,
      rating: data.rating ?? 4,
      comment: data.comment === undefined ? "A solid course." : data.comment,
      status: data.status ?? ReviewStatus.APPROVED,
      createdAt,
      updatedAt: createdAt,
    },
  });
}

// leave an empty database for the suites that run next
afterAll(async () => {
  await resetDatabase(db);
});

describe("Review API Integration Tests", () => {
  beforeEach(async () => {
    await resetDatabase(db);
    signIn(null);
    __resetRateLimitMemory();
  });

  describe("GET /api/reviews", () => {
    it("should return paginated reviews", async () => {
      const { course } = await seedCourse();
      for (let i = 0; i < 3; i++) await seedReview(course.id);

      const response = await getReviews(
        new NextRequest(`${BASE}?courseId=${course.id}&page=1&limit=2`),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toHaveLength(2);
      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        totalCount: 3,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
      });

      const page2 = await (
        await getReviews(
          new NextRequest(`${BASE}?courseId=${course.id}&page=2&limit=2`),
        )
      ).json();
      expect(page2.reviews).toHaveLength(1);
      expect(page2.pagination.hasNextPage).toBe(false);
    });

    it("should only list approved reviews by default", async () => {
      const { course } = await seedCourse();
      const approved = await seedReview(course.id);
      await seedReview(course.id, { status: ReviewStatus.PENDING });
      await seedReview(course.id, { status: ReviewStatus.FLAGGED });

      const data = await (
        await getReviews(new NextRequest(`${BASE}?courseId=${course.id}`))
      ).json();

      expect(data.reviews.map((r: { id: string }) => r.id)).toEqual([
        approved.id,
      ]);
    });

    it("should require a course, user or instructor filter", async () => {
      const response = await getReviews(new NextRequest(BASE));

      expect(response.status).toBe(400);
    });

    it("should filter reviews by course", async () => {
      const { course } = await seedCourse();
      const { course: other } = await seedCourse();
      const mine = await seedReview(course.id);
      await seedReview(other.id);

      const response = await getReviews(
        new NextRequest(`${BASE}?courseId=${course.id}`),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toHaveLength(1);
      expect(data.reviews[0]).toMatchObject({
        id: mine.id,
        courseId: course.id,
      });
    });

    it("should filter reviews by rating", async () => {
      const { course } = await seedCourse();
      await seedReview(course.id, { rating: 5 });
      await seedReview(course.id, { rating: 5 });
      await seedReview(course.id, { rating: 2 });

      const data = await (
        await getReviews(
          new NextRequest(`${BASE}?courseId=${course.id}&rating=5`),
        )
      ).json();

      expect(data.reviews).toHaveLength(2);
      data.reviews.forEach((review: { rating: number }) => {
        expect(review.rating).toBe(5);
      });
    });

    it("should sort reviews by different criteria", async () => {
      const { course } = await seedCourse();
      for (const rating of [3, 5, 1, 4]) {
        await seedReview(course.id, { rating });
      }

      const high = await (
        await getReviews(
          new NextRequest(`${BASE}?courseId=${course.id}&sortBy=rating_high`),
        )
      ).json();
      const low = await (
        await getReviews(
          new NextRequest(`${BASE}?courseId=${course.id}&sortBy=rating_low`),
        )
      ).json();

      expect(high.reviews.map((r: { rating: number }) => r.rating)).toEqual([
        5, 4, 3, 1,
      ]);
      expect(low.reviews.map((r: { rating: number }) => r.rating)).toEqual([
        1, 3, 4, 5,
      ]);
    });

    it("should handle search queries", async () => {
      const { course } = await seedCourse();
      await seedReview(course.id, { comment: "An Excellent introduction." });
      await seedReview(course.id, { comment: "Too basic for me." });

      const response = await getReviews(
        new NextRequest(`${BASE}?courseId=${course.id}&search=excellent`),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reviews).toHaveLength(1);
      expect(data.reviews[0].comment.toLowerCase()).toContain("excellent");
    });
  });

  describe("POST /api/reviews", () => {
    it("should create a new review when authenticated", async () => {
      const { course } = await seedCourse();
      const student = await seedEligibleStudent(course.id);
      signIn(student);

      const reviewData = {
        courseId: course.id,
        rating: 5,
        comment: "Excellent course! Highly recommended.",
      };
      const response = await createReview(
        jsonRequest(BASE, "POST", reviewData),
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.review).toMatchObject({
        rating: 5,
        comment: reviewData.comment,
        status: "APPROVED", // verified e-mail + clean content: auto-approved
        verified: true,
        user: { id: student.id },
      });
      expect(data.review).toHaveProperty("id");
      expect(data.review).toHaveProperty("createdAt");

      const stored = await db.review.findUniqueOrThrow({
        where: { id: data.review.id },
      });
      expect(stored).toMatchObject({
        userId: student.id,
        courseId: course.id,
      });
    });

    it("should queue the review for moderation when the e-mail is not verified", async () => {
      const { course } = await seedCourse();
      const student = await seedEligibleStudent(course.id, false);
      signIn(student);

      const response = await createReview(
        jsonRequest(BASE, "POST", {
          courseId: course.id,
          rating: 4,
          comment: "Good course with clear explanations.",
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.review).toMatchObject({ status: "PENDING", verified: false });
    });

    it("should reject review without authentication", async () => {
      const { course } = await seedCourse();

      const response = await createReview(
        jsonRequest(BASE, "POST", {
          courseId: course.id,
          rating: 5,
          comment: "Great course, really enjoyed it!",
        }),
      );

      expect(response.status).toBe(401);
      expect(await db.review.count()).toBe(0);
    });

    it("should validate review data", async () => {
      const { course } = await seedCourse();
      signIn(await seedEligibleStudent(course.id));

      const response = await createReview(
        jsonRequest(BASE, "POST", {
          courseId: "", // invalid
          rating: 6, // out of range
          comment: "short", // too short
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(Object.keys(data.details).sort()).toEqual([
        "comment",
        "courseId",
        "rating",
      ]);
      expect(await db.review.count()).toBe(0);
    });

    it("should refuse a review from a user who is not enrolled", async () => {
      const { course } = await seedCourse();
      const outsider = await createUser({ createdAt: hoursAgo(72) });
      signIn(outsider);

      const response = await createReview(
        jsonRequest(BASE, "POST", {
          courseId: course.id,
          rating: 5,
          comment: "I never took this course but here is my opinion.",
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.requiresAction).toBe("enroll");
      expect(await db.review.count()).toBe(0);
    });

    it("should refuse a review from an account created less than 24h ago", async () => {
      const { course } = await seedCourse();
      const fresh = await createUser(); // created now
      await db.enrollment.create({
        data: { userId: fresh.id, courseId: course.id, enrolledAt: hoursAgo(5) },
      });
      signIn(fresh);

      const response = await createReview(
        jsonRequest(BASE, "POST", {
          courseId: course.id,
          rating: 5,
          comment: "Very nice course, I enjoyed every lesson.",
        }),
      );

      expect(response.status).toBe(403);
      expect(await db.review.count()).toBe(0);
    });

    it("should prevent duplicate reviews for same course", async () => {
      const { course } = await seedCourse();
      signIn(await seedEligibleStudent(course.id));

      const reviewData = {
        courseId: course.id,
        rating: 4,
        comment: "Good course content.",
      };

      // First review should succeed
      const response1 = await createReview(
        jsonRequest(BASE, "POST", reviewData),
      );
      expect(response1.status).toBe(201);

      // A second review for the same course is refused by the permission check
      const response2 = await createReview(
        jsonRequest(BASE, "POST", reviewData),
      );
      expect(response2.status).toBe(403);
      expect(await db.review.count()).toBe(1);
    });

    it("should limit a user to 3 new reviews per day", async () => {
      const { course } = await seedCourse();
      const student = await seedEligibleStudent(course.id);
      for (let i = 0; i < 3; i++) {
        const { course: other } = await seedCourse();
        await seedReview(other.id, { userId: student.id });
      }
      signIn(student);

      const response = await createReview(
        jsonRequest(BASE, "POST", {
          courseId: course.id,
          rating: 5,
          comment: "A fourth review within the same day.",
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toHaveProperty("resetTime");
      expect(await db.review.count({ where: { courseId: course.id } })).toBe(0);
    });
  });

  describe("GET /api/reviews/[id]", () => {
    it("should return a specific review", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);

      const response = await getReview(
        new NextRequest(`${BASE}/${review.id}`),
        ctx(review.id),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.review.id).toBe(review.id);
      expect(data.review).toHaveProperty("user");
      expect(data.review.course.id).toBe(course.id);
      expect(data.review).toHaveProperty("votes");
      expect(data.review).toHaveProperty("replies");
    });

    it("should return 404 for non-existent review", async () => {
      const response = await getReview(
        new NextRequest(`${BASE}/non-existent`),
        ctx("non-existent"),
      );

      expect(response.status).toBe(404);
    });

    it("should hide a pending review from everybody but its author", async () => {
      const { course } = await seedCourse();
      const author = await createUser();
      const review = await seedReview(course.id, {
        userId: author.id,
        status: ReviewStatus.PENDING,
      });
      const get = () =>
        getReview(new NextRequest(`${BASE}/${review.id}`), ctx(review.id));

      expect((await get()).status).toBe(404); // anonymous

      signIn(await createUser()); // another student
      expect((await get()).status).toBe(404);

      signIn(author);
      expect((await get()).status).toBe(200);
    });
  });

  describe("PUT /api/reviews/[id]", () => {
    it("should update own review when authenticated", async () => {
      const { course } = await seedCourse();
      const author = await createUser();
      const review = await seedReview(course.id, {
        userId: author.id,
        createdAt: hoursAgo(2),
      });
      signIn(author);

      const updateData = {
        rating: 3,
        comment: "Updated review comment after more experience.",
      };
      const response = await updateReview(
        jsonRequest(`${BASE}/${review.id}`, "PUT", updateData),
        ctx(review.id),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.review.rating).toBe(updateData.rating);
      expect(data.review.comment).toBe(updateData.comment);

      const stored = await db.review.findUniqueOrThrow({
        where: { id: review.id },
      });
      expect(stored.rating).toBe(3);
      expect(stored.updatedAt.getTime()).toBeGreaterThan(
        stored.createdAt.getTime(),
      );
    });

    it("should reject update of other user's review", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id, { rating: 5 });
      signIn(await createUser());

      const response = await updateReview(
        jsonRequest(`${BASE}/${review.id}`, "PUT", {
          rating: 1,
          comment: "Trying to update someone else's review",
        }),
        ctx(review.id),
      );

      expect(response.status).toBe(403);
      expect(
        (await db.review.findUniqueOrThrow({ where: { id: review.id } }))
          .rating,
      ).toBe(5);
    });

    it("should refuse an edit after the 24h edit window", async () => {
      const { course } = await seedCourse();
      const author = await createUser();
      const review = await seedReview(course.id, {
        userId: author.id,
        rating: 5,
        createdAt: hoursAgo(30),
      });
      signIn(author);

      const response = await updateReview(
        jsonRequest(`${BASE}/${review.id}`, "PUT", { rating: 2 }),
        ctx(review.id),
      );

      expect(response.status).toBe(403);
    });

    it("should require authentication", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);

      const response = await updateReview(
        jsonRequest(`${BASE}/${review.id}`, "PUT", { rating: 2 }),
        ctx(review.id),
      );

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/reviews/[id]", () => {
    it("should delete own review when authenticated", async () => {
      const { course } = await seedCourse();
      const author = await createUser();
      const review = await seedReview(course.id, {
        userId: author.id,
        createdAt: hoursAgo(10),
      });
      signIn(author);

      const response = await deleteReview(
        new NextRequest(`${BASE}/${review.id}`, { method: "DELETE" }),
        ctx(review.id),
      );

      expect(response.status).toBe(200);

      // Verify review is deleted
      const getResponse = await getReview(
        new NextRequest(`${BASE}/${review.id}`),
        ctx(review.id),
      );
      expect(getResponse.status).toBe(404);
    });

    it("should refuse deletion of another user's review", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);
      signIn(await createUser());

      const response = await deleteReview(
        new NextRequest(`${BASE}/${review.id}`, { method: "DELETE" }),
        ctx(review.id),
      );

      expect(response.status).toBe(403);
      expect(await db.review.count({ where: { id: review.id } })).toBe(1);
    });

    it("should allow admin to delete any review (with its votes and replies)", async () => {
      const { course, instructor } = await seedCourse();
      const review = await seedReview(course.id, { createdAt: hoursAgo(500) });
      const voter = await createUser();
      await db.reviewVote.create({
        data: { reviewId: review.id, userId: voter.id, helpful: true },
      });
      await db.reviewReply.create({
        data: {
          reviewId: review.id,
          userId: instructor.id,
          content: "Thanks for the feedback!",
        },
      });
      signIn(await createUser({ role: Role.ADMIN }));

      const response = await deleteReview(
        new NextRequest(`${BASE}/${review.id}`, { method: "DELETE" }),
        ctx(review.id),
      );

      expect(response.status).toBe(200);
      expect(await db.review.count()).toBe(0);
      expect(await db.reviewVote.count()).toBe(0);
      expect(await db.reviewReply.count()).toBe(0);
    });
  });

  describe("POST /api/reviews/[id]/vote", () => {
    it("should allow voting on reviews", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);
      const voter = await createUser();
      signIn(voter);

      const response = await voteReview(
        jsonRequest(`${BASE}/${review.id}/vote`, "POST", { helpful: true }),
        ctx(review.id),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.action).toBe("created");
      expect(data.vote).toMatchObject({
        reviewId: review.id,
        userId: voter.id,
        helpful: true,
      });
      expect(data.helpfulCount).toBe(1);
      expect(
        (await db.review.findUniqueOrThrow({ where: { id: review.id } }))
          .helpfulCount,
      ).toBe(1);
    });

    it("should update existing vote", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);
      const voter = await createUser();
      signIn(voter);
      const vote = (helpful: boolean) =>
        voteReview(
          jsonRequest(`${BASE}/${review.id}/vote`, "POST", { helpful }),
          ctx(review.id),
        );

      // First vote
      expect((await vote(true)).status).toBe(200);

      // Opposite vote replaces the first one
      const response = await vote(false);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.action).toBe("updated");
      expect(data.vote.helpful).toBe(false);
      expect(data.helpfulCount).toBe(0);
      expect(await db.reviewVote.count({ where: { reviewId: review.id } })).toBe(
        1,
      );
    });

    it("should remove the vote when the same vote is sent twice", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);
      signIn(await createUser());
      const vote = () =>
        voteReview(
          jsonRequest(`${BASE}/${review.id}/vote`, "POST", { helpful: true }),
          ctx(review.id),
        );

      await vote();
      const response = await vote();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.action).toBe("removed");
      expect(data.vote).toBeNull();
      expect(data.helpfulCount).toBe(0);
      expect(await db.reviewVote.count()).toBe(0);
    });

    it("should not let an author vote on their own review", async () => {
      const { course } = await seedCourse();
      const author = await createUser();
      const review = await seedReview(course.id, { userId: author.id });
      signIn(author);

      const response = await voteReview(
        jsonRequest(`${BASE}/${review.id}/vote`, "POST", { helpful: true }),
        ctx(review.id),
      );

      expect(response.status).toBe(403);
      expect(await db.reviewVote.count()).toBe(0);
    });
  });

  describe("POST /api/reviews/[id]/replies", () => {
    it("should allow the course instructor to reply to reviews", async () => {
      const { course, instructor } = await seedCourse();
      const review = await seedReview(course.id);
      signIn(instructor);

      const replyData = {
        content:
          "Thank you for your feedback! We're glad you enjoyed the course.",
      };
      const response = await replyToReview(
        jsonRequest(`${BASE}/${review.id}/replies`, "POST", replyData),
        ctx(review.id),
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.reply).toMatchObject({
        content: replyData.content,
        user: { id: instructor.id },
      });
      const stored = await db.reviewReply.findUniqueOrThrow({
        where: { id: data.reply.id },
      });
      expect(stored).toMatchObject({
        reviewId: review.id,
        userId: instructor.id,
      });
    });

    it("should refuse a reply from somebody who does not teach the course", async () => {
      const { course } = await seedCourse();
      const review = await seedReview(course.id);
      signIn(await createUser({ role: Role.INSTRUCTOR }));

      const response = await replyToReview(
        jsonRequest(`${BASE}/${review.id}/replies`, "POST", {
          content: "I am not the instructor of this course.",
        }),
        ctx(review.id),
      );

      expect(response.status).toBe(403);
      expect(await db.reviewReply.count()).toBe(0);
    });

    it("should refuse a reply to a review that is not approved", async () => {
      const { course, instructor } = await seedCourse();
      const review = await seedReview(course.id, {
        status: ReviewStatus.PENDING,
      });
      signIn(instructor);

      const response = await replyToReview(
        jsonRequest(`${BASE}/${review.id}/replies`, "POST", {
          content: "Thanks, this is still under moderation.",
        }),
        ctx(review.id),
      );

      expect(response.status).toBe(403);
    });

    it("should validate reply content", async () => {
      const { course, instructor } = await seedCourse();
      const review = await seedReview(course.id);
      signIn(instructor);

      const response = await replyToReview(
        jsonRequest(`${BASE}/${review.id}/replies`, "POST", { content: "" }),
        ctx(review.id),
      );

      expect(response.status).toBe(400);
      expect(await db.reviewReply.count()).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("should answer 500 when the database fails while creating a review", async () => {
      const { course } = await seedCourse();
      signIn(await seedEligibleStudent(course.id));
      const spy = vi
        .spyOn(db.review, "create")
        .mockRejectedValueOnce(new Error("connection lost"));

      try {
        const response = await createReview(
          jsonRequest(BASE, "POST", {
            courseId: course.id,
            rating: 5,
            comment: "Excellent course! Highly recommended.",
          }),
        );

        expect(spy).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(500);
      } finally {
        spy.mockRestore();
      }
    });

    it("should serve an empty list (not an error) when the review search fails", async () => {
      // ReviewSearchService deliberately degrades to an empty result
      const { course } = await seedCourse();
      await seedReview(course.id);
      const spy = vi
        .spyOn(db.review, "count")
        .mockRejectedValueOnce(new Error("connection lost"));

      try {
        const response = await getReviews(
          new NextRequest(`${BASE}?courseId=${course.id}`),
        );
        const data = await response.json();

        expect(spy).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(data.reviews).toEqual([]);
        expect(data.pagination.totalCount).toBe(0);
      } finally {
        spy.mockRestore();
      }
    });

    it.each([
      ["POST /api/reviews", "create"],
      ["PUT /api/reviews/[id]", "update"],
      ["POST /api/reviews/[id]/vote", "vote"],
      ["POST /api/reviews/[id]/replies", "reply"],
    ])("should answer 400 to malformed JSON on %s", async (_label, kind) => {
      const { course, instructor } = await seedCourse();
      const author = await seedEligibleStudent(course.id);
      const review = await seedReview(course.id, { userId: author.id });
      const other = await createUser();
      const malformed = "invalid json{";

      let response: Response;
      if (kind === "create") {
        signIn(author);
        response = await createReview(jsonRequest(BASE, "POST", malformed));
      } else if (kind === "update") {
        signIn(author);
        response = await updateReview(
          jsonRequest(`${BASE}/${review.id}`, "PUT", malformed),
          ctx(review.id),
        );
      } else if (kind === "vote") {
        signIn(other);
        response = await voteReview(
          jsonRequest(`${BASE}/${review.id}/vote`, "POST", malformed),
          ctx(review.id),
        );
      } else {
        signIn(instructor);
        response = await replyToReview(
          jsonRequest(`${BASE}/${review.id}/replies`, "POST", malformed),
          ctx(review.id),
        );
      }

      expect(response.status).toBe(400);
    });

    it("should handle rate limiting", async () => {
      // 20 write requests per minute and client; the 21st is refused.
      // Anonymous requests are enough: the limiter runs before authentication.
      const responses = [];
      for (let i = 0; i < 21; i++) {
        responses.push(
          await createReview(
            jsonRequest(BASE, "POST", {
              courseId: "c".repeat(25),
              rating: 5,
              comment: "Rate limit test review",
            }),
          ),
        );
      }

      expect(responses.slice(0, 20).every((r) => r.status === 401)).toBe(true);
      expect(responses[20].status).toBe(429);
      expect(responses[20].headers.get("Retry-After")).not.toBeNull();
    });
  });
});
