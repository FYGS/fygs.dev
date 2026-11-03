"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type {
  ActionResult,
} from "@/types/community";
import { communityWriteBlock } from "./_rate-limit";
import { clampPaging } from "@/lib/services/community/pagination";

/**
 * Follow/unfollow a topic
 */
export async function toggleTopicFollow(
  topicId: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
    }


    const existingFollow = await db.topicFollow.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId,
        },
      },
    });

    if (existingFollow) {
      await db.topicFollow.delete({
        where: { id: existingFollow.id },
      });
      return { success: true, message: "Topic unfollowed" };
    } else {
      await db.topicFollow.create({
        data: {
          userId: session.user.id,
          topicId,
        },
      });
      return { success: true, message: "Topic followed" };
    }
  } catch (error) {
    console.error("Error toggling topic follow:", error);
    return { success: false, error: "Failed to toggle topic follow" };
  }
}

/**
 * Follow/unfollow a user
 */
export async function toggleUserFollow(
  targetUserId: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
    }


    if (session.user.id === targetUserId) {
      return { success: false, error: "You cannot follow yourself" };
    }

    const existingFollow = await db.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await db.userFollow.delete({
        where: { id: existingFollow.id },
      });

      return {
        success: true,
        message: "User unfollowed successfully",
        data: { isFollowing: false },
      };
    } else {
      // Follow
      await db.userFollow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });

      // Create notification for followed user
      await db.notification.create({
        data: {
          recipientId: targetUserId,
          senderId: session.user.id,
          type: "FOLLOW",
          title: "New follower",
          message: `${session.user.name} started following you`,
          data: {
            followerId: session.user.id,
          },
        },
      });

      // Send email notification
      const { CommunityNotificationService } = await import(
        "@/lib/services/community-notification"
      );
      await CommunityNotificationService.notifyNewFollower(
        session.user.id,
        targetUserId
      );

      return {
        success: true,
        message: "User followed successfully",
        data: { isFollowing: true },
      };
    }
  } catch (error) {
    console.error("Error toggling user follow:", error);
    return { success: false, error: "Failed to follow/unfollow user" };
  }
}

/**
 * Get user followers
 */
export async function getUserFollowers(
  userId: string,
  pageArg = 1,
  limitArg = 20
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const { page, limit, skip } = clampPaging(pageArg, limitArg);

    const [followers, total] = await Promise.all([
      db.userFollow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              communityLevel: true,
              communityPoints: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.userFollow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      success: true,
      data: {
        followers: followers.map((f) => f.follower),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching followers:", error);
    return { success: false, error: "Failed to fetch followers" };
  }
}

/**
 * Get users being followed
 */
export async function getUserFollowing(
  userId: string,
  pageArg = 1,
  limitArg = 20
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const { page, limit, skip } = clampPaging(pageArg, limitArg);

    const [following, total] = await Promise.all([
      db.userFollow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              communityLevel: true,
              communityPoints: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.userFollow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      success: true,
      data: {
        following: following.map((f) => f.following),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching following:", error);
    return { success: false, error: "Failed to fetch following" };
  }
}

/**
 * Check if current user follows another user
 */
export async function checkUserFollow(
  targetUserId: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: true, data: { isFollowing: false } };
    }

    const follow = await db.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    return {
      success: true,
      data: { isFollowing: !!follow },
    };
  } catch (error) {
    console.error("Error checking user follow:", error);
    return { success: false, error: "Failed to check follow status" };
  }
}
