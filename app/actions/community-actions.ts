/**
 * Community Server Actions
 * Comprehensive actions for forum operations with validation and error handling
 */

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  createDiscussionSchema,
  updateDiscussionSchema,
  createReplySchema,
  voteSchema,
  mentorRequestSchema,
  updateProfileSchema,
} from "@/types/community";
import type {
  DiscussionActionResult,
  ReplyActionResult,
  VoteActionResult,
  ActionResult,
} from "@/types/community";
import { generateSlug } from "@/lib/utils";

/**
 * Create a new discussion
 */
export async function createDiscussion(
  formData: FormData
): Promise<DiscussionActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const rawData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      topicId: formData.get("topicId") as string,
      courseId: (formData.get("courseId") as string) || undefined,
      tags: formData.get("tags")?.toString().split(",").filter(Boolean) || [],
    };

    const validatedData = createDiscussionSchema.parse(rawData);
    const slug = generateSlug(validatedData.title);

    // Check if slug already exists in this topic
    const existingDiscussion = await db.discussion.findFirst({
      where: {
        slug,
        topicId: validatedData.topicId,
      },
    });

    const finalSlug = existingDiscussion
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    const discussion = await db.discussion.create({
      data: {
        title: validatedData.title,
        slug: finalSlug,
        content: validatedData.content,
        authorId: session.user.id,
        topicId: validatedData.topicId,
        courseId: validatedData.courseId,
        tags: validatedData.tags || [],
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
      },
    });

    // Award points for creating discussion
    await db.user.update({
      where: { id: session.user.id },
      data: {
        communityPoints: { increment: 10 },
        lastActiveAt: new Date(),
      },
    });

    // Check for badges
    await checkAndAwardBadges(session.user.id, "DISCUSSION_CREATED");

    revalidatePath("/community");
    revalidatePath(`/community/${discussion.topic.slug}`);

    return {
      success: true,
      data: discussion,
      discussion: discussion as any,
      message: "Discussion created successfully!",
    };
  } catch (error) {
    console.error("Error creating discussion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create discussion",
    };
  }
}

/**
 * Update an existing discussion
 */
export async function updateDiscussion(
  discussionId: string,
  formData: FormData
): Promise<DiscussionActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const discussion = await db.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return { success: false, error: "Discussion not found" };
    }

    // Check permissions
    const canEdit =
      discussion.authorId === session.user.id ||
      session.user.role === "ADMIN" ||
      session.user.role === "INSTRUCTOR";

    if (!canEdit) {
      return { success: false, error: "Permission denied" };
    }

    const rawData = {
      title: (formData.get("title") as string) || undefined,
      content: (formData.get("content") as string) || undefined,
      tags:
        formData.get("tags")?.toString().split(",").filter(Boolean) ||
        undefined,
      isPinned: formData.get("isPinned") === "true" || undefined,
      isLocked: formData.get("isLocked") === "true" || undefined,
      isSolved: formData.get("isSolved") === "true" || undefined,
    };

    const validatedData = updateDiscussionSchema.parse(rawData);

    const updatedDiscussion = await db.discussion.update({
      where: { id: discussionId },
      data: {
        ...validatedData,
        ...(validatedData.title && { slug: generateSlug(validatedData.title) }),
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
      },
    });

    revalidatePath("/community");
    revalidatePath(
      `/community/${updatedDiscussion.topic.slug}/${updatedDiscussion.slug}`
    );

    return {
      success: true,
      discussion: updatedDiscussion as any,
      message: "Discussion updated successfully!",
    };
  } catch (error) {
    console.error("Error updating discussion:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update discussion",
    };
  }
}

/**
 * Delete a discussion
 */
export async function deleteDiscussion(
  discussionId: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const discussion = await db.discussion.findUnique({
      where: { id: discussionId },
      include: { topic: true },
    });

    if (!discussion) {
      return { success: false, error: "Discussion not found" };
    }

    // Check permissions
    const canDelete =
      discussion.authorId === session.user.id || session.user.role === "ADMIN";

    if (!canDelete) {
      return { success: false, error: "Permission denied" };
    }

    await db.discussion.delete({
      where: { id: discussionId },
    });

    revalidatePath("/community");
    revalidatePath(`/community/${discussion.topic.slug}`);

    return {
      success: true,
      message: "Discussion deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return {
      success: false,
      error: "Failed to delete discussion",
    };
  }
}

/**
 * Create a reply to a discussion
 */
