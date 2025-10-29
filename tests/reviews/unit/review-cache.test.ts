/**
 * Unit tests for ReviewCacheService
 * Tests caching behavior, invalidation, and Redis interactions
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReviewCacheService } from "@/lib/services/review-cache";
import {
  mockDb,
  mockRedis,
  setupTestEnvironment,
} from "../fixtures/test-utils";
import {
  mockReviews,
  mockCourses,
  mockUsers,
} from "../fixtures/review-fixtures";

// Mock the database
vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

// Mock Redis
vi.mock("@/lib/redis", () => ({
  redis: mockRedis,
}));

// Mock the logger
vi.mock("@/lib/structured-logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

setupTestEnvironment();

describe("ReviewCacheService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getReview", () => {
    it("should return cached review if available", async () => {
      // Mock cached data
      const cachedReview = { ...mockReviews.approved };
      mockRedis.getJSON.mockResolvedValue(cachedReview);

      const result = await ReviewCacheService.getReview(
        mockReviews.approved.id
      );

      expect(result).toEqual(cachedReview);
      expect(mockRedis.getJSON).toHaveBeenCalledWith(
        expect.stringContaining(mockReviews.approved.id)
      );
      expect(mockDb.review.findUnique).not.toHaveBeenCalled();
    });

    it("should fetch from database and cache if not in cache", async () => {
      // Mock cache miss
      mockRedis.getJSON.mockResolvedValue(null);

      // Mock database response
      const dbReview = {
        ...mockReviews.approved,
        user: mockUsers.student,
        course: mockCourses.published,
        votes: [],
        replies: [],
        reports: [],
      };
      mockDb.review.findUnique.mockResolvedValue(dbReview);

      const result = await ReviewCacheService.getReview(
        mockReviews.approved.id
      );

      expect(result).toEqual(dbReview);
      expect(mockRedis.getJSON).toHaveBeenCalled();
      expect(mockDb.review.findUnique).toHaveBeenCalledWith({
        where: { id: mockReviews.approved.id },
        include: expect.any(Object),
      });
      expect(mockRedis.setJSON).toHaveBeenCalledWith(
        expect.any(String),
        dbReview,
        expect.any(Number)
      );
    });

    it("should handle Redis errors gracefully", async () => {
      // Mock Redis error
      mockRedis.getJSON.mockRejectedValue(new Error("Redis connection failed"));

      // Mock database response
      const dbReview = { ...mockReviews.approved };
      mockDb.review.findUnique.mockResolvedValue(dbReview);

      const result = await ReviewCacheService.getReview(
        mockReviews.approved.id
      );

      expect(result).toEqual(dbReview);
      expect(mockDb.review.findUnique).toHaveBeenCalled();
    });
  });

  describe("getCourseReviews", () => {
    it("should return cached course reviews if available", async () => {
      const cachedData = {
        reviews: [mockReviews.approved],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      };
      mockRedis.getJSON.mockResolvedValue(cachedData);

      const result = await ReviewCacheService.getCourseReviews(
        mockCourses.published.id,
        { page: 1, limit: 10 }
      );

      expect(result).toEqual(cachedData);
      expect(mockRedis.getJSON).toHaveBeenCalled();
      expect(mockDb.review.findMany).not.toHaveBeenCalled();
    });

    it("should fetch from database with filters and cache result", async () => {
      mockRedis.getJSON.mockResolvedValue(null);

      const dbReviews = [mockReviews.approved];
      mockDb.review.findMany.mockResolvedValue(dbReviews);
      mockDb.review.count.mockResolvedValue(1);

      const options = {
        page: 1,
        limit: 10,
        sortBy: "newest" as const,
        filterBy: { rating: 5, verified: true },
      };

      const result = await ReviewCacheService.getCourseReviews(
        mockCourses.published.id,
        options
      );

      expect(result.reviews).toEqual(dbReviews);
      expect(result.pagination.total).toBe(1);
      expect(mockDb.review.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          courseId: mockCourses.published.id,
          status: "APPROVED",
          rating: 5,
          verified: true,
        }),
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      });
      expect(mockRedis.setJSON).toHaveBeenCalled();
    });

    it("should handle different sort options", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findMany.mockResolvedValue([]);
      mockDb.review.count.mockResolvedValue(0);

      // Test rating_high sort
      await ReviewCacheService.getCourseReviews(mockCourses.published.id, {
        sortBy: "rating_high",
      });

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: "desc" },
        })
      );

      // Test helpful sort
      await ReviewCacheService.getCourseReviews(mockCourses.published.id, {
        sortBy: "helpful",
      });

      expect(mockDb.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { helpfulCount: "desc" },
        })
      );
    });
  });

  describe("getUserReviews", () => {
    it("should return cached user reviews", async () => {
      const cachedData = {
        reviews: [mockReviews.approved],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      };
      mockRedis.getJSON.mockResolvedValue(cachedData);

      const result = await ReviewCacheService.getUserReviews(
        mockUsers.student.id
      );

      expect(result).toEqual(cachedData);
      expect(mockRedis.getJSON).toHaveBeenCalled();
    });

    it("should fetch user reviews from database", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findMany.mockResolvedValue([mockReviews.approved]);
      mockDb.review.count.mockResolvedValue(1);

      const result = await ReviewCacheService.getUserReviews(
        mockUsers.student.id,
        { status: "APPROVED" }
      );

      expect(result.reviews).toEqual([mockReviews.approved]);
      expect(mockDb.review.findMany).toHaveBeenCalledWith({
        where: { userId: mockUsers.student.id, status: "APPROVED" },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      });
    });
  });

  describe("getReviewStats", () => {
    it("should return cached review statistics", async () => {
      const cachedStats = {
        totalReviews: 100,
        averageRating: 4.5,
        ratingDistribution: [],
      };
      mockRedis.getJSON.mockResolvedValue(cachedStats);

      const result = await ReviewCacheService.getReviewStats(
        mockCourses.published.id
      );

      expect(result).toEqual(cachedStats);
      expect(mockRedis.getJSON).toHaveBeenCalled();
    });

    it("should calculate and cache statistics from database", async () => {
      mockRedis.getJSON.mockResolvedValue(null);

      // Mock aggregation results
      mockDb.review.count.mockResolvedValue(50);
      mockDb.review.aggregate.mockResolvedValue({ _avg: { rating: 4.2 } });
      mockDb.review.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 25 } },
        { rating: 4, _count: { rating: 15 } },
        { rating: 3, _count: { rating: 7 } },
        { rating: 2, _count: { rating: 2 } },
        { rating: 1, _count: { rating: 1 } },
      ]);

      const result = await ReviewCacheService.getReviewStats(
        mockCourses.published.id
      );

      expect(result).toMatchObject({
        totalReviews: 50,
        averageRating: 4.2,
        ratingDistribution: expect.arrayContaining([
          expect.objectContaining({ rating: 5, count: 25, percentage: 50 }),
          expect.objectContaining({ rating: 4, count: 15, percentage: 30 }),
        ]),
      });
      expect(mockRedis.setJSON).toHaveBeenCalled();
    });
  });

  describe("searchReviews", () => {
    it("should return cached search results", async () => {
      const cachedResults = {
        reviews: [mockReviews.approved],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
        query: "excellent",
      };
      mockRedis.getJSON.mockResolvedValue(cachedResults);

      const result = await ReviewCacheService.searchReviews("excellent");

      expect(result).toEqual(cachedResults);
    });

    it("should perform database search and cache results", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findMany.mockResolvedValue([mockReviews.approved]);
      mockDb.review.count.mockResolvedValue(1);

      const filters = {
        courseIds: [mockCourses.published.id],
        ratings: [4, 5],
        verified: true,
      };

      const result = await ReviewCacheService.searchReviews(
        "excellent",
        filters
      );

      expect(result.reviews).toEqual([mockReviews.approved]);
      expect(mockDb.review.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: "APPROVED",
          comment: { search: "excellent" },
          courseId: { in: [mockCourses.published.id] },
          rating: { in: [4, 5] },
          verified: true,
        }),
        include: expect.any(Object),
        orderBy: expect.any(Array),
        skip: 0,
        take: 10,
      });
    });
  });

  describe("getPopularReviews", () => {
    it("should return cached popular reviews", async () => {
      const cachedReviews = [mockReviews.approved];
      mockRedis.getJSON.mockResolvedValue(cachedReviews);

      const result = await ReviewCacheService.getPopularReviews();

      expect(result).toEqual(cachedReviews);
    });

    it("should fetch popular reviews from database", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findMany.mockResolvedValue([mockReviews.approved]);

      const result = await ReviewCacheService.getPopularReviews(20);

      expect(result).toEqual([mockReviews.approved]);
      expect(mockDb.review.findMany).toHaveBeenCalledWith({
        where: { status: "APPROVED" },
        include: expect.any(Object),
        orderBy: [
          { helpfulCount: "desc" },
          { rating: "desc" },
          { createdAt: "desc" },
        ],
        take: 20,
      });
    });
  });

  describe("getRecentReviews", () => {
    it("should return cached recent reviews", async () => {
      const cachedReviews = [mockReviews.approved];
      mockRedis.getJSON.mockResolvedValue(cachedReviews);

      const result = await ReviewCacheService.getRecentReviews();

      expect(result).toEqual(cachedReviews);
    });

    it("should fetch recent reviews from database", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findMany.mockResolvedValue([mockReviews.approved]);

      const result = await ReviewCacheService.getRecentReviews(15);

      expect(result).toEqual([mockReviews.approved]);
      expect(mockDb.review.findMany).toHaveBeenCalledWith({
        where: { status: "APPROVED" },
        include: expect.any(Object),
        orderBy: { createdAt: "desc" },
        take: 15,
      });
    });
  });

  describe("Cache invalidation", () => {
    it("should invalidate review cache", async () => {
      await ReviewCacheService.invalidateReviewCache(mockReviews.approved.id);

      expect(mockRedis.delete).toHaveBeenCalledWith(
        expect.stringContaining(mockReviews.approved.id)
      );
    });

    it("should invalidate course cache", async () => {
      await ReviewCacheService.invalidateCourseCache(mockCourses.published.id);

      expect(mockRedis.deletePattern).toHaveBeenCalledWith(
        expect.stringContaining(mockCourses.published.id)
      );
    });

    it("should warm up course cache", async () => {
      mockDb.review.findMany.mockResolvedValue([mockReviews.approved]);
      mockDb.review.count.mockResolvedValue(1);

      await ReviewCacheService.warmUpCourseCache(mockCourses.published.id);

      expect(mockDb.review.findMany).toHaveBeenCalled();
      expect(mockRedis.setJSON).toHaveBeenCalled();
    });
  });

  describe("getCacheStats", () => {
    it("should return cache statistics", async () => {
      mockRedis.info.mockResolvedValue(
        "used_memory:1024000\r\nconnected_clients:5"
      );
      mockRedis.keys.mockResolvedValue([
        "reviews:review_123",
        "reviews:course_reviews_456",
        "reviews:stats_789",
      ]);

      const stats = await ReviewCacheService.getCacheStats();

      expect(stats).toMatchObject({
        totalKeys: 3,
        memoryUsage: "1024000",
        connectedClients: "5",
        keysByType: expect.objectContaining({
          review: 1,
          course_reviews: 1,
          stats: 1,
        }),
        lastUpdated: expect.any(String),
      });
    });

    it("should handle Redis errors in cache stats", async () => {
      mockRedis.info.mockRejectedValue(new Error("Redis error"));

      await expect(ReviewCacheService.getCacheStats()).rejects.toThrow(
        "Redis error"
      );
    });
  });

  describe("clearAllCache", () => {
    it("should clear all review-related cache", async () => {
      // The actual implementation uses Object.values(CACHE_KEYS) and redis.keys/multi/del
      // Let's mock this properly
      mockRedis.keys
        .mockResolvedValueOnce(["reviews:review_123"]) // First pattern
        .mockResolvedValueOnce(["reviews:course_456"]); // Second pattern

      const mockPipeline = {
        del: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      };
      mockRedis.multi = vi.fn().mockReturnValue(mockPipeline);

      const result = await ReviewCacheService.clearAllCache();

      expect(result).toBe(2); // Total keys cleared
      expect(mockRedis.keys).toHaveBeenCalledTimes(2); // Called for each pattern
      expect(mockPipeline.del).toHaveBeenCalledTimes(2);
      expect(mockPipeline.exec).toHaveBeenCalledTimes(2);
    });

    it("should handle errors during cache clearing", async () => {
      mockRedis.keys.mockRejectedValue(new Error("Failed to get keys"));

      await expect(ReviewCacheService.clearAllCache()).rejects.toThrow(
        "Failed to get keys"
      );
    });
  });

  describe("Error handling", () => {
    it("should fall back to database when cache fails", async () => {
      mockRedis.getJSON.mockRejectedValue(new Error("Cache error"));
      mockDb.review.findUnique.mockResolvedValue(mockReviews.approved);

      const result = await ReviewCacheService.getReview(
        mockReviews.approved.id
      );

      expect(result).toEqual(mockReviews.approved);
      expect(mockDb.review.findUnique).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findUnique.mockRejectedValue(new Error("Database error"));

      await expect(
        ReviewCacheService.getReview(mockReviews.approved.id)
      ).rejects.toThrow("Database error");
    });

    it("should not cache failed database responses", async () => {
      mockRedis.getJSON.mockResolvedValue(null);
      mockDb.review.findUnique.mockRejectedValue(new Error("DB error"));

      await expect(
        ReviewCacheService.getReview(mockReviews.approved.id)
      ).rejects.toThrow("DB error");

      expect(mockRedis.setJSON).not.toHaveBeenCalled();
    });
  });
});
