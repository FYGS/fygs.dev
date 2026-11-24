/**
 * Performance tests for Review System
 * Tests system performance under load and stress conditions, against the real
 * database. The Redis layer is replaced by an in-memory fake (no Redis server
 * in the test environment). Caching is asserted by counting the database
 * queries a cached call avoids, which is deterministic, plus generous absolute
 * time budgets.
 */

import { describe, it, expect, beforeEach, vi, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { PerformanceTestUtils } from "../fixtures/test-utils";
import { FakeRedis } from "../fixtures/fake-redis";
import { createCourse } from "../../support/factories";
import { resetDatabase } from "../../support/test-db";
import { ReviewCacheService } from "@/lib/services/review-cache";
import { ReviewDatabaseOptimizer } from "@/lib/services/review-database-optimizer";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";
import { GET as getReviews } from "@/app/api/reviews/route";

const fakeRedis = vi.hoisted(() => ({ instance: null as unknown }));

vi.mock("@/lib/redis", async () => {
  const { FakeRedis } = await import("../fixtures/fake-redis");
  fakeRedis.instance = new FakeRedis();
  return {
    RedisClient: { getInstance: () => fakeRedis.instance },
    // used by the rate limiter: unavailable -> it falls back to memory
    default: new Proxy(
      {},
      {
        get() {
          throw new Error("redis unavailable in tests");
        },
      }
    ),
  };
});

// The GET route imports the auth module, which needs a full auth environment
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn(async () => null) } },
}));

const redis = () => fakeRedis.instance as FakeRedis;

/** Creates `count` users in one statement and returns their ids. */
async function seedUsers(count: number) {
  const prefix = `perf-${Math.random().toString(36).slice(2, 8)}`;
  await db.user.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      id: `${prefix}-${i}`,
      name: `Perf user ${i}`,
      email: `${prefix}-${i}@example.test`,
      emailVerified: true,
    })),
  });
  return Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
}

/** One approved review per new user on `courseId`. */
async function seedReviews(
  courseId: string,
  count: number,
  build: (index: number) => { rating: number; comment: string } = (i) => ({
    rating: (i % 5) + 1,
    comment: `Performance test review #${i}`,
  })
) {
  const userIds = await seedUsers(count);
  const reviews = userIds.map((userId, i) => ({
    userId,
    courseId,
    ...build(i),
  }));
  return ReviewDatabaseOptimizer.bulkCreateReviews(reviews);
}

// leave an empty database for the suites that run next
afterAll(async () => {
  await resetDatabase(db);
});

