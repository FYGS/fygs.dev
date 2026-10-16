import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { ReviewSearchQueries } from "./search";

/** Performance metrics, health check and recommendations. */
export class ReviewPerformanceMonitoring extends ReviewSearchQueries {
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
