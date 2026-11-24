// Internal helper shared by the community action modules.
// Deliberately NOT a "use server" file: it must not become a public server action.

import { db } from "@/lib/db";

export async function checkAndAwardBadges(userId: string, action: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        discussions: true,
        discussionReplies: true,
        userBadges: true,
      },
    });

    if (!user) return;

    const badges = await db.badge.findMany({
      where: { isActive: true },
    });

    for (const badge of badges) {
      // Check if user already has this badge
      if (user.userBadges.some((ub: any) => ub.badgeId === badge.id)) continue;

      // Simple badge logic - can be extended
      let shouldAward = false;

      switch (badge.name) {
        case "First Post":
          shouldAward =
            action === "DISCUSSION_CREATED" && user.discussions.length === 1;
          break;
        case "Helpful Member":
          shouldAward = user.communityPoints >= 100;
          break;
        case "Active Contributor":
          shouldAward = user.discussions.length >= 10;
          break;
        case "Community Helper":
          shouldAward = user.discussionReplies.length >= 50;
          break;
      }

      if (shouldAward) {
        await db.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });

        // Create notification
        await db.notification.create({
          data: {
            recipientId: userId,
            type: "BADGE_EARNED",
            title: `Badge Earned: ${badge.name}`,
            message: badge.description,
            data: { badgeId: badge.id },
          },
        });

        // Send email notification for badge
        const { CommunityNotificationService } = await import(
          "@/lib/services/community-notification"
        );
        await CommunityNotificationService.notifyBadgeEarned(userId, badge);

        // Award bonus points
        await db.user.update({
          where: { id: userId },
          data: {
            communityPoints: { increment: badge.points },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking badges:", error);
  }
}
