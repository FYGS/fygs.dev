import { db } from "@/lib/db";
import { Role, ReviewStatus } from "@prisma/client";
import { logger } from "@/lib/structured-logger";

/**
 * Comprehensive Review Permissions and Validation Service
 * Handles user permissions, enrollment verification, and content validation
 */
export class ReviewPermissionsService {
  /**
   * Check if user can create a review for a specific course
   */
  static async canCreateReview(
    userId: string,
    courseId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiresAction?: string;
  }> {
    try {
      // Get user and check if they exist
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          enrollments: {
            where: { courseId },
            include: { course: true },
          },
          reviews: {
            where: { courseId },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!user) {
        return { allowed: false, reason: "Utilisateur non trouvé" };
      }

      // Check if user is suspended (role check - no SUSPENDED role in enum)
      // Note: Suspension would be handled by a separate field or system

      // Check enrollment requirement
      const enrollment = user.enrollments[0];
      if (!enrollment) {
        return {
          allowed: false,
          reason:
            "Vous devez être inscrit à cette formation pour laisser un avis",
          requiresAction: "enroll",
        };
      }

      // Check if course requires completion for reviews (removed as not in schema)
      if (enrollment.completedAt === null) {
        // Only check completion for advanced features, not as a hard requirement
        // This could be configurable per course in the future
      }

      // Check if user has already reviewed this course
      if (user.reviews.length > 0) {
        return {
          allowed: false,
          reason: "Vous avez déjà laissé un avis pour cette formation",
        };
      }

      // Check cooldown period for new users
      const accountAge = Date.now() - user.createdAt.getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

      if (daysSinceCreation < 1) {
        return {
          allowed: false,
          reason: "Vous devez attendre 24h après création de votre compte",
        };
      }

      // Check minimum time since enrollment
      const enrollmentAge = Date.now() - enrollment.enrolledAt.getTime();
      const hoursSinceEnrollment = enrollmentAge / (1000 * 60 * 60);

      if (hoursSinceEnrollment < 1) {
        return {
          allowed: false,
          reason: "Vous devez attendre au moins 1 heure après inscription",
        };
      }

      // All checks passed
      return { allowed: true };
    } catch (error) {
      logger.error("Error checking review permissions", {
        metadata: { userId, courseId, error },
      });
      return {
        allowed: false,
        reason: "Erreur lors de la vérification des permissions",
      };
    }
  }

