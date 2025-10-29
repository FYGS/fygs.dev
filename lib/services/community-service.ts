/**
 * Community Service Layer
 * Comprehensive service for forum operations with advanced features
 */

import { db } from "@/lib/db";
import type {
  CommunityDiscussion,
  CommunityReply,
  CommunityTopic,
  CommunityUser,
  DiscussionFilters,
  DiscussionsResponse,
  CommunityStats,
  RecommendationEngine,
  DiscussionSortType,
  CommunityNotification,
} from "@/types/community";
import { Prisma } from "@prisma/client";

export class CommunityService {
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
   * Get discussions with advanced filtering and sorting
   */
  static async getDiscussions(
    filters: DiscussionFilters,
    userId?: string
  ): Promise<DiscussionsResponse> {
    const { page, limit, sort, topicId, courseId, tags, authorId, status } =
      filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.DiscussionWhereInput = {
      status: "ACTIVE",
      ...(topicId && { topicId }),
      ...(courseId && { courseId }),
      ...(authorId && { authorId }),
      ...(tags?.length && {
        tags: {
          hasSome: tags,
        },
      }),
      ...(status === "solved" && { isSolved: true }),
      ...(status === "unsolved" && { isSolved: false }),
      ...(status === "pinned" && { isPinned: true }),
    };

    // Build order by clause
    const orderBy = this.getDiscussionOrderBy(sort);

    // Get discussions
    const [discussions, total] = await Promise.all([
      db.discussion.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          ...(userId && {
            votes: {
              where: { userId },
              take: 1,
            },
            bookmarks: {
              where: { userId },
              take: 1,
            },
          }),
        },
      }),
      db.discussion.count({ where }),
    ]);

    const enrichedDiscussions = discussions.map((discussion) => ({
      ...discussion,
      userVote: userId ? discussion.votes?.[0] || null : null,
      isBookmarked: userId ? (discussion.bookmarks?.length || 0) > 0 : false,
    })) as CommunityDiscussion[];

    return {
      discussions: enrichedDiscussions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        topic: topicId,
        course: courseId,
        tags,
        sort,
      },
    };
  }

  /**
   * Get a single discussion with full details
   */
  static async getDiscussion(
    slug: string,
    topicSlug: string,
    userId?: string
  ): Promise<CommunityDiscussion | null> {
    // Increment view count
    await db.discussion.updateMany({
      where: {
        slug,
        topic: { slug: topicSlug },
      },
      data: {
        viewCount: { increment: 1 },
      },
    });

    const discussion = await db.discussion.findFirst({
      where: {
        slug,
        topic: { slug: topicSlug },
      },
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
        ...(userId && {
          votes: {
            where: { userId },
            take: 1,
          },
          bookmarks: {
            where: { userId },
            take: 1,
          },
        }),
      },
    });

    if (!discussion) return null;

    return {
      ...discussion,
      userVote: userId ? discussion.votes?.[0] || null : null,
      isBookmarked: userId ? (discussion.bookmarks?.length || 0) > 0 : false,
    } as CommunityDiscussion;
  }

  /**
   * Get a discussion by ID with optional replies
   */
  static async getDiscussionById(
    discussionId: string,
    options: { userId?: string; includeReplies?: boolean } = {}
  ): Promise<CommunityDiscussion | null> {
    const { userId, includeReplies = false } = options;

    try {
      // Increment view count
      await db.discussion.updateMany({
        where: { id: discussionId },
        data: { viewCount: { increment: 1 } },
      });

      const discussion = await db.discussion.findFirst({
        where: { id: discussionId, status: "ACTIVE" },
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
          ...(includeReplies && {
            replies: {
              where: { parentId: null },
              orderBy: { createdAt: "asc" },
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
                _count: {
                  select: {
                    votes: true,
                    children: true,
                  },
                },
                children: {
                  orderBy: { createdAt: "asc" },
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
                    _count: {
                      select: {
                        votes: true,
                        children: true,
                      },
                    },
                  },
                },
                ...(userId && {
                  votes: {
                    where: { userId },
                    select: { voteType: true },
                    take: 1,
                  },
                }),
              },
            },
          }),
          ...(userId && {
            votes: {
              where: { userId },
              select: { voteType: true },
              take: 1,
            },
            bookmarks: {
              where: { userId },
              select: { id: true },
              take: 1,
            },
          }),
        },
      });

      if (!discussion) {
        return null;
      }

      const enrichedDiscussion = {
        ...discussion,
        userVote: discussion.votes?.[0] || null,
        isBookmarked: discussion.bookmarks?.length > 0 || false,
        replies: discussion.replies?.map((reply: any) => ({
          ...reply,
          userVote: reply.votes?.[0] || null,
          children: reply.children?.map((child: any) => ({
            ...child,
            userVote: child.votes?.[0] || null,
          })),
        })),
      };

      return enrichedDiscussion as CommunityDiscussion;
    } catch (error) {
      console.error("Error fetching discussion:", error);
      return null;
    }
  }

  /**
   * Get replies for a discussion with nested structure
   */
  static async getReplies(
    discussionId: string,
    userId?: string
  ): Promise<CommunityReply[]> {
    const replies = await db.discussionReply.findMany({
      where: {
        discussionId,
        parentId: null, // Top-level replies only
      },
      orderBy: [
        { isAccepted: "desc" },
        { upvoteCount: "desc" },
        { createdAt: "asc" },
      ],
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
        children: {
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
            _count: {
              select: {
                votes: true,
                children: true,
              },
            },
            ...(userId && {
              votes: {
                where: { userId },
                take: 1,
              },
            }),
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            votes: true,
            children: true,
          },
        },
        ...(userId && {
          votes: {
            where: { userId },
            take: 1,
          },
        }),
      },
    });

    return replies.map((reply) => ({
      ...reply,
      userVote: userId ? reply.votes?.[0] || null : null,
      children: reply.children?.map((child) => ({
        ...child,
        userVote: userId ? child.votes?.[0] || null : null,
      })),
    })) as CommunityReply[];
  }

  /**
   * Search discussions with full-text search
   */
  static async searchDiscussions(
    query: string,
    filters: Partial<DiscussionFilters> = {},
    userId?: string
  ): Promise<DiscussionsResponse> {
    const { page = 1, limit = 20, sort = "latest" } = filters;
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: Prisma.DiscussionWhereInput = {
      status: "ACTIVE",
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          tags: {
            hasSome: [query],
          },
        },
      ],
      ...(filters.topicId && { topicId: filters.topicId }),
      ...(filters.courseId && { courseId: filters.courseId }),
      ...(filters.authorId && { authorId: filters.authorId }),
    };

    const orderBy = this.getDiscussionOrderBy(sort);

    const [discussions, total] = await Promise.all([
      db.discussion.findMany({
        where: searchConditions,
        skip,
        take: limit,
        orderBy,
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
          ...(userId && {
            votes: {
              where: { userId },
              take: 1,
            },
            bookmarks: {
              where: { userId },
              take: 1,
            },
          }),
        },
      }),
      db.discussion.count({ where: searchConditions }),
    ]);

    const enrichedDiscussions = discussions.map((discussion) => ({
      ...discussion,
      userVote: userId ? discussion.votes?.[0] || null : null,
      isBookmarked: userId ? (discussion.bookmarks?.length || 0) > 0 : false,
    })) as CommunityDiscussion[];

    return {
      discussions: enrichedDiscussions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        ...filters,
        sort,
      },
    };
  }

  /**
   * Get trending discussions based on engagement
   */
  static async getTrendingDiscussions(
    limit: number = 10,
    userId?: string
  ): Promise<CommunityDiscussion[]> {
    const discussions = await db.discussion.findMany({
      where: {
        status: "ACTIVE",
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: limit,
      orderBy: [
        { lastActivityAt: "desc" },
        { upvoteCount: "desc" },
        { replyCount: "desc" },
        { viewCount: "desc" },
      ],
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
        ...(userId && {
          votes: {
            where: { userId },
            take: 1,
          },
          bookmarks: {
            where: { userId },
            take: 1,
          },
        }),
      },
    });

    return discussions.map((discussion) => ({
      ...discussion,
      userVote: userId ? discussion.votes?.[0] || null : null,
      isBookmarked: userId ? (discussion.bookmarks?.length || 0) > 0 : false,
    })) as CommunityDiscussion[];
  }

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
      this.getTopContributors(5),
      this.getTrendingTopics(5),
      this.getRecentActivity(10),
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

  /**
   * Get user profile with community stats
   */
  static async getUserProfile(userId: string): Promise<CommunityUser | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: "desc" },
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

    return user as CommunityUser | null;
  }

  /**
   * Get personalized recommendations for a user
   */
  static async getRecommendations(
    userId: string
  ): Promise<RecommendationEngine> {
    // Get user's interests based on their activity
    const userActivity = await db.user.findUnique({
      where: { id: userId },
      include: {
        discussions: {
          include: { topic: true },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        followedTopics: {
          include: { topic: true },
        },
        enrollments: {
          include: { course: true },
        },
      },
    });

    if (!userActivity) {
      return {
        discussions: [],
        topics: [],
        mentors: [],
        reasons: [],
      };
    }

    // Get topic IDs from user's activity
    const topicIds = [
      ...userActivity.discussions.map((d) => d.topicId),
      ...userActivity.followedTopics.map((f) => f.topicId),
    ];

    const courseIds = userActivity.enrollments.map((e) => e.courseId);

    // Get recommended discussions
    const recommendedDiscussions = await this.getDiscussions(
      {
        topicId: topicIds[0],
        sort: "trending",
        page: 1,
        limit: 5,
      },
      userId
    );

    // Get recommended topics
    const recommendedTopics = await db.topic.findMany({
      where: {
        id: { notIn: topicIds },
      },
      include: {
        _count: {
          select: {
            discussions: true,
            followers: true,
          },
        },
      },
      orderBy: {
        discussions: {
          _count: "desc",
        },
      },
      take: 3,
    });

    // Get potential mentors
    const mentors = await db.user.findMany({
      where: {
        role: { in: ["INSTRUCTOR", "ADMIN"] },
        instructedCourses: {
          some: {
            id: { in: courseIds },
          },
        },
      },
      take: 3,
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

    return {
      discussions: recommendedDiscussions.discussions,
      topics: recommendedTopics as CommunityTopic[],
      mentors: mentors as CommunityUser[],
      reasons: [
        "Based on your course enrollments",
        "Popular in your followed topics",
        "Trending in the community",
      ],
    };
  }

  // Helper methods
  private static getDiscussionOrderBy(
    sort: DiscussionSortType
  ): Prisma.DiscussionOrderByWithRelationInput[] {
    switch (sort) {
      case "latest":
        return [{ createdAt: "desc" }];
      case "trending":
        return [
          { lastActivityAt: "desc" },
          { upvoteCount: "desc" },
          { replyCount: "desc" },
        ];
      case "most_replies":
        return [{ replyCount: "desc" }, { createdAt: "desc" }];
      case "most_votes":
        return [{ upvoteCount: "desc" }, { createdAt: "desc" }];
      case "oldest":
        return [{ createdAt: "asc" }];
      case "solved":
        return [{ isSolved: "desc" }, { lastActivityAt: "desc" }];
      case "unsolved":
        return [{ isSolved: "asc" }, { lastActivityAt: "desc" }];
      default:
        return [{ createdAt: "desc" }];
    }
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
   * Get unread notifications count for a user
   */
  static async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const count = await db.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      return 0;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getNotifications(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ): Promise<{
    notifications: CommunityNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await Promise.all([
        db.notification.findMany({
          where: {
            recipientId: userId,
            ...(unreadOnly && { isRead: false }),
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        db.notification.count({
          where: {
            recipientId: userId,
            ...(unreadOnly && { isRead: false }),
          },
        }),
      ]);

      return {
        notifications: notifications as CommunityNotification[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        notifications: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Mark notifications as read
   */
  static async markNotificationsAsRead(
    userId: string,
    notificationIds?: string[]
  ): Promise<boolean> {
    try {
      await db.notification.updateMany({
        where: {
          recipientId: userId,
          ...(notificationIds && { id: { in: notificationIds } }),
        },
        data: {
          isRead: true,
        },
      });

      return true;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return false;
    }
  }
}
