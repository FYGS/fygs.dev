import { ModernEmailTemplates } from "../templates";

import { TransactionalEmailSenders } from "./transactional-senders";

/** Review notification senders. */
export class ReviewEmailSenders extends TransactionalEmailSenders {
  // ============ REVIEW NOTIFICATION METHODS ============

  /**
   * Send notification to instructor when a new review is posted
   */
  async sendNewReviewNotification(
    instructorEmail: string,
    instructorName: string,
    reviewData: {
      reviewerName: string;
      courseTitle: string;
      rating: number;
      comment?: string;
      courseSlug: string;
      reviewId: string;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.newReviewForInstructor({
      instructorName,
      ...reviewData,
    });

    return this.sendEmail({
      to: instructorEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification to student when instructor replies to their review
   */
  async sendInstructorReplyNotification(
    studentEmail: string,
    replyData: {
      studentName: string;
      instructorName: string;
      courseTitle: string;
      replyContent: string;
      originalRating: number;
      courseSlug: string;
      reviewId: string;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.instructorReplyToReview(replyData);

    return this.sendEmail({
      to: studentEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification to moderators when a review is reported
   */
  async sendReviewReportedNotification(
    moderatorEmail: string,
    reportData: {
      moderatorName: string;
      reporterName: string;
      reviewerName: string;
      courseTitle: string;
      rating: number;
      comment?: string;
      reportReason: string;
      reportDetails?: string;
      reviewId: string;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.reviewReported(reportData);

    return this.sendEmail({
      to: moderatorEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification when a review receives helpful votes
   */
  async sendReviewHelpfulVoteNotification(
    reviewerEmail: string,
    voteData: {
      reviewerName: string;
      courseTitle: string;
      rating: number;
      totalHelpfulVotes: number;
      courseSlug: string;
      reviewId: string;
    }
  ): Promise<boolean> {
    // Only send notifications for milestone votes (1st, 5th, 10th, etc.)
    const milestones = [1, 5, 10, 25, 50, 100];
    if (!milestones.includes(voteData.totalHelpfulVotes)) {
      return true; // Skip notification but return success
    }

    const template = ModernEmailTemplates.reviewHelpfulVote(voteData);

    return this.sendEmail({
      to: reviewerEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send weekly review summary to instructors
   */
  async sendWeeklyReviewSummary(
    instructorEmail: string,
    summaryData: {
      instructorName: string;
      weeklyStats: {
        totalReviews: number;
        averageRating: number;
        positiveReviews: number;
        responseRate: number;
      };
      topCourses: Array<{
        title: string;
        slug: string;
        newReviews: number;
        averageRating: number;
      }>;
    }
  ): Promise<boolean> {
    // Only send if there's meaningful activity
    if (summaryData.weeklyStats.totalReviews === 0) {
      return true; // Skip but return success
    }

    const template = ModernEmailTemplates.weeklyReviewSummary(summaryData);

    return this.sendEmail({
      to: instructorEmail,
      subject: template.subject,
      html: template.html,
    });
  }
}
