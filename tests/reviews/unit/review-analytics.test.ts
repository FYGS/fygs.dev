/**
 * Unit tests for ReviewAnalyticsService
 * Tests analytics calculations, caching behavior, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock external dependencies first
vi.mock("@/lib/db", () => ({
  db: {
    review: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
    course: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock the logger
vi.mock("@/lib/structured-logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Now import the service and utilities
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { setupTestEnvironment } from "../fixtures/test-utils";
import { mockCourses } from "../fixtures/review-fixtures";

setupTestEnvironment();

describe("ReviewAnalyticsService", () => {
  let mockDb: any;

  beforeEach(async () => {
    // Get the mocked database instance
    const { db } = await import("@/lib/db");
    mockDb = db;

    // Mocked implementations survive vi.clearAllMocks(): reset them so a
    // rejection set up by one test cannot leak into the next
    for (const model of [mockDb.review, mockDb.course]) {
      for (const fn of Object.values(model)) (fn as any).mockReset();
    }
    // The service caches in a static map: start every test with an empty one
    ReviewAnalyticsService.clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getCourseReviewStats", () => {
    it("should return comprehensive course review statistics", async () => {
      // Mock database responses for the private methods
      mockDb.review.count
        .mockResolvedValueOnce(25) // Total reviews
        .mockResolvedValueOnce(18) // Verified reviews
        .mockResolvedValueOnce(5); // Recent reviews

      mockDb.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
      });

      mockDb.review.groupBy.mockResolvedValue([
        { rating: 1, _count: { rating: 1 } },
        { rating: 2, _count: { rating: 2 } },
        { rating: 3, _count: { rating: 3 } },
        { rating: 4, _count: { rating: 8 } },
        { rating: 5, _count: { rating: 11 } },
      ]);

      const stats = await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      expect(stats).toEqual({
        totalReviews: 25,
        averageRating: 4.2,
        // the distribution is a rating -> count map
        ratingDistribution: { 1: 1, 2: 2, 3: 3, 4: 8, 5: 11 },
        verifiedReviews: 18,
        recentReviews: 5,
        verificationRate: 72,
        lastUpdated: expect.any(String),
      });

      // Verify database calls were made
      expect(mockDb.review.count).toHaveBeenCalledTimes(3);
      expect(mockDb.review.aggregate).toHaveBeenCalledTimes(1);
      expect(mockDb.review.groupBy).toHaveBeenCalledTimes(1);
    });

    it("should only count approved reviews of the requested course", async () => {
      mockDb.review.count.mockResolvedValue(1);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 5 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await ReviewAnalyticsService.getCourseReviewStats("course_x");

      for (const [args] of mockDb.review.count.mock.calls) {
        expect(args.where).toMatchObject({
          courseId: "course_x",
          status: "APPROVED",
        });
      }
    });

    it("should handle zero reviews gracefully", async () => {
      // Mock empty database responses
      mockDb.review.count.mockResolvedValue(0);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockDb.review.groupBy.mockResolvedValue([]);

      const stats = await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      expect(stats.totalReviews).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.verificationRate).toBe(0);
      // all five star levels are present, with a zero count
      expect(Object.keys(stats.ratingDistribution)).toHaveLength(5);
      expect(
        Object.values<number>(stats.ratingDistribution).every((n) => n === 0)
      ).toBe(true);
    });

    it("should cache results for subsequent calls", async () => {
      // Mock database responses
      mockDb.review.count.mockResolvedValue(10);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      // First call
      await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      // Second call should use cache
      const stats = await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      // The database is only hit by the first call (3 counts per computation)
      expect(mockDb.review.count).toHaveBeenCalledTimes(3);
      expect(stats.totalReviews).toBe(10);
    });

    it("should keep separate cache entries per course", async () => {
      mockDb.review.count.mockResolvedValue(10);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await ReviewAnalyticsService.getCourseReviewStats("course_a");
      await ReviewAnalyticsService.getCourseReviewStats("course_b");

      expect(mockDb.review.count).toHaveBeenCalledTimes(6);
      expect(ReviewAnalyticsService.getCacheStats().keys).toEqual([
        "course-review-stats-course_a",
        "course-review-stats-course_b",
      ]);
    });

    it("should recompute after the course cache is invalidated", async () => {
      mockDb.review.count.mockResolvedValue(10);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await ReviewAnalyticsService.getCourseReviewStats("course_a");
      ReviewAnalyticsService.invalidateCourseCache("course_a");
      await ReviewAnalyticsService.getCourseReviewStats("course_a");

      expect(mockDb.review.count).toHaveBeenCalledTimes(6);
    });

    it("should propagate database errors and not cache them", async () => {
      mockDb.review.count.mockRejectedValue(
        new Error("Database connection failed")
      );
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await expect(
        ReviewAnalyticsService.getCourseReviewStats(mockCourses.published.id)
      ).rejects.toThrow("Database connection failed");

      expect(ReviewAnalyticsService.getCacheStats().size).toBe(0);
    });
  });

  describe("getGlobalReviewStats", () => {
    it("should return platform-wide statistics", async () => {
      mockDb.review.count.mockResolvedValue(1000);
      // distinct courses that have approved reviews
      mockDb.review.groupBy.mockResolvedValue([
        { courseId: "course1" },
        { courseId: "course2" },
      ]);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.3 } });

      // Only courses with at least 5 approved reviews are ranked
      const ratings = (...r: number[]) => r.map((rating) => ({ rating }));
      mockDb.course.findMany.mockResolvedValue([
        {
          id: "course1",
          title: "Course 1",
          slug: "course-1",
          thumbnail: null,
          reviews: ratings(5, 5, 4, 4, 5),
          _count: { reviews: 5 },
        },
        {
          id: "course2",
          title: "Course 2",
          slug: "course-2",
          thumbnail: null,
          reviews: ratings(3, 3, 3),
          _count: { reviews: 3 },
        },
        {
          id: "course3",
          title: "Course 3",
          slug: "course-3",
          thumbnail: null,
          reviews: ratings(2, 3, 3, 3, 2),
          _count: { reviews: 5 },
        },
      ]);

      mockDb.review.findMany.mockResolvedValue([
        { createdAt: new Date("2024-01-10T00:00:00Z"), rating: 4 },
        { createdAt: new Date("2024-01-20T00:00:00Z"), rating: 5 },
        { createdAt: new Date("2024-02-03T00:00:00Z"), rating: 3 },
      ]);

      const stats = await ReviewAnalyticsService.getGlobalReviewStats();

      expect(stats).toMatchObject({
        totalReviews: 1000,
        totalCourses: 2,
        averageRating: 4.3,
        reviewsByMonth: {
          "2024-01": { count: 2, averageRating: 4.5 },
          "2024-02": { count: 1, averageRating: 3 },
        },
        lastUpdated: expect.any(String),
      });
      // ranked by average rating, below-threshold course excluded
      expect(stats.topRatedCourses.map((c: any) => c.id)).toEqual([
        "course1",
        "course3",
      ]);
      expect(stats.topRatedCourses[0]).toMatchObject({
        averageRating: 4.6,
        reviewCount: 5,
      });
    });

    it("should handle empty platform gracefully", async () => {
      mockDb.review.count.mockResolvedValue(0);
      mockDb.review.groupBy.mockResolvedValue([]);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockDb.course.findMany.mockResolvedValue([]);
      mockDb.review.findMany.mockResolvedValue([]);

      const stats = await ReviewAnalyticsService.getGlobalReviewStats();

      expect(stats.totalReviews).toBe(0);
      expect(stats.totalCourses).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.topRatedCourses).toEqual([]);
      expect(stats.reviewsByMonth).toEqual({});
    });
  });

  describe("getReviewSentiment", () => {
    it("should analyze review sentiment for a course", async () => {
      // 4-5 stars are positive, 3 neutral, 1-2 negative
      mockDb.review.findMany.mockResolvedValue([
        {
          comment: "This is an excellent course! I learned so much.",
          rating: 5,
        },
        { comment: "The course was okay but could be improved.", rating: 3 },
        { comment: "Terrible course, waste of time.", rating: 1 },
      ]);

      const sentiment = await ReviewAnalyticsService.getReviewSentiment(
        mockCourses.published.id
      );

      expect(sentiment).toEqual({
        positive: 33,
        neutral: 33,
        negative: 33,
        totalAnalyzed: 3,
      });
    });

    it("should only analyze approved reviews that have a comment", async () => {
      mockDb.review.findMany.mockResolvedValue([]);

      await ReviewAnalyticsService.getReviewSentiment(
        mockCourses.published.id
      );

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            courseId: mockCourses.published.id,
            status: "APPROVED",
            comment: { not: null },
          },
        })
      );
    });

    it("should handle courses with no reviews", async () => {
      mockDb.review.findMany.mockResolvedValue([]);

      const sentiment = await ReviewAnalyticsService.getReviewSentiment(
        mockCourses.published.id
      );

      expect(sentiment).toEqual({
        positive: 0,
        neutral: 0,
        negative: 0,
        totalAnalyzed: 0,
      });
    });
  });

  describe("cache behavior", () => {
    it("should respect cache TTL", async () => {
      // Mock current time
      const mockDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(mockDate);

      mockDb.review.count.mockResolvedValue(10);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      // First call
      await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      // Move time forward but within the 1 hour TTL (30 minutes)
      vi.setSystemTime(new Date(mockDate.getTime() + 30 * 60 * 1000));

      // Second call should use cache
      await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      expect(mockDb.review.count).toHaveBeenCalledTimes(3); // Only computed once

      // Move time forward beyond TTL (90 minutes)
      vi.setSystemTime(new Date(mockDate.getTime() + 90 * 60 * 1000));

      // Third call should hit database again
      await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      expect(mockDb.review.count).toHaveBeenCalledTimes(6); // Computed again
    });
  });

  describe("error handling", () => {
    it("should handle invalid course IDs", async () => {
      mockDb.review.count.mockRejectedValue(new Error("Invalid course ID"));
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await expect(
        ReviewAnalyticsService.getCourseReviewStats("invalid-course-id")
      ).rejects.toThrow("Invalid course ID");
    });

    it("should propagate database timeouts", async () => {
      mockDb.review.count.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Database timeout")), 100)
          )
      );
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await expect(
        ReviewAnalyticsService.getCourseReviewStats(mockCourses.published.id)
      ).rejects.toThrow("Database timeout");
    });

    it("should fail as a whole when one of the queries fails (no partial stats)", async () => {
      // Some calls succeed, others fail
      mockDb.review.count
        .mockResolvedValueOnce(10) // Total reviews - success
        .mockRejectedValueOnce(new Error("Failed")) // Verified reviews - fail
        .mockResolvedValueOnce(5); // Recent reviews - success

      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.0 } });
      mockDb.review.groupBy.mockResolvedValue([]);

      await expect(
        ReviewAnalyticsService.getCourseReviewStats(mockCourses.published.id)
      ).rejects.toThrow("Failed");

      // a failed computation must not leave a half-filled cache entry
      expect(ReviewAnalyticsService.getCacheStats().size).toBe(0);
    });
  });
});
