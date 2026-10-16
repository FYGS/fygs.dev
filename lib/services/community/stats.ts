import { db } from "@/lib/db";
import type {
  CommunityDiscussion,
  CommunityTopic,
  CommunityUser,
  CommunityStats,
} from "@/types/community";

/** Community-wide statistics and their helper queries. */
export class StatsQueries {
  /**
   * Get community statistics
   */
  static async getCommunityStats(): Promise<CommunityStats> {
    const [
      totalUsers,
      totalDiscussions,
      totalReplies,
      activeUsers,
      topContributors,
      trendingTopics,
      recentActivity,
    ] = await Promise.all([
      db.user.count(),
      db.discussion.count({ where: { status: "ACTIVE" } }),
      db.discussionReply.count(),
      db.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      StatsQueries.getTopContributors(5),
      StatsQueries.getTrendingTopics(5),
      StatsQueries.getRecentActivity(10),
    ]);

    return {
      totalUsers,
      totalDiscussions,
      totalReplies,
      activeUsers,
      topContributors,
      trendingTopics,
      recentActivity,
    };
  }

  private static async getTopContributors(
    limit: number
  ): Promise<CommunityUser[]> {
    const users = await db.user.findMany({
      orderBy: {
        communityPoints: "desc",
      },
      take: limit,
      include: {
        userBadges: {
          include: { badge: true },
        },
        _count: {
          select: {
            discussions: true,
            discussionReplies: true,
            discussionVotes: true,
          },
        },
      },
    });

    return users as CommunityUser[];
  }

  private static async getTrendingTopics(
    limit: number
  ): Promise<CommunityTopic[]> {
    const topics = await db.topic.findMany({
      orderBy: {
        discussions: {
          _count: "desc",
        },
      },
      take: limit,
      include: {
        _count: {
          select: {
            discussions: true,
            followers: true,
          },
        },
      },
    });

    return topics as CommunityTopic[];
  }

  private static async getRecentActivity(
    limit: number
  ): Promise<CommunityDiscussion[]> {
    const discussions = await db.discussion.findMany({
      where: { status: "ACTIVE" },
      orderBy: { lastActivityAt: "desc" },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            communityLevel: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            replies: true,
            votes: true,
            bookmarks: true,
          },
        },
      },
    });

    return discussions as CommunityDiscussion[];
  }
}
