import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { ReviewReadCache } from "./reads";

/** Cached search, popular and recent review lists. */
export class ReviewListCache extends ReviewReadCache {
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
    } = {},
  ) {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `${this.CACHE_KEYS.SEARCH}${query}:${JSON.stringify(
      filters,
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
        error as Error,
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
        this.CACHE_TTL.POPULAR_REVIEWS,
      );
      logger.debug("Popular reviews cached", { metadata: { cacheKey } });

      return reviews;
    } catch (error) {
      logger.error(
        "Error getting cached popular reviews",
        { metadata: {} },
        error as Error,
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
        this.CACHE_TTL.RECENT_REVIEWS,
      );
      logger.debug("Recent reviews cached", { metadata: { cacheKey } });

      return reviews;
    } catch (error) {
      logger.error(
        "Error getting cached recent reviews",
        { metadata: {} },
        error as Error,
      );
      throw error;
    }
  }
}
