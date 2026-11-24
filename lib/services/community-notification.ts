/**
 * Community Notification Service
 * Handles email notifications for community interactions
 */

import { db } from "@/lib/db";
import { emailService } from "@/lib/email-service";
import { logger } from "@/lib/structured-logger";
import {
  User,
  Discussion,
  DiscussionReply,
  MentorRequest,
  Badge,
} from "@/lib/generated/prisma/browser";

type ReplyWithAuthor = DiscussionReply & {
  author: User;
  discussion: Discussion;
};

type MentorRequestWithRelations = MentorRequest & {
  student: User;
  mentor: User;
};

export class CommunityNotificationService {
  /**
   * Send notification when someone replies to your discussion
   */
  static async notifyDiscussionReply(reply: ReplyWithAuthor): Promise<void> {
    try {
      const discussionAuthor = reply.discussion.authorId;

      // Don't notify if replying to own discussion
      if (discussionAuthor === reply.authorId) {
        return;
      }

      const author = await db.user.findUnique({
        where: { id: discussionAuthor },
        select: { email: true, name: true },
      });

      if (!author?.email) {
        logger.warn(
          "Discussion author email not found for reply notification",
          {
            metadata: {
              replyId: reply.id,
              discussionId: reply.discussionId,
              authorId: discussionAuthor,
            },
          }
        );
        return;
      }

      await emailService.sendDiscussionReplyNotification(author.email, {
        authorName: author.name || "User",
        replierName: reply.author.name || "A user",
        discussionTitle: reply.discussion.title,
        replyContent: reply.content.substring(0, 200),
        discussionId: reply.discussionId,
      });

      logger.info("Discussion reply notification sent", {
        eventType: "community.reply_notification",
        metadata: {
          replyId: reply.id,
          discussionId: reply.discussionId,
          recipientId: discussionAuthor,
        },
      });
    } catch (error) {
      logger.error("Error sending discussion reply notification", {
        metadata: {
          replyId: reply.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification when someone follows you
   */
  static async notifyNewFollower(
    followerId: string,
    followingId: string
  ): Promise<void> {
    try {
      const [follower, following] = await Promise.all([
        db.user.findUnique({
          where: { id: followerId },
          select: { name: true, image: true },
        }),
        db.user.findUnique({
          where: { id: followingId },
          select: { email: true, name: true },
        }),
      ]);

      if (!following?.email || !follower) {
        logger.warn("User data not found for follow notification", {
          metadata: { followerId, followingId },
        });
        return;
      }

      await emailService.sendNewFollowerNotification(following.email, {
        recipientName: following.name || "User",
        followerName: follower.name || "A user",
        followerAvatar: follower.image,
        followerId,
      });

      logger.info("New follower notification sent", {
        eventType: "community.follow_notification",
        metadata: {
          followerId,
          followingId,
        },
      });
    } catch (error) {
      logger.error("Error sending follow notification", {
        metadata: {
          followerId,
          followingId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification for mentor request
   */
  static async notifyMentorRequest(
    request: MentorRequestWithRelations
  ): Promise<void> {
    try {
      if (!request.mentor.email) {
        logger.warn("Mentor email not found for mentorship request", {
          metadata: {
            requestId: request.id,
            mentorId: request.mentorId,
          },
        });
        return;
      }

      await emailService.sendMentorRequestNotification(request.mentor.email, {
        mentorName: request.mentor.name || "Mentor",
        studentName: request.student.name || "A student",
        message: request.message,
        courseId: request.courseId,
        requestId: request.id,
      });

      logger.info("Mentor request notification sent", {
        eventType: "community.mentor_request_notification",
        metadata: {
          requestId: request.id,
          mentorId: request.mentorId,
          studentId: request.studentId,
        },
      });
    } catch (error) {
      logger.error("Error sending mentor request notification", {
        metadata: {
          requestId: request.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification when mentor responds to request
   */
  static async notifyMentorResponse(
    request: MentorRequestWithRelations,
    action: "accept" | "decline"
  ): Promise<void> {
    try {
      if (!request.student.email) {
        logger.warn("Student email not found for mentor response", {
          metadata: {
            requestId: request.id,
            studentId: request.studentId,
          },
        });
        return;
      }

      await emailService.sendMentorResponseNotification(request.student.email, {
        studentName: request.student.name || "Student",
        mentorName: request.mentor.name || "Mentor",
        action,
      });

      logger.info("Mentor response notification sent", {
        eventType: "community.mentor_response_notification",
        metadata: {
          requestId: request.id,
          studentId: request.studentId,
          action,
        },
      });
    } catch (error) {
      logger.error("Error sending mentor response notification", {
        metadata: {
          requestId: request.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send notification when user earns a badge
   */
  static async notifyBadgeEarned(userId: string, badge: Badge): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user?.email) {
        logger.warn("User email not found for badge notification", {
          metadata: {
            userId,
            badgeId: badge.id,
          },
        });
        return;
      }

      await emailService.sendBadgeEarnedNotification(user.email, {
        userName: user.name || "User",
        badgeName: badge.name,
        badgeDescription: badge.description,
        badgeIcon: badge.icon,
        points: badge.points,
      });

      logger.info("Badge earned notification sent", {
        eventType: "community.badge_earned_notification",
        metadata: {
          userId,
          badgeId: badge.id,
          badgeName: badge.name,
        },
      });
    } catch (error) {
      logger.error("Error sending badge earned notification", {
        metadata: {
          userId,
          badgeId: badge.id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Send digest notification for weekly community activity
   */
  static async sendWeeklyDigest(): Promise<void> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get active community users
      const activeUsers = await db.user.findMany({
        where: {
          email: {
            not: "",
          },
          lastActiveAt: {
            gte: oneWeekAgo,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      logger.info(`Sending weekly digest to ${activeUsers.length} users`, {
        eventType: "community.weekly_digest",
      });

      // Get top discussions from the week
      const topDiscussions = await db.discussion.findMany({
        where: {
          createdAt: {
            gte: oneWeekAgo,
          },
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          replies: {
            _count: "desc",
          },
        },
        take: 5,
      });

      // Send digest to each active user
      for (const user of activeUsers) {
        try {
          // Get user-specific stats
          const [userDiscussions, userReplies, userFollows, userBadges] =
            await Promise.all([
              db.discussion.count({
                where: {
                  authorId: user.id,
                  createdAt: { gte: oneWeekAgo },
                },
              }),
              db.discussionReply.count({
                where: {
                  authorId: user.id,
                  createdAt: { gte: oneWeekAgo },
                },
              }),
              db.userFollow.count({
                where: {
                  followingId: user.id,
                  createdAt: { gte: oneWeekAgo },
                },
              }),
              db.userBadge.findMany({
                where: {
                  userId: user.id,
                  earnedAt: { gte: oneWeekAgo },
                },
                include: {
                  badge: {
                    select: {
                      name: true,
                      icon: true,
                      points: true,
                    },
                  },
                },
              }),
            ]);

          const pointsEarned = userBadges.reduce(
            (sum, ub) => sum + ub.badge.points,
            0
          );

          await emailService.sendCommunityWeeklyDigest(user.email!, {
            userName: user.name || "User",
            weeklyStats: {
              totalDiscussions: userDiscussions,
              totalReplies: userReplies,
              pointsEarned,
              newFollowers: userFollows,
            },
            topDiscussions: topDiscussions.map((d) => ({
              id: d.id,
              title: d.title,
              replyCount: d._count.replies,
            })),
            newBadges: userBadges.map((ub) => ({
              name: ub.badge.name,
              icon: ub.badge.icon,
            })),
          });
        } catch (userError) {
          logger.error("Error sending weekly digest to user", {
            metadata: {
              userId: user.id,
              error:
                userError instanceof Error
                  ? userError.message
                  : String(userError),
            },
          });
        }
      }

      logger.info(`Weekly digest sent to ${activeUsers.length} users`, {
        eventType: "community.weekly_digest_completed",
      });
    } catch (error) {
      logger.error("Error sending weekly digest", {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
