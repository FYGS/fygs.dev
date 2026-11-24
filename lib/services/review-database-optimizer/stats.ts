import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";
import { ReviewBulkOperations } from "./bulk";

/** Aggregation and dashboard queries. */
export class ReviewStatsQueries extends ReviewBulkOperations {
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

      // Weighted by the number of reviews per star level (averaging the groups
      // would give 3 for four reviews rated 5, 5, 5 and 1)
      const averageRating =
        totalCount > 0
          ? reviewStats.reduce(
              (sum: number, stat: any) => sum + stat.rating * stat._count.rating,
              0
            ) / totalCount
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
}
