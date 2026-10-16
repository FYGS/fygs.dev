import { db } from "@/lib/db";
import type {
  CommunityUser,
  UserProfileResponse,
} from "@/types/community";

/** Per-user data: notifications, bookmarks, replies, profile. */
export class UserQueries {
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
   * Get user bookmarks
   */
  static async getUserBookmarks(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const skip = (page - 1) * limit;

      const bookmarks = await db.discussionBookmark.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          discussion: {
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
          },
        },
      });

      return bookmarks;
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      return [];
    }
  }

  /**
   * Get user replies with discussion context
   */
  static async getUserReplies(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const skip = (page - 1) * limit;

      const replies = await db.discussionReply.findMany({
        where: { authorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          discussion: {
            select: {
              id: true,
              title: true,
              topic: {
                select: {
                  name: true,
                  icon: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          _count: {
            select: {
              votes: true,
              children: true,
            },
          },
        },
      });

      return replies;
    } catch (error) {
      console.error("Error fetching user replies:", error);
      return [];
    }
  }

  /**
   * Get user profile with statistics and recent activity
   */
  static async getUserProfile(
    userId: string
  ): Promise<UserProfileResponse | null> {
    try {
      const [user, discussions, replies, upvotes] = await Promise.all([
        db.user.findUnique({
          where: { id: userId },
          include: {
            userBadges: {
              include: {
                badge: true,
              },
            },
          },
        }),
        db.discussion.findMany({
          where: { authorId: userId, status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 5,
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
            _count: {
              select: {
                replies: true,
                votes: true,
                bookmarks: true,
              },
            },
          },
        }),
        db.discussionReply.count({
          where: { authorId: userId },
        }),
        db.discussionVote.count({
          where: {
            discussion: { authorId: userId },
            voteType: "UPVOTE",
          },
        }),
      ]);

      if (!user) {
        return null;
      }

      return {
        user: {
          ...user,
          userBadges: user.userBadges || [],
          _count: {
            discussions: discussions.length,
            discussionReplies: replies,
            discussionVotes: upvotes,
          },
        } as CommunityUser,
        stats: {
          totalDiscussions: discussions.length,
          totalReplies: replies,
          totalUpvotes: upvotes,
          joinedDate: user.createdAt,
          lastActive: user.lastActiveAt || user.updatedAt,
        },
        recentActivity: discussions,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
}
