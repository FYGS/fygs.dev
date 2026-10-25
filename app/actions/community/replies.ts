"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  createReplySchema,
} from "@/types/community";
import type {
  ReplyActionResult,
  ActionResult,
} from "@/types/community";
import { checkAndAwardBadges } from "./_badges";
import { communityWriteBlock } from "./_rate-limit";

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
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
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
      include: { author: true },
    });

    if (discussion && discussion.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          recipientId: discussion.authorId,
          senderId: session.user.id,
          type: "DISCUSSION_REPLY",
          title: "Nouvelle réponse à votre discussion",
          message: `${session.user.name || "Un membre"} a répondu à « ${discussion.title} »`,
          data: {
            discussionId: validatedData.discussionId,
            replyId: reply.id,
          },
        },
      });

      // Send email notification
      const { CommunityNotificationService } = await import(
        "@/lib/services/community-notification"
      );
      const replyWithRelations = {
        ...reply,
        author: session.user,
        discussion: {
          ...discussion,
          author: discussion.author,
        },
      };
      await CommunityNotificationService.notifyDiscussionReply(
        replyWithRelations as any
      );
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
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
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

/**
 * Delete a reply
 */
export async function deleteReply(replyId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
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
