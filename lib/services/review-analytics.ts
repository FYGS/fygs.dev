import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { ReviewStatus } from "@/lib/generated/prisma/browser";

/**
 * Advanced Review Analytics and Aggregation Service
 * Provides comprehensive review statistics, caching, and analytics
 */
export class ReviewAnalyticsService {
  private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Get comprehensive review statistics for a course
   */
  static async getCourseReviewStats(courseId: string) {
    const cacheKey = `course-review-stats-${courseId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [
        totalReviews,
        averageRating,
        ratingDistribution,
        verifiedReviews,
        recentReviews,
      ] = await Promise.all([
        this.getTotalReviews(courseId),
        this.getAverageRating(courseId),
        this.getRatingDistribution(courseId),
        this.getVerifiedReviewsCount(courseId),
        this.getRecentReviewsCount(courseId, 30), // Last 30 days
      ]);

      const stats = {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        ratingDistribution,
        verifiedReviews,
        recentReviews,
        verificationRate:
          totalReviews > 0 ? (verifiedReviews / totalReviews) * 100 : 0,
        lastUpdated: new Date().toISOString(),
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      logger.error("Failed to get course review stats", {
        metadata: {
          courseId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Get total number of approved reviews for a course
   */
  private static async getTotalReviews(courseId: string): Promise<number> {
    return await db.review.count({
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
      },
    });
  }

  /**
   * Calculate average rating for a course
   */
  private static async getAverageRating(courseId: string): Promise<number> {
    const result = await db.review.aggregate({
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  /**
   * Get rating distribution (1-5 stars) for a course
   */
  private static async getRatingDistribution(
    courseId: string
  ): Promise<Record<number, number>> {
    const distribution = await db.review.groupBy({
      by: ["rating"],
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
      },
      _count: {
        rating: true,
      },
    });

    // Initialize all ratings to 0
    const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    distribution.forEach((item) => {
      result[item.rating] = item._count.rating;
    });

    return result;
  }

  /**
   * Get number of verified reviews (from users who completed the course)
   */
  private static async getVerifiedReviewsCount(
    courseId: string
  ): Promise<number> {
    return await db.review.count({
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
        verified: true,
      },
    });
  }

  /**
   * Get number of reviews from the last N days
   */
  private static async getRecentReviewsCount(
    courseId: string,
    days: number
  ): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return await db.review.count({
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
        createdAt: {
          gte: since,
        },
      },
    });
  }

  /**
   * Get global platform review statistics
   */
  static async getGlobalReviewStats() {
    const cacheKey = "global-review-stats";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [
        totalReviews,
        totalCourses,
        averageRating,
        topRatedCourses,
        reviewsByMonth,
      ] = await Promise.all([
        this.getGlobalTotalReviews(),
        this.getTotalCoursesWithReviews(),
        this.getGlobalAverageRating(),
        this.getTopRatedCourses(10),
        this.getReviewsByMonth(12), // Last 12 months
      ]);

      const stats = {
        totalReviews,
        totalCourses,
        averageRating: Number(averageRating.toFixed(1)),
        topRatedCourses,
        reviewsByMonth,
        lastUpdated: new Date().toISOString(),
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      logger.error("Failed to get global review stats", {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Get total reviews across the platform
   */
  private static async getGlobalTotalReviews(): Promise<number> {
    return await db.review.count({
      where: {
        status: ReviewStatus.APPROVED,
      },
    });
  }

  /**
   * Get number of courses that have reviews
   */
  private static async getTotalCoursesWithReviews(): Promise<number> {
    const result = await db.review.groupBy({
      by: ["courseId"],
      where: {
        status: ReviewStatus.APPROVED,
      },
    });

    return result.length;
  }

  /**
   * Calculate global average rating
   */
  private static async getGlobalAverageRating(): Promise<number> {
    const result = await db.review.aggregate({
      where: {
        status: ReviewStatus.APPROVED,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  /**
   * Get top-rated courses with minimum number of reviews
   */
  private static async getTopRatedCourses(
    limit: number,
    minReviews: number = 5
  ) {
    const courses = await db.course.findMany({
      where: {
        published: true,
        reviews: {
          some: {
            status: ReviewStatus.APPROVED,
          },
        },
      },
      include: {
        reviews: {
          where: {
            status: ReviewStatus.APPROVED,
          },
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: {
                status: ReviewStatus.APPROVED,
              },
            },
          },
        },
      },
    });

    // Calculate average rating and filter by minimum reviews
    const coursesWithStats = courses
      .filter((course) => course._count.reviews >= minReviews)
      .map((course) => {
        const averageRating =
          course.reviews.reduce((sum, review) => sum + review.rating, 0) /
          course.reviews.length;
        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,
          averageRating: Number(averageRating.toFixed(1)),
          reviewCount: course._count.reviews,
        };
      })
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return coursesWithStats;
  }

  /**
   * Get review statistics by month for trend analysis
   */
  private static async getReviewsByMonth(months: number) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const reviews = await db.review.findMany({
      where: {
        status: ReviewStatus.APPROVED,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        rating: true,
      },
    });

    // Group by month
    const monthlyStats: Record<
      string,
      { count: number; averageRating: number }
    > = {};

    reviews.forEach((review) => {
      const monthKey = review.createdAt.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { count: 0, averageRating: 0 };
      }

      monthlyStats[monthKey].count++;
      monthlyStats[monthKey].averageRating += review.rating;
    });

    // Calculate averages
    Object.keys(monthlyStats).forEach((month) => {
      monthlyStats[month].averageRating = Number(
        (monthlyStats[month].averageRating / monthlyStats[month].count).toFixed(
          1
        )
      );
    });

    return monthlyStats;
  }

  /**
   * Invalidate cache for a specific course
   */
  static invalidateCourseCache(courseId: string) {
    const cacheKey = `course-review-stats-${courseId}`;
    this.cache.delete(cacheKey);
    this.cache.delete("global-review-stats"); // Also invalidate global stats

    logger.info("Review cache invalidated", {
      metadata: { courseId, cacheKey },
    });
  }

  /**
   * Get data from cache if not expired
   */
  private static getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache with timestamp
   */
  private static setCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  static clearCache() {
    this.cache.clear();
    logger.info("Review cache cleared");
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get review sentiment analysis (basic implementation)
   */
  static async getReviewSentiment(courseId: string) {
    const reviews = await db.review.findMany({
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
        comment: {
          not: null,
        },
      },
      select: {
        rating: true,
        comment: true,
      },
    });

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    reviews.forEach((review) => {
      if (review.rating >= 4) positive++;
      else if (review.rating === 3) neutral++;
      else negative++;
    });

    const total = reviews.length;
    return {
      positive: total > 0 ? Math.round((positive / total) * 100) : 0,
      neutral: total > 0 ? Math.round((neutral / total) * 100) : 0,
      negative: total > 0 ? Math.round((negative / total) * 100) : 0,
      totalAnalyzed: total,
    };
  }
}
