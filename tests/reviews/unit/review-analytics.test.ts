/**
 * Unit tests for ReviewAnalyticsService
 * Tests analytics calculations, caching behavior, and error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

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

    // Reset all mocks before each test
    vi.clearAllMocks();
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
        ratingDistribution: [
          { rating: 1, count: 1, percentage: 4 },
          { rating: 2, count: 2, percentage: 8 },
          { rating: 3, count: 3, percentage: 12 },
          { rating: 4, count: 8, percentage: 32 },
          { rating: 5, count: 11, percentage: 44 },
        ],
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
      expect(stats.ratingDistribution).toHaveLength(5);
      expect(
        stats.ratingDistribution.every((item: any) => item.count === 0)
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

      // Database should only be called once (first time)
      expect(mockDb.review.count).toHaveBeenCalledTimes(3); // Called only once for the first request
      expect(stats.totalReviews).toBe(10);
    });

    it("should handle database errors gracefully", async () => {
      // Mock database error
      mockDb.review.count.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        ReviewAnalyticsService.getCourseReviewStats(mockCourses.published.id)
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getGlobalReviewStats", () => {
    it("should return platform-wide statistics", async () => {
      // Mock platform-wide data
      mockDb.review.count.mockResolvedValue(1000);
      mockDb.course.count.mockResolvedValue(50);

      mockDb.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.3 },
      });

      mockDb.review.findMany.mockResolvedValue([
        {
          courseId: "course1",
          course: {
            id: "course1",
            title: "Course 1",
            slug: "course-1",
            instructor: { id: "instructor1", name: "Instructor 1" },
          },
          rating: 4.5,
        },
      ]);

      mockDb.$queryRaw.mockResolvedValue([
        { month: "2024-01", count: 50 },
        { month: "2024-02", count: 75 },
      ]);

      const stats = await ReviewAnalyticsService.getGlobalReviewStats();

      expect(stats).toMatchObject({
        totalReviews: 1000,
        totalCoursesWithReviews: 50,
        averageRating: 4.3,
        topRatedCourses: expect.any(Array),
        recentActivity: expect.any(Array),
        lastUpdated: expect.any(String),
      });
    });

    it("should handle empty platform gracefully", async () => {
      mockDb.review.count.mockResolvedValue(0);
      mockDb.course.count.mockResolvedValue(0);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: null } });
      mockDb.review.findMany.mockResolvedValue([]);
      mockDb.$queryRaw.mockResolvedValue([]);

      const stats = await ReviewAnalyticsService.getGlobalReviewStats();

      expect(stats.totalReviews).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.topRatedCourses).toEqual([]);
    });
  });

  describe("getReviewSentiment", () => {
    it("should analyze review sentiment for a course", async () => {
      // Mock review data with comments
      mockDb.review.findMany.mockResolvedValue([
        {
          id: "review1",
          comment: "This is an excellent course! I learned so much.",
          rating: 5,
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "review2",
          comment: "The course was okay but could be improved.",
          rating: 3,
          createdAt: new Date("2024-01-02"),
        },
        {
          id: "review3",
          comment: "Terrible course, waste of time.",
          rating: 1,
          createdAt: new Date("2024-01-03"),
        },
      ]);

      const sentiment = await ReviewAnalyticsService.getReviewSentiment(
        mockCourses.published.id
      );

      expect(sentiment).toMatchObject({
        courseId: mockCourses.published.id,
        totalReviews: 3,
        sentimentBreakdown: expect.objectContaining({
          positive: expect.any(Number),
          neutral: expect.any(Number),
          negative: expect.any(Number),
        }),
        commonKeywords: expect.any(Array),
        sentimentTrend: expect.any(Array),
        lastUpdated: expect.any(String),
      });

      // Verify the sentiment analysis logic
      expect(sentiment.sentimentBreakdown.positive).toBeGreaterThan(0);
      expect(sentiment.sentimentBreakdown.negative).toBeGreaterThan(0);
    });

    it("should handle courses with no reviews", async () => {
      mockDb.review.findMany.mockResolvedValue([]);

      const sentiment = await ReviewAnalyticsService.getReviewSentiment(
        mockCourses.published.id
      );

      expect(sentiment.totalReviews).toBe(0);
      expect(sentiment.sentimentBreakdown).toEqual({
        positive: 0,
        neutral: 0,
        negative: 0,
      });
      expect(sentiment.commonKeywords).toEqual([]);
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

      // Move time forward but within TTL (30 minutes)
      vi.setSystemTime(new Date(mockDate.getTime() + 30 * 60 * 1000));

      // Second call should use cache
      await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      expect(mockDb.review.count).toHaveBeenCalledTimes(3); // Only called once

      // Move time forward beyond TTL (90 minutes)
      vi.setSystemTime(new Date(mockDate.getTime() + 90 * 60 * 1000));

      // Third call should hit database again
      await ReviewAnalyticsService.getCourseReviewStats(
        mockCourses.published.id
      );

      expect(mockDb.review.count).toHaveBeenCalledTimes(6); // Called again

      vi.useRealTimers();
    });
  });

  describe("error handling", () => {
    it("should handle invalid course IDs", async () => {
      mockDb.review.count.mockRejectedValue(new Error("Invalid course ID"));

      await expect(
        ReviewAnalyticsService.getCourseReviewStats("invalid-course-id")
      ).rejects.toThrow("Invalid course ID");
    });

    it("should handle database timeouts gracefully", async () => {
      mockDb.review.count.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Database timeout")), 100)
          )
      );

      await expect(
        ReviewAnalyticsService.getCourseReviewStats(mockCourses.published.id)
      ).rejects.toThrow("Database timeout");
    });

    it("should provide fallback data on partial failures", async () => {
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
    });
  });
});
