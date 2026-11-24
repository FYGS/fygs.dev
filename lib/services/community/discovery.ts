import { db } from "@/lib/db";
import type {
  CommunityDiscussion,
  CommunityTopic,
  CommunityUser,
  DiscussionFilters,
  DiscussionsResponse,
  RecommendationEngine,
} from "@/types/community";
import { Prisma } from "@/lib/generated/prisma/browser";
import { DiscussionOrder } from "./order";
import { DiscussionQueries } from "./discussions";
import { PUBLIC_USER_WITH_BADGES_SELECT } from "./public-user";
import { clampPaging } from "./pagination";

/** Search, trending and personalised recommendations. */
export class DiscoveryQueries {
  /**
   * Search discussions with full-text search
   */
  static async searchDiscussions(
    query: string,
    filters: Partial<DiscussionFilters> = {},
    userId?: string
  ): Promise<DiscussionsResponse> {
    const { sort = "latest" } = filters;
    const { page, limit, skip } = clampPaging(filters.page, filters.limit);

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

    const orderBy = DiscussionOrder.getDiscussionOrderBy(sort);

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
    const recommendedDiscussions = await DiscussionQueries.getDiscussions(
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
      select: PUBLIC_USER_WITH_BADGES_SELECT,
    });

    return {
      discussions: recommendedDiscussions.discussions,
      topics: recommendedTopics as CommunityTopic[],
      mentors: mentors satisfies CommunityUser[],
      reasons: [
        "Based on your course enrollments",
        "Popular in your followed topics",
        "Trending in the community",
      ],
    };
  }
}
