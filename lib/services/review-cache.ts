import { db } from "@/lib/db";
import { RedisClient } from "@/lib/redis";
import { ReviewStatus } from "@prisma/client";
import { logger } from "@/lib/structured-logger";

/**
 * Advanced Review Caching Service
 * Provides multi-layer caching for optimal review system performance
 */
export class ReviewCacheService {
  private static readonly redis = RedisClient.getInstance();

  // Cache TTL configurations (in seconds)
  private static readonly CACHE_TTL = {
    REVIEW_DETAILS: 3600, // 1 hour
    REVIEW_LIST: 1800, // 30 minutes
    COURSE_REVIEWS: 1800, // 30 minutes
    USER_REVIEWS: 3600, // 1 hour
    REVIEW_STATS: 7200, // 2 hours
    SEARCH_RESULTS: 900, // 15 minutes
    POPULAR_REVIEWS: 14400, // 4 hours
    RECENT_REVIEWS: 600, // 10 minutes
  };

  // Cache key prefixes
  private static readonly CACHE_KEYS = {
    REVIEW: "review:",
    COURSE_REVIEWS: "course_reviews:",
    USER_REVIEWS: "user_reviews:",
    REVIEW_STATS: "review_stats:",
    SEARCH: "review_search:",
    POPULAR: "popular_reviews:",
    RECENT: "recent_reviews:",
    ANALYTICS: "review_analytics:",
  };

