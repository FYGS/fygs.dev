import { db } from "@/lib/db";
import type {
  CommunityDiscussion,
  CommunityReply,
  DiscussionFilters,
  DiscussionsResponse,
} from "@/types/community";
import { Prisma } from "@/lib/generated/prisma/browser";
import { DiscussionOrder } from "./order";

/** Discussion listing, detail and replies. */
export class DiscussionQueries {
  /**
   * Get discussions with advanced filtering and sorting
   */
  static async getDiscussions(
    filters: DiscussionFilters,
    userId?: string
  ): Promise<DiscussionsResponse> {
    const {
      page,
      limit,
      sort,
      topicId,
      courseId,
      tags,
      authorId,
      status,
      search,
    } = filters;
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
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            tags: {
              hasSome: [search],
            },
          },
        ],
      }),
    };

    // Build order by clause
    const orderBy = DiscussionOrder.getDiscussionOrderBy(sort);

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
            communityPoints: true,
            userBadges: {
              include: {
                badge: true,
              },
              take: 5,
              orderBy: {
                earnedAt: "desc",
              },
            },
            _count: {
              select: {
                discussions: true,
                discussionReplies: true,
                discussionVotes: true,
              },
            },
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
                communityPoints: true,
                userBadges: {
                  include: {
                    badge: true,
                  },
                  take: 5,
                  orderBy: {
                    earnedAt: "desc",
                  },
                },
                _count: {
                  select: {
                    discussions: true,
                    discussionReplies: true,
                    discussionVotes: true,
                  },
                },
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
}
