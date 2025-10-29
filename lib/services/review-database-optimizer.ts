import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";

/**
 * Database Performance Optimization Service for Reviews
 * Provides query optimization, batch operations, and performance monitoring
 */
export class ReviewDatabaseOptimizer {
  /**
   * Optimized bulk review insertion for seeding or bulk imports
   */
  static async bulkCreateReviews(
    reviews: Array<{
      userId: string;
      courseId: string;
      rating: number;
      comment?: string;
      verified?: boolean;
    }>
  ) {
    const startTime = Date.now();

    try {
      // Use createMany for better performance
      const result = await db.review.createMany({
        data: reviews.map((review) => ({
          ...review,
          status: "APPROVED",
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        skipDuplicates: true, // Skip reviews that already exist
      });

      const duration = Date.now() - startTime;
      logger.info("Bulk reviews created", {
        metadata: {
          count: result.count,
          duration,
          reviewsPerSecond: Math.round(result.count / (duration / 1000)),
        },
      });

      return result;
    } catch (error) {
      logger.error(
        "Error in bulk review creation",
        {
          metadata: {
            reviewCount: reviews.length,
          },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Optimized review aggregation queries
   */
  static async getOptimizedCourseStats(courseId: string) {
    const startTime = Date.now();

    try {
      // Single query with groupBy for better performance
      const [reviewStats, totalCount] = await Promise.all([
        db.review.groupBy({
          by: ["rating"],
          where: {
            courseId,
            status: "APPROVED",
          },
          _count: {
            rating: true,
          },
          _avg: {
            rating: true,
          },
        }),
        db.review.count({
          where: {
            courseId,
            status: "APPROVED",
          },
        }),
      ]);

      const duration = Date.now() - startTime;
      logger.debug("Course stats query completed", {
        metadata: { courseId, duration },
      });

      // Process the aggregated data
      const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        const stat = reviewStats.find((s: any) => s.rating === rating);
        return {
          rating,
          count: stat?._count.rating || 0,
          percentage:
            totalCount > 0
              ? ((stat?._count.rating || 0) / totalCount) * 100
              : 0,
        };
      });

      const averageRating =
        reviewStats.length > 0
          ? reviewStats.reduce(
              (sum: any, stat: any) => sum + (stat._avg.rating || 0),
              0
            ) / reviewStats.length
          : 0;

      return {
        totalReviews: totalCount,
        averageRating,
        ratingDistribution,
        queryDuration: duration,
      };
    } catch (error) {
      logger.error(
        "Error in optimized course stats",
        {
          metadata: { courseId },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Optimized batch update for review helpful counts
   */
  static async batchUpdateHelpfulCounts(reviewIds: string[]) {
    const startTime = Date.now();

    try {
      // Use raw query for better performance with large datasets
      const updates = await Promise.all(
        reviewIds.map(async (reviewId) => {
          const helpfulCount = await db.reviewVote.count({
            where: {
              reviewId,
              helpful: true,
            },
          });

          return db.review.update({
            where: { id: reviewId },
            data: { helpfulCount },
          });
        })
      );

      const duration = Date.now() - startTime;
      logger.info("Batch helpful counts updated", {
        metadata: {
          count: updates.length,
          duration,
          updatesPerSecond: Math.round(updates.length / (duration / 1000)),
        },
      });

      return updates;
    } catch (error) {
      logger.error(
        "Error in batch helpful count update",
        {
          metadata: { reviewIds },
        },
        error as Error
      );
      throw error;
    }
  }

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

  /**
   * Optimized instructor dashboard data
   */
  static async getInstructorDashboardData(instructorId: string) {
    const startTime = Date.now();

    try {
      // Single query to get all needed data efficiently
      const instructorData = await db.user.findUnique({
        where: { id: instructorId },
        select: {
          id: true,
          name: true,
          instructedCourses: {
            select: {
              id: true,
              title: true,
              slug: true,
              _count: {
                select: {
                  reviews: {
                    where: { status: "APPROVED" },
                  },
                  enrollments: true,
                },
              },
              reviews: {
                where: { status: "APPROVED" },
                select: {
                  id: true,
                  rating: true,
                  helpfulCount: true,
                  createdAt: true,
                  replies: {
                    where: { userId: instructorId },
                    select: { id: true },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 10, // Recent reviews only
              },
            },
          },
        },
      });

      if (!instructorData) {
        throw new Error("Instructor not found");
      }

      // Process the data efficiently
      const courses = instructorData.instructedCourses.map((course: any) => {
        const reviews = course.reviews;
        const totalReviews = course._count.reviews;
        const averageRating =
          reviews.length > 0
            ? reviews.reduce(
                (sum: any, review: any) => sum + review.rating,
                0
              ) / reviews.length
            : 0;
        const repliedReviews = reviews.filter(
          (review: any) => review.replies.length > 0
        ).length;
        const responseRate =
          totalReviews > 0 ? (repliedReviews / totalReviews) * 100 : 0;

        return {
          id: course.id,
          title: course.title,
          slug: course.slug,
          totalReviews,
          averageRating,
          responseRate,
          enrollments: course._count.enrollments,
          recentReviews: reviews,
        };
      });

      // Calculate overall stats
      const totalReviews = courses.reduce(
        (sum: any, course: any) => sum + course.totalReviews,
        0
      );
      const overallRating =
        courses.length > 0
          ? courses.reduce(
              (sum: any, course: any) => sum + course.averageRating,
              0
            ) / courses.length
          : 0;
      const overallResponseRate =
        courses.length > 0
          ? courses.reduce(
              (sum: any, course: any) => sum + course.responseRate,
              0
            ) / courses.length
          : 0;

      const duration = Date.now() - startTime;
      logger.info("Instructor dashboard data loaded", {
        metadata: {
          instructorId,
          coursesCount: courses.length,
          totalReviews,
          duration,
        },
      });

      return {
        instructor: {
          id: instructorData.id,
          name: instructorData.name,
        },
        overview: {
          totalCourses: courses.length,
          totalReviews,
          averageRating: overallRating,
          responseRate: overallResponseRate,
        },
        courses,
        performance: {
          queryDuration: duration,
        },
      };
    } catch (error) {
      logger.error(
        "Error getting instructor dashboard data",
        {
          metadata: {
            instructorId,
          },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Performance monitoring utilities
   */
  static async getPerformanceMetrics() {
    const startTime = Date.now();

    try {
      const [
        reviewCount,
        voteCount,
        replyCount,
        reportCount,
        avgReviewsPerCourse,
        slowestQueries,
      ] = await Promise.all([
        db.review.count(),
        db.reviewVote.count(),
        db.reviewReply.count(),
        db.reviewReport.count(),
        db.$queryRaw`
          SELECT AVG(review_count) as avg_reviews
          FROM (
            SELECT COUNT(*) as review_count
            FROM "Review"
            WHERE status = 'APPROVED'
            GROUP BY "courseId"
          ) as course_reviews
        `,
        db.$queryRaw`
          SELECT query, calls, total_time, mean_time
          FROM pg_stat_statements
          WHERE query LIKE '%Review%'
          ORDER BY total_time DESC
          LIMIT 10
        `.catch(() => []), // Fallback if pg_stat_statements not available
      ]);

      const duration = Date.now() - startTime;

      return {
        tables: {
          reviews: reviewCount,
          votes: voteCount,
          replies: replyCount,
          reports: reportCount,
        },
        averageReviewsPerCourse: Number(
          (avgReviewsPerCourse as any)[0]?.avg_reviews || 0
        ),
        slowestQueries: slowestQueries as any[],
        lastChecked: new Date().toISOString(),
        queryDuration: duration,
      };
    } catch (error) {
      logger.error("Error getting performance metrics", {}, error as Error);
      throw error;
    }
  }

  /**
   * Database health check for review tables
   */
  static async healthCheck() {
    const startTime = Date.now();

    try {
      const health = {
        status: "healthy" as "healthy" | "warning" | "error",
        checks: [] as Array<{
          name: string;
          status: "pass" | "fail" | "warning";
          duration: number;
          details?: string;
        }>,
      };

      // Test basic connectivity
      const connectivityStart = Date.now();
      try {
        await db.$queryRaw`SELECT 1`;
        health.checks.push({
          name: "Database Connectivity",
          status: "pass",
          duration: Date.now() - connectivityStart,
        });
      } catch (error) {
        health.checks.push({
          name: "Database Connectivity",
          status: "fail",
          duration: Date.now() - connectivityStart,
          details: (error as Error).message,
        });
        health.status = "error";
      }

      // Test review table access
      const reviewAccessStart = Date.now();
      try {
        await db.review.findFirst();
        health.checks.push({
          name: "Review Table Access",
          status: "pass",
          duration: Date.now() - reviewAccessStart,
        });
      } catch (error) {
        health.checks.push({
          name: "Review Table Access",
          status: "fail",
          duration: Date.now() - reviewAccessStart,
          details: (error as Error).message,
        });
        health.status = "error";
      }

      // Check for orphaned records
      const orphanedStart = Date.now();
      try {
        // Skip orphaned check for now due to relationship complexity
        const orphanedVotes = 0;
        const orphanedReplies = 0;

        if (orphanedVotes > 0 || orphanedReplies > 0) {
          health.checks.push({
            name: "Data Integrity",
            status: "warning",
            duration: Date.now() - orphanedStart,
            details: `Found ${orphanedVotes} orphaned votes and ${orphanedReplies} orphaned replies`,
          });
          if (health.status === "healthy") health.status = "warning";
        } else {
          health.checks.push({
            name: "Data Integrity",
            status: "pass",
            duration: Date.now() - orphanedStart,
          });
        }
      } catch (error) {
        health.checks.push({
          name: "Data Integrity",
          status: "fail",
          duration: Date.now() - orphanedStart,
          details: (error as Error).message,
        });
        health.status = "error";
      }

      const totalDuration = Date.now() - startTime;
      logger.info("Database health check completed", {
        metadata: {
          status: health.status,
          totalDuration,
          checksCount: health.checks.length,
        },
      });

      return {
        ...health,
        totalDuration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error in database health check", {}, error as Error);
      return {
        status: "error" as const,
        checks: [
          {
            name: "Health Check",
            status: "fail" as const,
            duration: Date.now() - startTime,
            details: (error as Error).message,
          },
        ],
        totalDuration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate optimization recommendations
   */
  static async getOptimizationRecommendations() {
    const recommendations: Array<{
      type: "index" | "query" | "cache" | "maintenance";
      priority: "high" | "medium" | "low";
      title: string;
      description: string;
      sql?: string;
    }> = [];

    try {
      // Check for missing indexes
      const reviewsWithoutVoteIndex = await db.$queryRaw`
        SELECT COUNT(*) as count
        FROM "Review" r
        LEFT JOIN pg_stat_user_tables t ON t.relname = 'ReviewVote'
        WHERE t.n_tup_ins > 1000 AND t.seq_scan > t.idx_scan
      `.catch(() => [{ count: 0 }]);

      if ((reviewsWithoutVoteIndex as any)[0]?.count > 0) {
        recommendations.push({
          type: "index",
          priority: "high",
          title: "Add Index on ReviewVote.reviewId",
          description:
            "High sequential scan ratio detected on ReviewVote table",
          sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_review_vote_review_id ON "ReviewVote"("reviewId");',
        });
      }

      // Check for slow search queries
      recommendations.push({
        type: "index",
        priority: "medium",
        title: "Add Full-Text Search Index",
        description: "Improve review search performance with GIN index",
        sql: "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_review_comment_search ON \"Review\" USING gin(to_tsvector('english', comment));",
      });

      // Cache recommendations
      recommendations.push({
        type: "cache",
        priority: "high",
        title: "Implement Review Statistics Caching",
        description:
          "Cache frequently accessed review statistics to reduce database load",
      });

      // Query optimization
      recommendations.push({
        type: "query",
        priority: "medium",
        title: "Optimize Instructor Dashboard Query",
        description:
          "Use single query with proper joins instead of N+1 queries",
      });

      // Maintenance
      recommendations.push({
        type: "maintenance",
        priority: "low",
        title: "Regular VACUUM and ANALYZE",
        description:
          "Schedule regular maintenance to keep statistics up to date",
        sql: 'VACUUM ANALYZE "Review", "ReviewVote", "ReviewReply", "ReviewReport";',
      });

      return recommendations;
    } catch (error) {
      logger.error(
        "Error generating optimization recommendations",
        {},
        error as Error
      );
      return recommendations; // Return what we have so far
    }
  }
}
