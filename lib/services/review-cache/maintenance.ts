import { logger } from "@/lib/structured-logger";
import { ReviewListCache } from "./lists";

/** Cache invalidation, warm-up, statistics and clearing. */
export class ReviewCacheMaintenance extends ReviewListCache {
  /**
   * Invalidate cache for a specific review
   */
  static async invalidateReviewCache(
    reviewId: string,
    courseId?: string,
    userId?: string,
  ) {
    try {
      const keys = [`${this.CACHE_KEYS.REVIEW}${reviewId}`];

      if (courseId) {
        // Invalidate all course review caches
        const courseKeys = await this.redis.keys(
          `${this.CACHE_KEYS.COURSE_REVIEWS}${courseId}:*`,
        );
        const statsKeys = await this.redis.keys(
          `${this.CACHE_KEYS.REVIEW_STATS}${courseId}`,
        );
        keys.push(...courseKeys, ...statsKeys);
      }

      if (userId) {
        // Invalidate user review caches
        const userKeys = await this.redis.keys(
          `${this.CACHE_KEYS.USER_REVIEWS}${userId}:*`,
        );
        keys.push(...userKeys);
      }

      // Invalidate popular and recent caches
      const popularKeys = await this.redis.keys(`${this.CACHE_KEYS.POPULAR}*`);
      const recentKeys = await this.redis.keys(`${this.CACHE_KEYS.RECENT}*`);
      keys.push(...popularKeys, ...recentKeys);

      // Invalidate search caches (they might contain this review)
      const searchKeys = await this.redis.keys(`${this.CACHE_KEYS.SEARCH}*`);
      keys.push(...searchKeys);

      // Delete all keys
      if (keys.length > 0) {
        const pipeline = this.redis.multi();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();

        logger.info("Review cache invalidated", {
          metadata: {
            reviewId,
            courseId,
            userId,
            invalidatedKeys: keys.length,
          },
        });
      }
    } catch (error) {
      logger.error(
        "Error invalidating review cache",
        { metadata: { reviewId } },
        error as Error,
      );
    }
  }

  /**
   * Invalidate all course-related caches
   */
  static async invalidateCourseCache(courseId: string) {
    try {
      const keys = await this.redis.keys(
        `${this.CACHE_KEYS.COURSE_REVIEWS}${courseId}:*`,
      );
      const statsKeys = await this.redis.keys(
        `${this.CACHE_KEYS.REVIEW_STATS}${courseId}`,
      );

      if (keys.length > 0 || statsKeys.length > 0) {
        const pipeline = this.redis.multi();
        [...keys, ...statsKeys].forEach((key) => pipeline.del(key));
        await pipeline.exec();

        logger.info("Course review cache invalidated", {
          metadata: {
            courseId,
            invalidatedKeys: keys.length + statsKeys.length,
          },
        });
      }
    } catch (error) {
      logger.error(
        "Error invalidating course cache",
        { metadata: { courseId } },
        error as Error,
      );
    }
  }

  /**
   * Warm up cache for a specific course
   */
  static async warmUpCourseCache(courseId: string) {
    try {
      // Pre-load common queries
      await Promise.all([
        this.getCourseReviews(courseId, {
          page: 1,
          limit: 10,
          sortBy: "newest",
        }),
        this.getCourseReviews(courseId, {
          page: 1,
          limit: 10,
          sortBy: "helpful",
        }),
        this.getReviewStats(courseId),
      ]);

      logger.info("Course cache warmed up", { metadata: { courseId } });
    } catch (error) {
      logger.error(
        "Error warming up course cache",
        { metadata: { courseId } },
        error as Error,
      );
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    try {
      const patterns = Object.values(this.CACHE_KEYS);
      const stats: Record<string, number> = {};

      for (const pattern of patterns) {
        const keys = await this.redis.keys(`${pattern}*`);
        stats[pattern] = keys.length;
      }

      return {
        totalCacheKeys: Object.values(stats).reduce(
          (sum, count) => sum + count,
          0,
        ),
        breakdown: stats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "Error getting cache stats",
        { metadata: {} },
        error as Error,
      );
      return null;
    }
  }

  /**
   * Clear all review caches
   */
  static async clearAllCache() {
    try {
      const patterns = Object.values(this.CACHE_KEYS);
      let totalCleared = 0;

      for (const pattern of patterns) {
        const keys = await this.redis.keys(`${pattern}*`);
        if (keys.length > 0) {
          const pipeline = this.redis.multi();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
          totalCleared += keys.length;
        }
      }

      logger.info("All review cache cleared", { metadata: { totalCleared } });
      return totalCleared;
    } catch (error) {
      logger.error(
        "Error clearing all cache",
        { metadata: {} },
        error as Error,
      );
      throw error;
    }
  }
}
