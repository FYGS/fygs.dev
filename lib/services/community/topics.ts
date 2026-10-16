import { db } from "@/lib/db";
import type {
  CommunityTopic,
} from "@/types/community";

/** Topic listing and follow status. */
export class TopicQueries {
  /**
   * Get all topics with statistics and follow status
   */
  static async getTopics(userId?: string): Promise<CommunityTopic[]> {
    const topics = await db.topic.findMany({
      orderBy: [{ isDefault: "desc" }, { order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            discussions: true,
            followers: true,
          },
        },
        ...(userId && {
          followers: {
            where: { userId },
            take: 1,
          },
        }),
      },
    });

    return topics.map((topic) => ({
      ...topic,
      isFollowing: userId ? topic.followers?.length > 0 : false,
    })) as CommunityTopic[];
  }

  /**
   * Get topics followed by a user
   */
  static async getFollowedTopics(userId: string): Promise<CommunityTopic[]> {
    const followedTopics = await db.topicFollow.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            _count: {
              select: {
                discussions: true,
                followers: true,
              },
            },
          },
        },
      },
    });

    return followedTopics.map((follow) => follow.topic) as CommunityTopic[];
  }

  /**
   * Check if a user is following a specific topic
   */
  static async isFollowingTopic(
    userId: string,
    topicId: string
  ): Promise<boolean> {
    try {
      const follow = await db.topicFollow.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
      });

      return !!follow;
    } catch (error) {
      console.error("Error checking topic follow status:", error);
      return false;
    }
  }
}
