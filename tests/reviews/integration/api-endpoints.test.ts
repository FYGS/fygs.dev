/**
 * Integration tests for Review API endpoints
 * Tests full request/response cycles with database interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  setupIntegrationTest,
  teardownIntegrationTest,
  DatabaseTestUtils,
} from "../fixtures/test-utils";
import {
  mockUsers,
  mockCourses,
  mockReviews,
} from "../fixtures/review-fixtures";

// Import API handlers
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

// Mock authentication
vi.mock("@/lib/auth", () => ({
  getUser: vi.fn(),
  requireAuth: vi.fn(),
}));

describe("Review API Integration Tests", () => {
  beforeEach(async () => {
    await setupIntegrationTest();
  });

  afterEach(async () => {
    await teardownIntegrationTest();
  });

  describe("GET /api/reviews", () => {
    it("should return paginated reviews", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?page=1&limit=5"
      );

      const response = await getReviews(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("reviews");
      expect(data).toHaveProperty("pagination");
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(5);
      expect(Array.isArray(data.reviews)).toBe(true);
    });

    it("should filter reviews by course", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/reviews?courseId=${mockCourses.published.id}`
      );

      const response = await getReviews(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.reviews.forEach((review: any) => {
        expect(review.courseId).toBe(mockCourses.published.id);
      });
    });

    it("should filter reviews by rating", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?rating=5"
      );

      const response = await getReviews(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.reviews.forEach((review: any) => {
        expect(review.rating).toBe(5);
      });
    });

    it("should sort reviews by different criteria", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?sortBy=rating_high"
      );

      const response = await getReviews(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify sorting (highest rating first)
      for (let i = 0; i < data.reviews.length - 1; i++) {
        expect(data.reviews[i].rating).toBeGreaterThanOrEqual(
          data.reviews[i + 1].rating
        );
      }
    });

    it("should handle search queries", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?search=excellent"
      );

      const response = await getReviews(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Search results should contain the term in comments
      data.reviews.forEach((review: any) => {
        expect(review.comment.toLowerCase()).toContain("excellent");
      });
    });
  });

  describe("POST /api/reviews", () => {
    it("should create a new review when authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const reviewData = {
        courseId: mockCourses.published.id,
        rating: 5,
        comment: "Excellent course! Highly recommended.",
      };

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
        headers: { "content-type": "application/json" },
      });

      const response = await createReview(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.review).toMatchObject({
        courseId: reviewData.courseId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        userId: mockUsers.student.id,
        status: "APPROVED",
      });
      expect(data.review).toHaveProperty("id");
      expect(data.review).toHaveProperty("createdAt");
    });

    it("should reject review without authentication", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockRejectedValue(new Error("Unauthorized"));

      const reviewData = {
        courseId: mockCourses.published.id,
        rating: 5,
        comment: "Great course!",
      };

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
      });

      const response = await createReview(request);

      expect(response.status).toBe(401);
    });

    it("should validate review data", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const invalidData = {
        courseId: "", // Invalid
        rating: 6, // Out of range
        comment: "", // Too short
      };

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(invalidData),
      });

      const response = await createReview(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("errors");
    });

    it("should prevent duplicate reviews for same course", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const reviewData = {
        courseId: mockCourses.published.id,
        rating: 4,
        comment: "Good course content.",
      };

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
      });

      // First review should succeed
      const response1 = await createReview(request);
      expect(response1.status).toBe(201);

      // Second review for same course should fail
      const response2 = await createReview(request);
      expect(response2.status).toBe(409); // Conflict
    });
  });

  describe("GET /api/reviews/[id]", () => {
    it("should return a specific review", async () => {
      const response = await getReview(
        new NextRequest(
          `http://localhost:3000/api/reviews/${mockReviews.approved.id}`
        ),
        { params: { id: mockReviews.approved.id } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.review.id).toBe(mockReviews.approved.id);
      expect(data.review).toHaveProperty("user");
      expect(data.review).toHaveProperty("course");
      expect(data.review).toHaveProperty("votes");
      expect(data.review).toHaveProperty("replies");
    });

    it("should return 404 for non-existent review", async () => {
      const response = await getReview(
        new NextRequest("http://localhost:3000/api/reviews/non-existent"),
        { params: { id: "non-existent" } }
      );

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/reviews/[id]", () => {
    it("should update own review when authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const updateData = {
        rating: 4,
        comment: "Updated review comment after more experience.",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await updateReview(request, {
        params: { id: mockReviews.approved.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.review.rating).toBe(updateData.rating);
      expect(data.review.comment).toBe(updateData.comment);
      expect(data.review.updatedAt).not.toBe(data.review.createdAt);
    });

    it("should reject update of other user's review", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.instructor); // Different user

      const updateData = {
        rating: 3,
        comment: "Trying to update someone else's review",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const response = await updateReview(request, {
        params: { id: mockReviews.approved.id },
      });

      expect(response.status).toBe(403); // Forbidden
    });
  });

  describe("DELETE /api/reviews/[id]", () => {
    it("should delete own review when authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}`,
        { method: "DELETE" }
      );

      const response = await deleteReview(request, {
        params: { id: mockReviews.approved.id },
      });

      expect(response.status).toBe(200);

      // Verify review is deleted
      const getResponse = await getReview(
        new NextRequest(
          `http://localhost:3000/api/reviews/${mockReviews.approved.id}`
        ),
        { params: { id: mockReviews.approved.id } }
      );
      expect(getResponse.status).toBe(404);
    });

    it("should allow admin to delete any review", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.admin);

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}`,
        { method: "DELETE" }
      );

      const response = await deleteReview(request, {
        params: { id: mockReviews.approved.id },
      });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/reviews/[id]/vote", () => {
    it("should allow voting on reviews", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.instructor);

      const voteData = { helpful: true };

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}/vote`,
        {
          method: "POST",
          body: JSON.stringify(voteData),
        }
      );

      const response = await voteReview(request, {
        params: { id: mockReviews.approved.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.vote).toMatchObject({
        reviewId: mockReviews.approved.id,
        userId: mockUsers.instructor.id,
        helpful: true,
      });
    });

    it("should update existing vote", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.instructor);

      // First vote
      const voteData1 = { helpful: true };
      const request1 = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}/vote`,
        {
          method: "POST",
          body: JSON.stringify(voteData1),
        }
      );

      await voteReview(request1, { params: { id: mockReviews.approved.id } });

      // Update vote
      const voteData2 = { helpful: false };
      const request2 = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}/vote`,
        {
          method: "POST",
          body: JSON.stringify(voteData2),
        }
      );

      const response = await voteReview(request2, {
        params: { id: mockReviews.approved.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.vote.helpful).toBe(false);
    });
  });

  describe("POST /api/reviews/[id]/reply", () => {
    it("should allow replying to reviews", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.instructor);

      const replyData = {
        content:
          "Thank you for your feedback! We're glad you enjoyed the course.",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}/reply`,
        {
          method: "POST",
          body: JSON.stringify(replyData),
        }
      );

      const response = await replyToReview(request, {
        params: { id: mockReviews.approved.id },
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.reply).toMatchObject({
        reviewId: mockReviews.approved.id,
        userId: mockUsers.instructor.id,
        content: replyData.content,
      });
    });

    it("should validate reply content", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.instructor);

      const invalidReply = { content: "" }; // Empty content

      const request = new NextRequest(
        `http://localhost:3000/api/reviews/${mockReviews.approved.id}/reply`,
        {
          method: "POST",
          body: JSON.stringify(invalidReply),
        }
      );

      const response = await replyToReview(request, {
        params: { id: mockReviews.approved.id },
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Error handling", () => {
    it("should handle database connection errors", async () => {
      // Simulate database error by closing connection
      await DatabaseTestUtils.teardown();

      const request = new NextRequest("http://localhost:3000/api/reviews");
      const response = await getReviews(request);

      expect(response.status).toBe(500);
    });

    it("should handle malformed JSON requests", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: "invalid json{",
        headers: { "content-type": "application/json" },
      });

      const response = await createReview(request);
      expect(response.status).toBe(400);
    });

    it("should handle rate limiting", async () => {
      const { requireAuth } = await import("@/lib/auth");
      (requireAuth as any).mockResolvedValue(mockUsers.student);

      const reviewData = {
        courseId: mockCourses.published.id,
        rating: 5,
        comment: "Rate limit test",
      };

      // Make multiple rapid requests
      const requests = Array.from({ length: 10 }, () =>
        createReview(
          new NextRequest("http://localhost:3000/api/reviews", {
            method: "POST",
            body: JSON.stringify(reviewData),
          })
        )
      );

      const responses = await Promise.all(requests);

      // At least some should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