describe("Review System Performance Tests", () => {
  beforeEach(async () => {
    await resetDatabase(db);
    redis().clear();
    ReviewAnalyticsService.clearCache();
    __resetRateLimitMemory();
  });

  describe("Database Performance", () => {
    it("should handle bulk review creation efficiently", async () => {
      const course = await createCourse();
      const userIds = await seedUsers(100);
      const data = userIds.map((userId, i) => ({
        userId,
        courseId: course.id,
        rating: (i % 5) + 1,
        comment: `Bulk operation test review #${i}`,
      }));

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.bulkCreateReviews(data);
        });

      expect(result.count).toBe(data.length);
      expect(await db.review.count()).toBe(data.length);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Calculate reviews per second
      const reviewsPerSecond = result.count / (duration / 1000);
      expect(reviewsPerSecond).toBeGreaterThan(10); // At least 10 reviews/second
    });

    it("should compute course statistics from the right rows", async () => {
      const course = await createCourse();
      const other = await createCourse();
      const ratings = [5, 5, 5, 1];
      await seedReviews(course.id, ratings.length, (i) => ({
        rating: ratings[i],
        comment: `Review ${i}`,
      }));
      await seedReviews(other.id, 3, () => ({ rating: 2, comment: "Other" }));

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.getOptimizedCourseStats(course.id);
        });

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.totalReviews).toBe(4);
      // weighted mean: (5 + 5 + 5 + 1) / 4, not the mean of the star levels
      expect(result.averageRating).toBe(4);
      expect(result.ratingDistribution).toEqual([
        { rating: 1, count: 1, percentage: 25 },
        { rating: 2, count: 0, percentage: 0 },
        { rating: 3, count: 0, percentage: 0 },
        { rating: 4, count: 0, percentage: 0 },
        { rating: 5, count: 3, percentage: 75 },
      ]);
      expect(result.queryDuration).toBeLessThan(500); // DB query under 500ms
    });

    it("should report zero statistics for a course without reviews", async () => {
      const course = await createCourse();

      const result = await ReviewDatabaseOptimizer.getOptimizedCourseStats(
        course.id
      );

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
    });

    it("should handle large dataset searches efficiently", async () => {
      const course = await createCourse();
      // rating = i % 5 + 1; even reviews mention "Excellent course"
      await seedReviews(course.id, 1000, (i) => ({
        rating: (i % 5) + 1,
        comment:
          i % 2 === 0 ? `Excellent course, review #${i}` : `Short review #${i}`,
      }));

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.performOptimizedSearch(
            "excellent course",
            { ratings: [4, 5] },
            { page: 1, limit: 50 }
          );
        });

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      // text AND rating filters: i % 10 is 4 or 8 -> 200 reviews
      expect(result.pagination.total).toBe(200);
      expect(result.reviews).toHaveLength(50);
      result.reviews.forEach((review) => {
        expect([4, 5]).toContain(review.rating);
        expect(review.comment?.toLowerCase()).toContain("excellent course");
      });
      expect(result.performance.queryDuration).toBeLessThan(1000);
      expect(result.performance.resultsPerSecond).toBeGreaterThan(20);

      // each filter on its own
      const textOnly = await ReviewDatabaseOptimizer.performOptimizedSearch(
        "EXCELLENT Course", // case-insensitive
        {},
        { page: 1, limit: 50 }
      );
      expect(textOnly.pagination.total).toBe(500);

      const ratingsOnly = await ReviewDatabaseOptimizer.performOptimizedSearch(
        "",
        { ratings: [4, 5] },
        { page: 1, limit: 50 }
      );
      expect(ratingsOnly.pagination.total).toBe(400);
    });

    it("should handle concurrent database operations", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 20);

      const results = await PerformanceTestUtils.runConcurrentTests(
        () => ReviewDatabaseOptimizer.getOptimizedCourseStats(course.id),
        5, // 5 concurrent operations
        20 // 20 total operations
      );

      expect(results.successful).toBe(20);
      expect(results.averageDuration).toBeLessThan(2000); // Average under 2 seconds
      expect(results.failureRate).toBe(0);
    });
  });

  describe("Cache Performance", () => {
    it("should serve repeated statistics from the cache instead of the database", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 30);
      const countSpy = vi.spyOn(db.review, "count");

      try {
        // First call (cache miss)
        const first = await ReviewCacheService.getReviewStats(course.id);
        const queriesAfterMiss = countSpy.mock.calls.length;
        expect(queriesAfterMiss).toBeGreaterThan(0);
        expect(first.totalReviews).toBe(30);

        // Second call (cache hit): same payload, no new database query
        const { result: second, duration } =
          await PerformanceTestUtils.measureExecutionTime(async () => {
            return ReviewCacheService.getReviewStats(course.id);
          });

        expect(second).toEqual(first);
        expect(countSpy.mock.calls.length).toBe(queriesAfterMiss);
        expect(duration).toBeLessThan(50); // Cache hits under 50ms
      } finally {
        countSpy.mockRestore();
      }
    });

    it("should handle cache invalidation efficiently", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 5);

      // Populate cache
      await ReviewCacheService.getReviewStats(course.id);
      expect(await redis().keys("review_stats:*")).toHaveLength(1);

      // Measure invalidation time
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        async () => {
          return ReviewCacheService.invalidateCourseCache(course.id);
        }
      );

      expect(duration).toBeLessThan(100); // Invalidation under 100ms
      expect(await redis().keys("review_stats:*")).toHaveLength(0);

      // The next read recomputes and sees new data
      await seedReviews(course.id, 3);
      const stats = await ReviewCacheService.getReviewStats(course.id);
      expect(stats.totalReviews).toBe(8);
    });

    it("should maintain performance under high cache load", async () => {
      const courses = await Promise.all(
        Array.from({ length: 20 }, () => createCourse())
      );
      const concurrentCacheOperations = async () => {
        const course = courses[Math.floor(Math.random() * courses.length)];
        return ReviewCacheService.getReviewStats(course.id);
      };

      const results = await PerformanceTestUtils.runConcurrentTests(
        concurrentCacheOperations,
        10, // 10 concurrent operations
        100 // 100 total operations
      );

      expect(results.successful).toBe(100);
      expect(results.averageDuration).toBeLessThan(500); // Average under 500ms
      expect(results.maxDuration).toBeLessThan(2000); // No operation over 2 seconds
    });

    it("should keep one cache entry per course", async () => {
      // Generate a large amount of cached data
      const cachePromises = Array.from({ length: 300 }, (_, index) =>
        ReviewCacheService.getReviewStats(`course_memory_test_${index}`)
      );

      await Promise.all(cachePromises);

      // Check cache statistics
      const cacheStats = await ReviewCacheService.getCacheStats();

      expect(cacheStats).not.toBeNull();
      expect(cacheStats!.totalCacheKeys).toBe(300);
      expect(cacheStats!.breakdown["review_stats:"]).toBe(300);
    });
  });

  describe("Analytics Performance", () => {
    it("should calculate analytics efficiently for large datasets", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 1000);

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewAnalyticsService.getCourseReviewStats(course.id);
        });

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.totalReviews).toBe(1000);
      expect(Object.keys(result.ratingDistribution)).toHaveLength(5);
      expect(result.ratingDistribution).toEqual({
        1: 200,
        2: 200,
        3: 200,
        4: 200,
        5: 200,
      });
      expect(result.averageRating).toBe(3);
    });

    it("should handle global analytics efficiently", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 50);

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewAnalyticsService.getGlobalReviewStats();
        });

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.totalReviews).toBe(50);
      expect(result.totalCourses).toBe(1);
      expect(result.averageRating).toBe(3);
      expect(result).toHaveProperty("topRatedCourses");
      // The only course has 50 reviews (>= the 5 needed to be ranked)
      expect(result.topRatedCourses).toHaveLength(1);
    });

    it("should cache analytics results effectively", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 10);
      const countSpy = vi.spyOn(db.review, "count");

      try {
        const first = await ReviewAnalyticsService.getCourseReviewStats(
          course.id
        );
        const queriesAfterFirst = countSpy.mock.calls.length;
        expect(queriesAfterFirst).toBeGreaterThan(0);

        // Second call (should use cache)
        const { result: second, duration } =
          await PerformanceTestUtils.measureExecutionTime(async () => {
            return ReviewAnalyticsService.getCourseReviewStats(course.id);
          });

        expect(second).toEqual(first);
        expect(countSpy.mock.calls.length).toBe(queriesAfterFirst);
        expect(duration).toBeLessThan(100); // Cache hits under 100ms
      } finally {
        countSpy.mockRestore();
      }
    });
  });

  describe("API Performance", () => {
    it("should serve many concurrent list requests", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 10);

      const results = await PerformanceTestUtils.runConcurrentTests(
        async () => {
          const response = await getReviews(
            new NextRequest(
              `http://localhost:3000/api/reviews?courseId=${course.id}&limit=5`
            )
          );
          if (response.status !== 200) {
            throw new Error(`unexpected status ${response.status}`);
          }
          return response.json();
        },
        10, // 10 concurrent requests
        50 // 50 total requests
      );

      expect(results.successful).toBe(50);
      expect(results.averageDuration).toBeLessThan(1000); // Average under 1 second
    });

    it("should handle pagination efficiently", async () => {
      const course = await createCourse();
      const total = 120;
      await seedReviews(course.id, total);

      // Test large pagination requests
      const paginationTests = [
        { page: 1, limit: 100 },
        { page: 2, limit: 50 },
        { page: 6, limit: 20 },
        { page: 50, limit: 10 },
      ];

      for (const params of paginationTests) {
        const { result, duration } =
          await PerformanceTestUtils.measureExecutionTime(async () => {
            return ReviewCacheService.getCourseReviews(course.id, params);
          });

        const expected = Math.max(
          0,
          Math.min(params.limit, total - (params.page - 1) * params.limit)
        );
        expect(result.reviews).toHaveLength(expected);
        expect(result.pagination).toMatchObject({
          total,
          page: params.page,
          limit: params.limit,
          pages: Math.ceil(total / params.limit),
        });
        expect(duration).toBeLessThan(2000); // Each pagination request under 2 seconds
      }
    });
  });

  describe("Memory and Resource Usage", () => {
    it("should maintain stable memory usage under load", async () => {
      const initialMemory = process.memoryUsage();

      // Perform memory-intensive operations
      for (let i = 0; i < 100; i++) {
        await ReviewCacheService.getReviewStats(`course_memory_${i}`);
        await ReviewAnalyticsService.getCourseReviewStats(
          `course_analytics_${i}`
        );

        // Trigger garbage collection periodically
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (under 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it("should clean up resources properly", async () => {
      const resourceCleanupTest = async () => {
        // Create many temporary objects
        const tempData = Array.from({ length: 1000 }, (_, index) => ({
          id: `temp_${index}`,
          data: new Array(1000).fill(`data_${index}`),
        }));

        // Process the data
        return tempData.map((item) => item.id);
      };

      // Run test multiple times
      for (let i = 0; i < 10; i++) {
        await resourceCleanupTest();
      }

      // Memory should stabilize
      if (global.gc) {
        global.gc();
        const memory = process.memoryUsage();
        expect(memory.heapUsed).toBeLessThan(100 * 1024 * 1024); // Under 100MB
      }
    });
  });

  describe("Database Health Monitoring", () => {
    it("should monitor database performance metrics", async () => {
      const course = await createCourse();
      await seedReviews(course.id, 12);

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.getPerformanceMetrics();
        });

      expect(duration).toBeLessThan(2000); // Performance check under 2 seconds
      expect(result.tables).toEqual({
        reviews: 12,
        votes: 0,
        replies: 0,
        reports: 0,
      });
      expect(result.averageReviewsPerCourse).toBe(12);
      expect(result.queryDuration).toBeLessThan(1000);
    });

    it("should provide health check within reasonable time", async () => {
      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.healthCheck();
        });

      expect(duration).toBeLessThan(3000); // Health check under 3 seconds
      expect(result.status).toBe("healthy");
      expect(result.checks).toBeInstanceOf(Array);
      expect(result.checks.every((check) => check.status === "pass")).toBe(
        true
      );
      expect(result.totalDuration).toBeLessThan(2500);
    });

    it("should generate optimization recommendations quickly", async () => {
      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.getOptimizationRecommendations();
        });

      expect(duration).toBeLessThan(1000); // Recommendations under 1 second
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      result.forEach((recommendation: any) => {
        expect(recommendation).toHaveProperty("type");
        expect(recommendation).toHaveProperty("priority");
        expect(recommendation).toHaveProperty("title");
        expect(recommendation).toHaveProperty("description");
      });
    });
  });
});
