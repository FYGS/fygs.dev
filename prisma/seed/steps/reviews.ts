import {
  ReviewStatus,
  type PrismaClient,
  type Review,
} from "../../../lib/generated/prisma/client";
import { randomDate, randomBetween } from "../utils";
import { authenticReviews } from "../data/reviews";
import type { EnrollmentWithRelations } from "../types";

/** Course reviews. */
export async function seedReviews(
  prisma: PrismaClient,
): Promise<{ createdReviews: Review[]; enrollments: EnrollmentWithRelations[] }> {
  // 9. Create comprehensive review system with interactions
  console.log("⭐ Building comprehensive review system...");

  // Get all enrollments to create reviews
  const enrollments = await prisma.enrollment.findMany({
    include: {
      course: true,
      user: true,
    },
  });

  const createdReviews = [];

  for (
    let i = 0;
    i < Math.min(enrollments.length, authenticReviews.length * 2);
    i++
  ) {
    const enrollment = enrollments[i];
    const reviewTemplate = authenticReviews[i % authenticReviews.length];

    // Only create reviews for completed enrollments or random chance
    if (enrollment.completedAt || Math.random() < 0.4) {
      const review = await prisma.review.create({
        data: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          rating: reviewTemplate.rating,
          comment: reviewTemplate.comment,
          verified: reviewTemplate.verified && !!enrollment.completedAt,
          helpfulCount: randomBetween(0, 15),
          status:
            Math.random() < 0.95
              ? ReviewStatus.APPROVED
              : ReviewStatus.PENDING,
          createdAt: randomDate(
            enrollment.enrolledAt,
            enrollment.completedAt || new Date()
          ),
        },
      });
      createdReviews.push(review);
    }
  }
  console.log(`✅ Created ${createdReviews.length} authentic reviews`);

  return { createdReviews, enrollments };
}
