import { db } from "@/lib/db";
import { ReviewStatus } from "@prisma/client";
import { logger } from "@/lib/structured-logger";
import { ReviewCacheBase } from "./base";

/** Cached reads of single reviews, course/user review lists and stats. */
export class ReviewReadCache extends ReviewCacheBase {
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
          this.CACHE_TTL.REVIEW_DETAILS,
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
        error as Error,
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
    } = {},
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
        error as Error,
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
    } = {},
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
        error as Error,
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
        error as Error,
      );
      throw error;
    }
  }
}