  /**
   * Check if user can edit a specific review
   */
  static async canEditReview(
    userId: string,
    reviewId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: { user: true },
      });

      if (!review) {
        return { allowed: false, reason: "Avis non trouvé" };
      }

      // Only review author can edit
      if (review.userId !== userId) {
        return {
          allowed: false,
          reason: "Vous ne pouvez modifier que vos propres avis",
        };
      }

      // Check if review is approved (can't edit rejected reviews)
      if (review.status === ReviewStatus.REJECTED) {
        return {
          allowed: false,
          reason: "Impossible de modifier un avis rejeté",
        };
      }

      // Check edit time limit (24 hours)
      const timeSinceCreation = Date.now() - review.createdAt.getTime();
      const hoursSinceCreation = timeSinceCreation / (1000 * 60 * 60);

      if (hoursSinceCreation > 24) {
        return { allowed: false, reason: "Délai de modification expiré (24h)" };
      }

      return { allowed: true };
    } catch (error) {
      logger.error("Error checking edit permissions", {
        metadata: { userId, reviewId, error },
      });
      return { allowed: false, reason: "Erreur lors de la vérification" };
    }
  }

  /**
   * Check if user can delete a specific review
   */
  static async canDeleteReview(
    userId: string,
    reviewId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { allowed: false, reason: "Utilisateur non trouvé" };
      }

      const review = await db.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        return { allowed: false, reason: "Avis non trouvé" };
      }

      // Admins can delete any review
      if (user.role === Role.ADMIN) {
        return { allowed: true };
      }

      // Users can only delete their own reviews
      if (review.userId !== userId) {
        return {
          allowed: false,
          reason: "Vous ne pouvez supprimer que vos propres avis",
        };
      }

      // Check delete time limit (72 hours)
      const timeSinceCreation = Date.now() - review.createdAt.getTime();
      const hoursSinceCreation = timeSinceCreation / (1000 * 60 * 60);

      if (hoursSinceCreation > 72) {
        return { allowed: false, reason: "Délai de suppression expiré (72h)" };
      }

      return { allowed: true };
    } catch (error) {
      logger.error("Error checking delete permissions", {
        metadata: { userId, reviewId, error },
      });
      return { allowed: false, reason: "Erreur lors de la vérification" };
    }
  }

  /**
   * Check if user can reply to a review
   */
  static async canReplyToReview(
    userId: string,
    reviewId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { allowed: false, reason: "Utilisateur non trouvé" };
      }

      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: {
          course: {
            include: { instructor: true },
          },
        },
      });

      if (!review) {
        return { allowed: false, reason: "Avis non trouvé" };
      }

      // Only course instructor and admins can reply
      const isInstructor = review.course.instructor?.id === userId;
      const isAdmin = user.role === Role.ADMIN;

      if (!isInstructor && !isAdmin) {
        return {
          allowed: false,
          reason: "Seul l'instructeur de la formation peut répondre",
        };
      }

      // Check if review is approved
      if (review.status !== ReviewStatus.APPROVED) {
        return {
          allowed: false,
          reason: "Impossible de répondre à un avis non approuvé",
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error("Error checking reply permissions", {
        metadata: { userId, reviewId, error },
      });
      return { allowed: false, reason: "Erreur lors de la vérification" };
    }
  }

  /**
   * Check if user can vote on a review
   */
  static async canVoteOnReview(
    userId: string,
    reviewId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { allowed: false, reason: "Utilisateur non trouvé" };
      }

      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: {
          votes: {
            where: { userId },
          },
        },
      });

      if (!review) {
        return { allowed: false, reason: "Avis non trouvé" };
      }

      // Users can't vote on their own reviews
      if (review.userId === userId) {
        return {
          allowed: false,
          reason: "Vous ne pouvez pas voter sur votre propre avis",
        };
      }

      // Check if user already voted
      if (review.votes.length > 0) {
        return { allowed: false, reason: "Vous avez déjà voté sur cet avis" };
      }

      // Check if review is approved
      if (review.status !== ReviewStatus.APPROVED) {
        return {
          allowed: false,
          reason: "Impossible de voter sur un avis non approuvé",
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error("Error checking vote permissions", {
        metadata: { userId, reviewId, error },
      });
      return { allowed: false, reason: "Erreur lors de la vérification" };
    }
  }

  /**
   * Check if user can report a review
   */
  static async canReportReview(
    userId: string,
    reviewId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { allowed: false, reason: "Utilisateur non trouvé" };
      }

      const review = await db.review.findUnique({
        where: { id: reviewId },
        include: {
          reports: {
            where: { userId },
          },
        },
      });

      if (!review) {
        return { allowed: false, reason: "Avis non trouvé" };
      }

      // Users can't report their own reviews
      if (review.userId === userId) {
        return {
          allowed: false,
          reason: "Vous ne pouvez pas signaler votre propre avis",
        };
      }

      // Check if user already reported
      if (review.reports.length > 0) {
        return { allowed: false, reason: "Vous avez déjà signalé cet avis" };
      }

      return { allowed: true };
    } catch (error) {
      logger.error("Error checking report permissions", {
        metadata: { userId, reviewId, error },
      });
      return { allowed: false, reason: "Erreur lors de la vérification" };
    }
  }

  /**
   * Get comprehensive permissions for a user on a specific review
   */
  static async getReviewPermissions(userId: string, reviewId: string) {
    const [canEdit, canDelete, canReply, canVote, canReport] =
      await Promise.all([
        this.canEditReview(userId, reviewId),
        this.canDeleteReview(userId, reviewId),
        this.canReplyToReview(userId, reviewId),
        this.canVoteOnReview(userId, reviewId),
        this.canReportReview(userId, reviewId),
      ]);

    return {
      canEdit: canEdit.allowed,
      canDelete: canDelete.allowed,
      canReply: canReply.allowed,
      canVote: canVote.allowed,
      canReport: canReport.allowed,
      reasons: {
        edit: canEdit.reason,
        delete: canDelete.reason,
        reply: canReply.reason,
        vote: canVote.reason,
        report: canReport.reason,
      },
    };
  }

  /**
   * Check rate limiting for review actions
   */
  static async checkRateLimit(
    userId: string,
    action: "create" | "edit" | "delete" | "vote" | "report"
  ): Promise<{
    allowed: boolean;
    reason?: string;
    resetTime?: Date;
  }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let count = 0;
      let limit = 0;
      let timeWindow = "";

      switch (action) {
        case "create":
          // Max 3 reviews per day
          count = await db.review.count({
            where: {
              userId,
              createdAt: { gte: oneDayAgo },
            },
          });
          limit = 3;
          timeWindow = "24 heures";
          break;

        case "edit":
          // Max 5 edits per hour
          count = await db.review.count({
            where: {
              userId,
              updatedAt: { gte: oneHourAgo },
            },
          });
          limit = 5;
          timeWindow = "1 heure";
          break;

        case "vote":
          // Max 50 votes per day
          count = await db.reviewVote.count({
            where: {
              userId,
              createdAt: { gte: oneDayAgo },
            },
          });
          limit = 50;
          timeWindow = "24 heures";
          break;

        case "report":
          // Max 10 reports per day
          count = await db.reviewReport.count({
            where: {
              userId,
              createdAt: { gte: oneDayAgo },
            },
          });
          limit = 10;
          timeWindow = "24 heures";
          break;

        default:
          return { allowed: true };
      }

      if (count >= limit) {
        const resetTime =
          action === "edit"
            ? new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
            : new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

        return {
          allowed: false,
          reason: `Limite atteinte: ${count}/${limit} ${action}s en ${timeWindow}`,
          resetTime,
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error("Error checking rate limit", {
        metadata: { userId, action, error },
      });
      return { allowed: false, reason: "Erreur lors de la vérification" };
    }
  }
}
