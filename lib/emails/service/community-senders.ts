import { ModernEmailTemplates } from "../templates";

import { ReviewEmailSenders } from "./review-senders";

/** Community notification senders. */
export class CommunityEmailSenders extends ReviewEmailSenders {
  // ============ COMMUNITY NOTIFICATION METHODS ============

  /**
   * Send notification when someone replies to a discussion
   */
  async sendDiscussionReplyNotification(
    recipientEmail: string,
    replyData: {
      authorName: string;
      replierName: string;
      discussionTitle: string;
      replyContent: string;
      discussionId: string;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.discussionReply(replyData);

    return this.sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification when someone follows you
   */
  async sendNewFollowerNotification(
    recipientEmail: string,
    followerData: {
      recipientName: string;
      followerName: string;
      followerAvatar?: string | null;
      followerId: string;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.newFollower(followerData);

    return this.sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification for mentor request
   */
  async sendMentorRequestNotification(
    mentorEmail: string,
    requestData: {
      mentorName: string;
      studentName: string;
      message?: string | null;
      courseId?: string | null;
      requestId: string;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.mentorRequest(requestData);

    return this.sendEmail({
      to: mentorEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification when mentor responds to request
   */
  async sendMentorResponseNotification(
    studentEmail: string,
    responseData: {
      studentName: string;
      mentorName: string;
      action: "accept" | "decline";
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.mentorResponse(responseData);

    return this.sendEmail({
      to: studentEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send notification when user earns a badge
   */
  async sendBadgeEarnedNotification(
    userEmail: string,
    badgeData: {
      userName: string;
      badgeName: string;
      badgeDescription: string;
      badgeIcon: string;
      points: number;
    }
  ): Promise<boolean> {
    const template = ModernEmailTemplates.badgeEarned(badgeData);

    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send weekly digest of community activity
   */
  async sendCommunityWeeklyDigest(
    userEmail: string,
    digestData: {
      userName: string;
      weeklyStats: {
        totalDiscussions: number;
        totalReplies: number;
        pointsEarned: number;
        newFollowers: number;
      };
      topDiscussions: Array<{
        id: string;
        title: string;
        replyCount: number;
      }>;
      newBadges: Array<{
        name: string;
        icon: string;
      }>;
    }
  ): Promise<boolean> {
    // Only send if there's meaningful activity
    if (
      digestData.weeklyStats.pointsEarned === 0 &&
      digestData.newBadges.length === 0
    ) {
      return true; // Skip but return success
    }

    const template = ModernEmailTemplates.communityWeeklyDigest(digestData);

    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }
}
