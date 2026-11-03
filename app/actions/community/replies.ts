"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  createReplySchema,
  updateReplySchema,
} from "@/types/community";
import { AUTHOR_SELECT } from "@/lib/services/community/public-user";
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

    // The discussion must exist, be open (not locked by a moderator, not closed or archived)
    const discussion = await db.discussion.findUnique({
      where: { id: validatedData.discussionId },
      include: { author: true, course: { select: { instructorId: true } } },
    });
    if (!discussion) {
      return { success: false, error: "Discussion not found" };
    }
    if (discussion.isLocked || discussion.status !== "ACTIVE") {
      return { success: false, error: "Discussion is closed to new replies" };
    }

    // A reply to a reply stays in the same discussion
    if (validatedData.parentId) {
      const parent = await db.discussionReply.findUnique({
        where: { id: validatedData.parentId },
        select: { discussionId: true },
      });
      if (!parent || parent.discussionId !== discussion.id) {
        return { success: false, error: "Parent reply not found" };
      }
    }

    // The "moderator" mark is for those who moderate THIS discussion: an administrator, or the instructor of its course
    const moderatesHere =
      session.user.role === "ADMIN" ||
      (session.user.role === "INSTRUCTOR" && discussion.course?.instructorId === session.user.id);

    const reply = await db.$transaction(async (tx) => {
      const created = await tx.discussionReply.create({
        data: {
          content: validatedData.content,
          authorId: session.user.id,
          discussionId: discussion.id,
          parentId: validatedData.parentId,
          isModerator: moderatesHere,
        },
        include: {
          author: { select: AUTHOR_SELECT },
          _count: { select: { votes: true, children: true } },
        },
      });
      await tx.discussion.update({
        where: { id: discussion.id },
        data: { replyCount: { increment: 1 }, lastActivityAt: new Date() },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data: { communityPoints: { increment: 5 }, lastActiveAt: new Date() },
      });
      return created;
    });

    // Check for badges
    await checkAndAwardBadges(session.user.id, "REPLY_CREATED");

    // Create notification for discussion author
    if (discussion.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          recipientId: discussion.authorId,
          senderId: session.user.id,
          type: "DISCUSSION_REPLY",
          title: "Nouvelle réponse à votre discussion",
          message: `${session.user.name || "Un membre"} a répondu à « ${discussion.title} »`,
          data: {
            discussionId: discussion.id,
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

    revalidatePath(`/community/discussions/${discussion.id}`);

    return {
      success: true,
      data: reply,
      reply,
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
      include: { discussion: { select: { isLocked: true, status: true } } },
    });

    if (!reply) {
      return { success: false, error: "Reply not found" };
    }

    if (reply.authorId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Ownership is settled first; only then is the new text judged
    const parsedContent = updateReplySchema.safeParse({ content });
    if (!parsedContent.success) {
      return { success: false, error: parsedContent.error.issues[0]?.message ?? "Invalid content" };
    }
    const validContent = parsedContent.data.content;

    // A moderator's lock also freezes what was already said
    if (reply.discussion.isLocked || reply.discussion.status !== "ACTIVE") {
      return { success: false, error: "Discussion is closed" };
    }

    // Update the reply
    const updatedReply = await db.discussionReply.update({
      where: { id: replyId },
      data: { content: validContent },
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