export async function createReply(
  formData: FormData
): Promise<ReplyActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const rawData = {
      content: formData.get("content") as string,
      discussionId: formData.get("discussionId") as string,
      parentId: (formData.get("parentId") as string) || undefined,
    };

    const validatedData = createReplySchema.parse(rawData);

    const reply = await db.discussionReply.create({
      data: {
        content: validatedData.content,
        authorId: session.user.id,
        discussionId: validatedData.discussionId,
        parentId: validatedData.parentId,
        isModerator:
          session.user.role === "ADMIN" || session.user.role === "INSTRUCTOR",
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
        _count: {
          select: {
            votes: true,
            children: true,
          },
        },
      },
    });

    // Update discussion reply count and last activity
    await db.discussion.update({
      where: { id: validatedData.discussionId },
      data: {
        replyCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    });

    // Award points for reply
    await db.user.update({
      where: { id: session.user.id },
      data: {
        communityPoints: { increment: 5 },
        lastActiveAt: new Date(),
      },
    });

    // Check for badges
    await checkAndAwardBadges(session.user.id, "REPLY_CREATED");

    // Create notification for discussion author
    const discussion = await db.discussion.findUnique({
      where: { id: validatedData.discussionId },
    });

    if (discussion && discussion.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          recipientId: discussion.authorId,
          senderId: session.user.id,
          type: "DISCUSSION_REPLY",
          title: "New reply to your discussion",
          message: `${session.user.name} replied to your discussion "${discussion.title}"`,
          data: {
            discussionId: validatedData.discussionId,
            replyId: reply.id,
          },
        },
      });
    }

    revalidatePath(`/community/discussions/${discussion?.id}`);

    return {
      success: true,
      data: reply,
      reply: reply as any,
      message: "Reply posted successfully!",
    };
  } catch (error) {
    console.error("Error creating reply:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create reply",
    };
  }
}

/**
 * Vote on a discussion or reply
 */
export async function vote(formData: FormData): Promise<VoteActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const rawData = {
      voteType: formData.get("voteType") as string,
      targetId: formData.get("targetId") as string,
      targetType: formData.get("targetType") as string,
    };

    const validatedData = voteSchema.parse(rawData);

    // Check if user already voted
    const existingVote = await db.discussionVote.findFirst({
      where: {
        userId: session.user.id,
        ...(validatedData.targetType === "discussion"
          ? { discussionId: validatedData.targetId }
          : { replyId: validatedData.targetId }),
      },
    });

    let voteResult;

    if (existingVote) {
      if (existingVote.voteType === validatedData.voteType) {
        // Remove vote if same type
        await db.discussionVote.delete({
          where: { id: existingVote.id },
        });
        voteResult = { type: validatedData.voteType, removed: true };
      } else {
        // Update vote type
        await db.discussionVote.update({
          where: { id: existingVote.id },
          data: { voteType: validatedData.voteType },
        });
        voteResult = { type: validatedData.voteType, changed: true };
      }
    } else {
      // Create new vote
      await db.discussionVote.create({
        data: {
          userId: session.user.id,
          voteType: validatedData.voteType,
          ...(validatedData.targetType === "discussion"
            ? { discussionId: validatedData.targetId }
            : { replyId: validatedData.targetId }),
        },
      });
      voteResult = { type: validatedData.voteType, created: true };
    }

    // Update vote counts
    const updateData =
      validatedData.voteType === "UPVOTE"
        ? { upvoteCount: { increment: voteResult.removed ? -1 : 1 } }
        : { downvoteCount: { increment: voteResult.removed ? -1 : 1 } };

    if (validatedData.targetType === "discussion") {
      await db.discussion.update({
        where: { id: validatedData.targetId },
        data: updateData,
      });
    } else {
      await db.discussionReply.update({
        where: { id: validatedData.targetId },
        data: updateData,
      });
    }

    // Award points for helpful voting
    if (validatedData.voteType === "UPVOTE" && !voteResult.removed) {
      await db.user.update({
        where: { id: session.user.id },
        data: { communityPoints: { increment: 1 } },
      });
    }

    revalidatePath("/community");

    return {
      success: true,
      vote: {
        type: validatedData.voteType,
        count: 0, // Would need to calculate actual count
        userVoted: !voteResult.removed,
      },
      message: voteResult.removed ? "Vote removed" : "Vote recorded",
    };
  } catch (error) {
    console.error("Error voting:", error);
    return {
      success: false,
      error: "Failed to record vote",
    };
  }
}

/**
 * Toggle bookmark on a discussion
 */