  /**
   * Get a single review with caching
   */
  static async getReview(reviewId: string): Promise<any | null> {
    const cacheKey = `${this.CACHE_KEYS.REVIEW}${reviewId}`;

    try {
      // Try cache first
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("Review cache hit", {
          metadata: { reviewId, cacheKey },
        });
        return cached;
      }

      // Fetch from database
      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          reports: {
            where: {
              status: "PENDING",
            },
            select: {
              id: true,
              reason: true,
              createdAt: true,
            },
          },
        },
      });

      if (review) {
        // Cache the result
        await this.redis.setJSON(
          cacheKey,
          review,
          this.CACHE_TTL.REVIEW_DETAILS
        );
        logger.debug("Review cached", {
          metadata: { reviewId, cacheKey },
        });
      }

      return review;
    } catch (error) {
      logger.error(
        "Error getting cached review",
        {
          metadata: { reviewId },
        },
        error as Error
      );
      // Fallback to direct database query
      return db.review.findUnique({
        where: { id: reviewId },
        include: {
          user: { select: { id: true, name: true, image: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      });
    }
  }

  /**
   * Get course reviews with pagination and caching
   */
  static async getCourseReviews(
    courseId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful";
      filterBy?: {
        rating?: number;
        verified?: boolean;
        status?: ReviewStatus;
      };
    } = {}
  ): Promise<{
    reviews: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const { page = 1, limit = 10, sortBy = "newest", filterBy = {} } = options;
    const cacheKey = `${
      this.CACHE_KEYS.COURSE_REVIEWS
    }${courseId}:${page}:${limit}:${sortBy}:${JSON.stringify(filterBy)}`;

    try {
      // Try cache first
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("Course reviews cache hit", {
          metadata: { courseId, cacheKey },
        });
        return cached;
      }

      // Build where clause
      const where: any = {
        courseId,
        status: filterBy.status || "APPROVED",
      };

      if (filterBy.rating) {
        where.rating = filterBy.rating;
      }

      if (filterBy.verified !== undefined) {
        where.verified = filterBy.verified;
      }

      // Build order clause
      let orderBy: any = {};
      switch (sortBy) {
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "rating_high":
          orderBy = { rating: "desc" };
          break;
        case "rating_low":
          orderBy = { rating: "asc" };
          break;
        case "helpful":
          orderBy = { helpfulCount: "desc" };
          break;
      }

      // Get total count
      const total = await db.review.count({ where });

      // Get reviews
      const reviews = await db.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          votes: {
            select: {
              id: true,
              userId: true,
              helpful: true,
            },
          },
          replies: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      });

      const result = {
        reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      // Cache the result
      await this.redis.setJSON(cacheKey, result, this.CACHE_TTL.COURSE_REVIEWS);
      logger.debug("Course reviews cached", {
        metadata: { courseId, cacheKey },
      });

      return result;
    } catch (error) {
      logger.error(
        "Error getting cached course reviews",
        {
          metadata: { courseId },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get user reviews with caching
   */
  static async getUserReviews(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: ReviewStatus;
    } = {}
  ) {
    const { page = 1, limit = 10, status = "APPROVED" } = options;
    const cacheKey = `${this.CACHE_KEYS.USER_REVIEWS}${userId}:${page}:${limit}:${status}`;

    try {
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("User reviews cache hit", {
          metadata: { userId, cacheKey },
        });
        return cached;
      }

      const where = { userId, status };
      const total = await db.review.count({ where });

      const reviews = await db.review.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          votes: {
            select: {
              helpful: true,
            },
          },
          replies: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const result = {
        reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      await this.redis.setJSON(cacheKey, result, this.CACHE_TTL.USER_REVIEWS);
      logger.debug("User reviews cached", { metadata: { userId, cacheKey } });

      return result;
    } catch (error) {
      logger.error(
        "Error getting cached user reviews",
        { metadata: { userId } },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get review statistics with caching
   */
  static async getReviewStats(courseId: string) {
    const cacheKey = `${this.CACHE_KEYS.REVIEW_STATS}${courseId}`;

    try {
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("Review stats cache hit", {
          metadata: { courseId, cacheKey },
        });
        return cached;
      }

      const stats = await db.review.groupBy({
        by: ["rating"],
        where: {
          courseId,
          status: "APPROVED",
        },
        _count: {
          rating: true,
        },
      });

      const totalReviews = await db.review.count({
        where: {
          courseId,
          status: "APPROVED",
        },
      });

      const averageRating = await db.review.aggregate({
        where: {
          courseId,
          status: "APPROVED",
        },
        _avg: {
          rating: true,
        },
      });

      const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        const stat = stats.find((s) => s.rating === rating);
        return {
          rating,
          count: stat?._count.rating || 0,
          percentage:
            totalReviews > 0
              ? ((stat?._count.rating || 0) / totalReviews) * 100
              : 0,
        };
      });

      const result = {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution,
        lastUpdated: new Date().toISOString(),
      };

      await this.redis.setJSON(cacheKey, result, this.CACHE_TTL.REVIEW_STATS);
      logger.debug("Review stats cached", { metadata: { courseId, cacheKey } });

      return result;
    } catch (error) {
      logger.error(
        "Error getting cached review stats",
        { metadata: { courseId } },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Search reviews with caching
   */
  static async searchReviews(
    query: string,
    filters: {
      courseId?: string;
      rating?: number[];
      verified?: boolean;
      dateRange?: {
        from: Date;
        to: Date;
      };
    } = {},
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `${this.CACHE_KEYS.SEARCH}${query}:${JSON.stringify(
      filters
    )}:${page}:${limit}`;

    try {
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("Review search cache hit", {
          metadata: { query, cacheKey },
        });
        return cached;
      }

      const where: any = {
        status: "APPROVED",
        comment: {
          contains: query,
          mode: "insensitive",
        },
      };

      if (filters.courseId) {
        where.courseId = filters.courseId;
      }

      if (filters.rating && filters.rating.length > 0) {
        where.rating = {
          in: filters.rating,
        };
      }

      if (filters.verified !== undefined) {
        where.verified = filters.verified;
      }

      if (filters.dateRange) {
        where.createdAt = {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        };
      }

      const total = await db.review.count({ where });

      const reviews = await db.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          votes: {
            select: {
              helpful: true,
            },
          },
        },
        orderBy: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      });

      const result = {
        reviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        searchQuery: query,
        filters,
      };

      await this.redis.setJSON(cacheKey, result, this.CACHE_TTL.SEARCH_RESULTS);
      logger.debug("Review search cached", { metadata: { query, cacheKey } });

      return result;
    } catch (error) {
      logger.error(
        "Error getting cached search results",
        { metadata: { query } },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get popular reviews (most helpful) with caching
   */
  static async getPopularReviews(limit: number = 10) {
    const cacheKey = `${this.CACHE_KEYS.POPULAR}${limit}`;

    try {
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("Popular reviews cache hit", { metadata: { cacheKey } });
        return cached;
      }

      const reviews = await db.review.findMany({
        where: {
          status: "APPROVED",
          helpfulCount: {
            gte: 1,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { helpfulCount: "desc" },
          { rating: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });

      await this.redis.setJSON(
        cacheKey,
        reviews,
        this.CACHE_TTL.POPULAR_REVIEWS
      );
      logger.debug("Popular reviews cached", { metadata: { cacheKey } });

      return reviews;
    } catch (error) {
      logger.error(
        "Error getting cached popular reviews",
        { metadata: {} },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get recent reviews with caching
   */
  static async getRecentReviews(limit: number = 10) {
    const cacheKey = `${this.CACHE_KEYS.RECENT}${limit}`;

    try {
      const cached = await this.redis.getJSON<any>(cacheKey);
      if (cached) {
        logger.debug("Recent reviews cache hit", { metadata: { cacheKey } });
        return cached;
      }

      const reviews = await db.review.findMany({
        where: {
          status: "APPROVED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              instructor: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      await this.redis.setJSON(
        cacheKey,
        reviews,
        this.CACHE_TTL.RECENT_REVIEWS
      );
      logger.debug("Recent reviews cached", { metadata: { cacheKey } });

      return reviews;
    } catch (error) {
      logger.error(
        "Error getting cached recent reviews",
        { metadata: {} },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Invalidate cache for a specific review
   */
  static async invalidateReviewCache(
    reviewId: string,
    courseId?: string,
    userId?: string
  ) {
    try {
      const keys = [`${this.CACHE_KEYS.REVIEW}${reviewId}`];

      if (courseId) {
        // Invalidate all course review caches
        const courseKeys = await this.redis.keys(
          `${this.CACHE_KEYS.COURSE_REVIEWS}${courseId}:*`
        );
        const statsKeys = await this.redis.keys(
          `${this.CACHE_KEYS.REVIEW_STATS}${courseId}`
        );
        keys.push(...courseKeys, ...statsKeys);
      }

      if (userId) {
        // Invalidate user review caches
        const userKeys = await this.redis.keys(
          `${this.CACHE_KEYS.USER_REVIEWS}${userId}:*`
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
        error as Error
      );
    }
  }

  /**
   * Invalidate all course-related caches
   */
  static async invalidateCourseCache(courseId: string) {
    try {
      const keys = await this.redis.keys(
        `${this.CACHE_KEYS.COURSE_REVIEWS}${courseId}:*`
      );
      const statsKeys = await this.redis.keys(
        `${this.CACHE_KEYS.REVIEW_STATS}${courseId}`
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
        error as Error
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
        error as Error
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
          0
        ),
        breakdown: stats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "Error getting cache stats",
        { metadata: {} },
        error as Error
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
        error as Error
      );
      throw error;
    }
  }
}
