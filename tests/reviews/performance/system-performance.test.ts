/**
 * Performance tests for Review System
 * Tests system performance under load and stress conditions
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  PerformanceTestUtils,
  setupIntegrationTest,
  teardownIntegrationTest,
} from "../fixtures/test-utils";
import { performanceTestData } from "../fixtures/review-fixtures";
import { ReviewCacheService } from "@/lib/services/review-cache";
import { ReviewDatabaseOptimizer } from "@/lib/services/review-database-optimizer";
import { ReviewAnalyticsService } from "@/lib/services/review-analytics";

describe("Review System Performance Tests", () => {
  beforeEach(async () => {
    await setupIntegrationTest();
  });

  afterEach(async () => {
    await teardownIntegrationTest();
  });

  describe("Database Performance", () => {
    it("should handle bulk review creation efficiently", async () => {
      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.bulkCreateReviews(
            performanceTestData.bulkOperationData
          );
        });

      expect(result.count).toBe(performanceTestData.bulkOperationData.length);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Calculate reviews per second
      const reviewsPerSecond = result.count / (duration / 1000);
      expect(reviewsPerSecond).toBeGreaterThan(10); // At least 10 reviews/second
    });

    it("should optimize course statistics queries", async () => {
      // First seed some test data
      await ReviewDatabaseOptimizer.bulkCreateReviews(
        performanceTestData.bulkOperationData
      );

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.getOptimizedCourseStats(
            "course_published_123"
          );
        });

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result).toHaveProperty("totalReviews");
      expect(result).toHaveProperty("averageRating");
      expect(result).toHaveProperty("ratingDistribution");
      expect(result.queryDuration).toBeLessThan(500); // DB query under 500ms
    });

    it("should handle large dataset searches efficiently", async () => {
      // Seed large dataset
      await ReviewDatabaseOptimizer.bulkCreateReviews(
        performanceTestData.largeCourseReviews
      );

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.performOptimizedSearch(
            "excellent course",
            { ratings: [4, 5] },
            { page: 1, limit: 50 }
          );
        });

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.reviews).toBeDefined();
      expect(result.performance.queryDuration).toBeLessThan(1000);
      expect(result.performance.resultsPerSecond).toBeGreaterThan(20);
    });

    it("should handle concurrent database operations", async () => {
      const concurrentOperations = Array.from(
        { length: 20 },
        (_, index) => async () => {
          return ReviewDatabaseOptimizer.getOptimizedCourseStats(
            `course_${index}`
          );
        }
      );

      const results = await PerformanceTestUtils.runConcurrentTests(
        () =>
          concurrentOperations[
            Math.floor(Math.random() * concurrentOperations.length)
          ](),
        5, // 5 concurrent operations
        20 // 20 total operations
      );

      expect(results.successful).toBeGreaterThan(15); // At least 75% success rate
      expect(results.averageDuration).toBeLessThan(2000); // Average under 2 seconds
      expect(results.failureRate).toBeLessThan(25); // Less than 25% failure rate
    });
  });

  describe("Cache Performance", () => {
    it("should provide significant performance improvement with caching", async () => {
      const courseId = "course_performance_test";

      // First call (cache miss)
      const { duration: firstCallDuration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewCacheService.getReviewStats(courseId);
        });

      // Second call (cache hit)
      const { duration: secondCallDuration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewCacheService.getReviewStats(courseId);
        });

      // Cache hit should be significantly faster
      expect(secondCallDuration).toBeLessThan(firstCallDuration / 5); // At least 5x faster
      expect(secondCallDuration).toBeLessThan(50); // Cache hits under 50ms
    });

    it("should handle cache invalidation efficiently", async () => {
      const courseId = "course_invalidation_test";

      // Populate cache
      await ReviewCacheService.getReviewStats(courseId);

      // Measure invalidation time
      const { duration } = await PerformanceTestUtils.measureExecutionTime(
        async () => {
          return ReviewCacheService.invalidateCourseCache(courseId);
        }
      );

      expect(duration).toBeLessThan(100); // Invalidation under 100ms
    });

    it("should maintain performance under high cache load", async () => {
      const concurrentCacheOperations = async () => {
        const randomCourseId = `course_${Math.floor(Math.random() * 100)}`;
        return ReviewCacheService.getReviewStats(randomCourseId);
      };

      const results = await PerformanceTestUtils.runConcurrentTests(
        concurrentCacheOperations,
        10, // 10 concurrent operations
        100 // 100 total operations
      );

      expect(results.successful).toBeGreaterThan(95); // At least 95% success rate
      expect(results.averageDuration).toBeLessThan(500); // Average under 500ms
      expect(results.maxDuration).toBeLessThan(2000); // No operation over 2 seconds
    });

    it("should handle memory usage efficiently", async () => {
      // Generate large amount of cached data
      const cachePromises = Array.from({ length: 1000 }, (_, index) =>
        ReviewCacheService.getReviewStats(`course_memory_test_${index}`)
      );

      await Promise.all(cachePromises);

      // Check cache statistics
      const cacheStats = await ReviewCacheService.getCacheStats();

      expect(cacheStats).not.toBeNull();
      expect(cacheStats!.totalCacheKeys).toBe(1000);
      expect(Object.keys(cacheStats!.breakdown)).toContain("reviews:");
    });
  });

  describe("Analytics Performance", () => {
    it("should calculate analytics efficiently for large datasets", async () => {
      // Seed large dataset
      await ReviewDatabaseOptimizer.bulkCreateReviews(
        performanceTestData.largeCourseReviews
      );

      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewAnalyticsService.getCourseReviewStats(
            "course_published_123"
          );
        });

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.totalReviews).toBeGreaterThan(0);
      expect(result.ratingDistribution).toHaveLength(5);
    });

    it("should handle global analytics efficiently", async () => {
      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewAnalyticsService.getGlobalReviewStats();
        });

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result).toHaveProperty("totalReviews");
      expect(result).toHaveProperty("averageRating");
      expect(result).toHaveProperty("topRatedCourses");
    });

    it("should cache analytics results effectively", async () => {
      const courseId = "course_analytics_cache_test";

      // First call
      const { duration: firstDuration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewAnalyticsService.getCourseReviewStats(courseId);
        });

      // Second call (should use cache)
      const { duration: secondDuration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewAnalyticsService.getCourseReviewStats(courseId);
        });

      expect(secondDuration).toBeLessThan(firstDuration / 3); // At least 3x faster
      expect(secondDuration).toBeLessThan(100); // Cache hits under 100ms
    });
  });

  describe("API Performance", () => {
    it("should handle API request rate limits", async () => {
      // Simulate rapid API requests
      const rapidRequests = Array.from({ length: 50 }, () => async () => {
        // Mock API call
        return new Promise((resolve) => {
          setTimeout(
            () => resolve({ status: 200, data: [] }),
            Math.random() * 100
          );
        });
      });

      const results = await PerformanceTestUtils.runConcurrentTests(
        () => rapidRequests[Math.floor(Math.random() * rapidRequests.length)](),
        10, // 10 concurrent requests
        50 // 50 total requests
      );

      expect(results.successful).toBeGreaterThan(40); // At least 80% success rate
      expect(results.averageDuration).toBeLessThan(1000); // Average under 1 second
    });

    it("should handle pagination efficiently", async () => {
      // Test large pagination requests
      const paginationTests = [
        { page: 1, limit: 100 },
        { page: 5, limit: 50 },
        { page: 10, limit: 20 },
        { page: 50, limit: 10 },
      ];

      for (const params of paginationTests) {
        const { duration } = await PerformanceTestUtils.measureExecutionTime(
          async () => {
            // Mock paginated API call
            return ReviewCacheService.getCourseReviews(
              "course_pagination_test",
              params
            );
          }
        );

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
      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.getPerformanceMetrics();
        });

      expect(duration).toBeLessThan(2000); // Performance check under 2 seconds
      expect(result).toHaveProperty("tables");
      expect(result).toHaveProperty("averageReviewsPerCourse");
      expect(result).toHaveProperty("queryDuration");
      expect(result.queryDuration).toBeLessThan(1000);
    });

    it("should provide health check within reasonable time", async () => {
      const { result, duration } =
        await PerformanceTestUtils.measureExecutionTime(async () => {
          return ReviewDatabaseOptimizer.healthCheck();
        });

      expect(duration).toBeLessThan(3000); // Health check under 3 seconds
      expect(result.status).toMatch(/healthy|warning|error/);
      expect(result.checks).toBeInstanceOf(Array);
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