export async function toggleBookmark(
  discussionId: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const existingBookmark = await db.discussionBookmark.findUnique({
      where: {
        userId_discussionId: {
          userId: session.user.id,
          discussionId,
        },
      },
    });

    if (existingBookmark) {
      await db.discussionBookmark.delete({
        where: { id: existingBookmark.id },
      });
      return { success: true, message: "Bookmark removed" };
    } else {
      await db.discussionBookmark.create({
        data: {
          userId: session.user.id,
          discussionId,
        },
      });
      return { success: true, message: "Discussion bookmarked" };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

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
 * Create a mentor request
 */
export async function createMentorRequest(
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const rawData = {
      mentorId: formData.get("mentorId") as string,
      courseId: (formData.get("courseId") as string) || undefined,
      message: formData.get("message") as string,
    };

    const validatedData = mentorRequestSchema.parse(rawData);

    // Check if request already exists
    const existingRequest = await db.mentorRequest.findFirst({
      where: {
        studentId: session.user.id,
        mentorId: validatedData.mentorId,
        courseId: validatedData.courseId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return { success: false, error: "Mentor request already exists" };
    }

    await db.mentorRequest.create({
      data: {
        studentId: session.user.id,
        mentorId: validatedData.mentorId,
        courseId: validatedData.courseId,
        message: validatedData.message,
      },
    });

    // Create notification for mentor
    await db.notification.create({
      data: {
        recipientId: validatedData.mentorId,
        senderId: session.user.id,
        type: "MENTOR_REQUEST",
        title: "New mentorship request",
        message: `${session.user.name} has requested mentorship`,
        data: {
          studentId: session.user.id,
          courseId: validatedData.courseId,
        },
      },
    });

    return { success: true, message: "Mentor request sent successfully!" };
  } catch (error) {
    console.error("Error creating mentor request:", error);
    return { success: false, error: "Failed to send mentor request" };
  }
}

/**
 * Update user community profile
 */
export async function updateCommunityProfile(
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const rawData = {
      bio: (formData.get("bio") as string) || undefined,
      githubUrl: (formData.get("githubUrl") as string) || undefined,
      linkedinUrl: (formData.get("linkedinUrl") as string) || undefined,
      websiteUrl: (formData.get("websiteUrl") as string) || undefined,
    };

    const validatedData = updateProfileSchema.parse(rawData);

    await db.user.update({
      where: { id: session.user.id },
      data: validatedData,
    });

    revalidatePath("/community/profile");

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Helper functions
async function checkAndAwardBadges(userId: string, action: string) {
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

/**
 * Vote on a discussion - simplified wrapper for the discussions list
 */
export async function voteOnDiscussion(
  discussionId: string,
  voteType: "UPVOTE" | "DOWNVOTE"
): Promise<VoteActionResult> {
  const formData = new FormData();
  formData.append("targetId", discussionId);
  formData.append("targetType", "discussion");
  formData.append("voteType", voteType);

  return vote(formData);
}

/**
 * Vote on a reply wrapper function
 */
export async function voteOnReply(
  replyId: string,
  voteType: "UPVOTE" | "DOWNVOTE"
): Promise<VoteActionResult> {
  const formData = new FormData();
  formData.append("targetId", replyId);
  formData.append("targetType", "reply");
  formData.append("voteType", voteType);

  return vote(formData);
}

/**
 * Delete a reply
 */
export async function deleteReply(replyId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if reply exists and user owns it or is admin
    const reply = await db.discussionReply.findUnique({
      where: { id: replyId },
      include: { discussion: true },
    });

    if (!reply) {
      return { success: false, error: "Reply not found" };
    }

    if (reply.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Delete the reply
    await db.discussionReply.delete({
      where: { id: replyId },
    });

    // Update discussion reply count
    await db.discussion.update({
      where: { id: reply.discussionId },
      data: { replyCount: { decrement: 1 } },
    });

    revalidatePath(`/community/discussions/${reply.discussionId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting reply:", error);
    return { success: false, error: "Failed to delete reply" };
  }
}

/**
 * Update a reply
 */
export async function updateReply(
  replyId: string,
  content: string
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if reply exists and user owns it
    const reply = await db.discussionReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return { success: false, error: "Reply not found" };
    }

    if (reply.authorId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Update the reply
    const updatedReply = await db.discussionReply.update({
      where: { id: replyId },
      data: { content },
    });

    revalidatePath(`/community/discussions/${reply.discussionId}`);

    return { success: true, data: updatedReply };
  } catch (error) {
    console.error("Error updating reply:", error);
    return { success: false, error: "Failed to update reply" };
  }
}
