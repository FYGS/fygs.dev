import { db } from "@/lib/db";
import { emailService } from "@/lib/email-service";
import { logger } from "@/lib/structured-logger";
import {
  Review,
  User,
  Course,
  ReviewReply,
  ReviewReport,
  ReportReason,
} from "@prisma/client";

type ReviewWithRelations = Review & {
  user: User;
  course: Course & {
    instructor?: User | null;
  };
};

type ReplyWithRelations = ReviewReply & {
  author: User;
  review: Review & {
    user: User;
    course: Course;
  };
};

type ReportWithRelations = ReviewReport & {
  reporter: User;
  review: Review & {
    user: User;
    course: Course;
  };
};

export class ReviewNotificationService {
  /**
   * Send notification when a new review is posted
   */
  static async notifyNewReview(review: ReviewWithRelations): Promise<void> {
    try {
      const instructor = review.course.instructor;

      if (!instructor?.email) {
        logger.warn("No instructor email found for review notification", {
          metadata: {
            reviewId: review.id,
            courseId: review.courseId,
          },
        });
        return;
      }

      const success = await emailService.sendNewReviewNotification(
        instructor.email,
        instructor.name || "Instructeur",
        {
          reviewerName: review.user.name || "Étudiant anonyme",
          courseTitle: review.course.title,
          rating: review.rating,
          comment: review.comment || undefined,
          courseSlug: review.course.slug,
          reviewId: review.id,
        }
      );

      if (success) {
        logger.info("Review notification sent to instructor", {
          eventType: "email.review_notification_sent",
          metadata: {
            reviewId: review.id,
            instructorId: instructor.id,
            instructorEmail: instructor.email,
            courseId: review.courseId,
            rating: review.rating,
          },
        });
      } else {
        logger.error("Failed to send review notification to instructor", {
          metadata: {
            reviewId: review.id,
            instructorId: instructor.id,
            instructorEmail: instructor.email,
          },
        });
      }
    } catch (error) {
      logger.error("Error sending review notification", {
        metadata: {
          reviewId: review.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification when instructor replies to a review
   */
  static async notifyInstructorReply(reply: ReplyWithRelations): Promise<void> {
    try {
      const student = reply.review.user;

      if (!student.email) {
        logger.warn("No student email found for reply notification", {
          metadata: {
            replyId: reply.id,
            reviewId: reply.reviewId,
            studentId: student.id,
          },
        });
        return;
      }

      const success = await emailService.sendInstructorReplyNotification(
        student.email,
        {
          studentName: student.name || "Étudiant",
          instructorName: reply.author.name || "Instructeur",
          courseTitle: reply.review.course.title,
          replyContent: reply.content,
          originalRating: reply.review.rating,
          courseSlug: reply.review.course.slug,
          reviewId: reply.reviewId,
        }
      );

      if (success) {
        logger.info("Reply notification sent to student", {
          eventType: "email.reply_notification_sent",
          metadata: {
            replyId: reply.id,
            reviewId: reply.reviewId,
            studentId: student.id,
            studentEmail: student.email,
            instructorId: reply.author.id,
          },
        });
      } else {
        logger.error("Failed to send reply notification to student", {
          metadata: {
            replyId: reply.id,
            studentId: student.id,
            studentEmail: student.email,
          },
        });
      }
    } catch (error) {
      logger.error("Error sending reply notification", {
        metadata: {
          replyId: reply.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification when a review is reported
   */
  static async notifyReviewReported(
    report: ReportWithRelations
  ): Promise<void> {
    try {
      // Get all admin and moderator emails
      const moderators = await db.user.findMany({
        where: {
          role: {
            in: ["ADMIN", "INSTRUCTOR"],
          },
          email: {
            not: "",
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (moderators.length === 0) {
        logger.warn("No moderators found for report notification", {
          metadata: {
            reportId: report.id,
            reviewId: report.reviewId,
          },
        });
        return;
      }

      const reportReasonMap: Record<ReportReason, string> = {
        SPAM: "Spam",
        INAPPROPRIATE: "Contenu inapproprié",
        FAKE: "Faux avis",
        OFFENSIVE: "Contenu offensant",
        COPYRIGHT: "Violation de droits d'auteur",
        OTHER: "Autre",
      };

      // Send notification to all moderators
      const notificationPromises = moderators.map(async (moderator) => {
        if (!moderator.email) return false;

        return emailService.sendReviewReportedNotification(moderator.email, {
          moderatorName: moderator.name || "Modérateur",
          reporterName: report.reporter.name || "Utilisateur anonyme",
          reviewerName: report.review.user.name || "Utilisateur anonyme",
          courseTitle: report.review.course.title,
          rating: report.review.rating,
          comment: report.review.comment || undefined,
          reportReason: reportReasonMap[report.reason],
          reportDetails: report.details || undefined,
          reviewId: report.reviewId,
        });
      });

      const results = await Promise.allSettled(notificationPromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value === true
      ).length;

      logger.info("Report notifications sent to moderators", {
        eventType: "email.report_notifications_sent",
        metadata: {
          reportId: report.id,
          reviewId: report.reviewId,
          totalModerators: moderators.length,
          successfulNotifications: successCount,
        },
      });
    } catch (error) {
      logger.error("Error sending report notifications", {
        metadata: {
          reportId: report.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification when a review receives helpful votes
   */
  static async notifyHelpfulVote(
    reviewId: string,
    totalHelpfulVotes: number
  ): Promise<void> {
    try {
      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: {
          user: true,
          course: true,
        },
      });

      if (!review || !review.user.email) {
        logger.warn(
          "Review or user email not found for helpful vote notification",
          {
            metadata: {
              reviewId,
              hasReview: !!review,
              hasEmail: !!review?.user.email,
            },
          }
        );
        return;
      }

      const success = await emailService.sendReviewHelpfulVoteNotification(
        review.user.email,
        {
          reviewerName: review.user.name || "Utilisateur",
          courseTitle: review.course.title,
          rating: review.rating,
          totalHelpfulVotes,
          courseSlug: review.course.slug,
          reviewId: review.id,
        }
      );

      if (success) {
        logger.info("Helpful vote notification sent", {
          eventType: "email.helpful_vote_notification_sent",
          metadata: {
            reviewId,
            userId: review.userId,
            totalHelpfulVotes,
          },
        });
      }
    } catch (error) {
      logger.error("Error sending helpful vote notification", {
        metadata: {
          reviewId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send weekly review summary to instructors
   */
  static async sendWeeklyReviewSummaries(): Promise<void> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get instructors with reviews in the past week
      const instructorsWithReviews = await db.user.findMany({
        where: {
          role: "INSTRUCTOR",
          email: {
            not: "",
          },
          instructedCourses: {
            some: {
              reviews: {
                some: {
                  createdAt: {
                    gte: oneWeekAgo,
                  },
                },
              },
            },
          },
        },
        include: {
          instructedCourses: {
            include: {
              reviews: {
                where: {
                  createdAt: {
                    gte: oneWeekAgo,
                  },
                },
                include: {
                  replies: true,
                },
              },
            },
          },
        },
      });

      const summaryPromises = instructorsWithReviews.map(
        async (instructor: any) => {
          if (!instructor.email) return;

          const allReviews = instructor.instructedCourses.flatMap(
            (course: any) => course.reviews
          );
          const totalReviews = allReviews.length;
          const averageRating =
            totalReviews > 0
              ? allReviews.reduce(
                  (sum: number, review: any) => sum + review.rating,
                  0
                ) / totalReviews
              : 0;
          const positiveReviews = allReviews.filter(
            (review: any) => review.rating >= 4
          ).length;
          const repliedReviews = allReviews.filter(
            (review: any) => review.replies.length > 0
          ).length;
          const responseRate =
            totalReviews > 0 ? (repliedReviews / totalReviews) * 100 : 0;

          const topCourses = instructor.instructedCourses
            .filter((course: any) => course.reviews.length > 0)
            .map((course: any) => ({
              title: course.title,
              slug: course.slug,
              newReviews: course.reviews.length,
              averageRating:
                course.reviews.reduce(
                  (sum: number, review: any) => sum + review.rating,
                  0
                ) / course.reviews.length,
            }))
            .sort((a: any, b: any) => b.newReviews - a.newReviews)
            .slice(0, 5);

          return emailService.sendWeeklyReviewSummary(instructor.email!, {
            instructorName: instructor.name || "Instructeur",
            weeklyStats: {
              totalReviews,
              averageRating,
              positiveReviews,
              responseRate,
            },
            topCourses,
          });
        }
      );

      const results = await Promise.allSettled(summaryPromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value === true
      ).length;

      logger.info("Weekly review summaries sent", {
        eventType: "email.weekly_summaries_sent",
        metadata: {
          totalInstructors: instructorsWithReviews.length,
          successfulSummaries: successCount,
        },
      });
    } catch (error) {
      logger.error("Error sending weekly review summaries", {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send bulk notifications for multiple reviews (e.g., during imports)
   */
  static async sendBulkReviewNotifications(reviewIds: string[]): Promise<void> {
    try {
      const reviews = await db.review.findMany({
        where: {
          id: {
            in: reviewIds,
          },
        },
        include: {
          user: true,
          course: {
            include: {
              instructor: true,
            },
          },
        },
      });

      // Group by instructor to avoid spam
      const reviewsByInstructor = new Map<string, ReviewWithRelations[]>();

      reviews.forEach((review) => {
        const instructorId = review.course.instructor?.id;
        if (instructorId) {
          if (!reviewsByInstructor.has(instructorId)) {
            reviewsByInstructor.set(instructorId, []);
          }
          reviewsByInstructor
            .get(instructorId)!
            .push(review as ReviewWithRelations);
        }
      });

      // Send grouped notifications
      for (const [instructorId, instructorReviews] of reviewsByInstructor) {
        // For bulk notifications, send a summary instead of individual emails
        if (instructorReviews.length > 1) {
          logger.info("Bulk review notifications grouped for instructor", {
            metadata: {
              instructorId,
              reviewCount: instructorReviews.length,
            },
          });
          // Implementation could send a digest email here
        } else {
          await this.notifyNewReview(instructorReviews[0]);
        }
      }
    } catch (error) {
      logger.error("Error sending bulk review notifications", {
        metadata: {
          reviewIds,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
