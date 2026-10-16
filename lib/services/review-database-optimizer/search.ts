import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { ReviewStatsQueries } from "./stats";

/** Optimized review search. */
export class ReviewSearchQueries extends ReviewStatsQueries {
  /**
   * Optimized search with full-text search capabilities
   */
  static async performOptimizedSearch(
    searchQuery: string,
    filters: {
      courseIds?: string[];
      ratings?: number[];
      verified?: boolean;
      dateRange?: {
        from: Date;
        to: Date;
      };
    } = {},
    options: {
      page?: number;
      limit?: number;
      sortBy?: "relevance" | "newest" | "rating" | "helpful";
    } = {}
  ) {
    const startTime = Date.now();
    const { page = 1, limit = 10, sortBy = "relevance" } = options;

    try {
      // Build optimized where clause
      const where: any = {
        status: "APPROVED",
      };

      // Add full-text search
      if (searchQuery.trim()) {
        where.comment = {
          search: searchQuery.trim(),
        };
      }

      // Add filters
      if (filters.courseIds && filters.courseIds.length > 0) {
        where.courseId = { in: filters.courseIds };
      }

      if (filters.ratings && filters.ratings.length > 0) {
        where.rating = { in: filters.ratings };
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

      // Build optimized order clause
      let orderBy: any = {};
      switch (sortBy) {
        case "relevance":
          orderBy = [
            { helpfulCount: "desc" },
            { rating: "desc" },
            { createdAt: "desc" },
          ];
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "rating":
          orderBy = { rating: "desc" };
          break;
        case "helpful":
          orderBy = { helpfulCount: "desc" };
          break;
      }

      // Execute optimized queries in parallel
      const [reviews, totalCount] = await Promise.all([
        db.review.findMany({
          where,
          select: {
            id: true,
            rating: true,
            comment: true,
            verified: true,
            helpfulCount: true,
            createdAt: true,
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
            _count: {
              select: {
                votes: true,
                replies: true,
              },
            },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.review.count({ where }),
      ]);

      const duration = Date.now() - startTime;
      logger.info("Optimized search completed", {
        metadata: {
          searchQuery,
          filters,
          resultCount: reviews.length,
          totalCount,
          duration,
          page,
          limit,
        },
      });

      return {
        reviews,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
        performance: {
          queryDuration: duration,
          resultsPerSecond: Math.round(reviews.length / (duration / 1000)),
        },
      };
    } catch (error) {
      logger.error(
        "Error in optimized search",
        {
          metadata: {
            searchQuery,
            filters,
          },
        },
        error as Error
      );
      throw error;
    }
  }
}
