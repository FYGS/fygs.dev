import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";

/** Bulk write operations. */
export class ReviewBulkOperations {
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
}
