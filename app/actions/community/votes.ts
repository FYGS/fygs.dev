"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  voteSchema,
} from "@/types/community";
import type {
  VoteActionResult,
} from "@/types/community";
import { communityWriteBlock } from "./_rate-limit";

/**
 * Vote on a discussion or reply
 */
export async function vote(formData: FormData): Promise<VoteActionResult> {
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
      voteType: formData.get("voteType") as string,
      targetId: formData.get("targetId") as string,
      targetType: formData.get("targetType") as string,
    };

    const validatedData = voteSchema.parse(rawData);
    const isDiscussion = validatedData.targetType === "discussion";
    const targetWhere = isDiscussion
      ? { discussionId: validatedData.targetId }
      : { replyId: validatedData.targetId };

    // The target must exist and be open; nobody votes on their own content (it would farm points)
    const target = isDiscussion
      ? await db.discussion.findUnique({
          where: { id: validatedData.targetId },
          select: { authorId: true, isLocked: true, status: true },
        })
      : await db.discussionReply
          .findUnique({
            where: { id: validatedData.targetId },
            select: { authorId: true, discussion: { select: { isLocked: true, status: true } } },
          })
          .then((reply) => (reply ? { authorId: reply.authorId, ...reply.discussion } : null));
    if (!target) {
      return { success: false, error: "Target not found" };
    }
    if (target.authorId === session.user.id) {
      return { success: false, error: "You cannot vote on your own content" };
    }
    if (target.isLocked || target.status !== "ACTIVE") {
      return { success: false, error: "Discussion is closed" };
    }

    // One writer at a time per target: the counters are recomputed from the vote rows, so they always equal them,
    // however many requests arrive together (a toggle fired 50 times cannot drift them)
    const outcome = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${validatedData.targetId}::text))`;

      const existing = await tx.discussionVote.findFirst({
        where: { userId: session.user.id, ...targetWhere },
      });
      const hadUpvote = existing?.voteType === "UPVOTE";

      let removed = false;
      if (existing && existing.voteType === validatedData.voteType) {
        await tx.discussionVote.delete({ where: { id: existing.id } });
        removed = true;
      } else if (existing) {
        await tx.discussionVote.update({
          where: { id: existing.id },
          data: { voteType: validatedData.voteType },
        });
      } else {
        await tx.discussionVote.create({
          data: { userId: session.user.id, voteType: validatedData.voteType, ...targetWhere },
        });
      }

      const [upvoteCount, downvoteCount] = await Promise.all([
        tx.discussionVote.count({ where: { ...targetWhere, voteType: "UPVOTE" } }),
        tx.discussionVote.count({ where: { ...targetWhere, voteType: "DOWNVOTE" } }),
      ]);
      if (isDiscussion) {
        await tx.discussion.update({ where: { id: validatedData.targetId }, data: { upvoteCount, downvoteCount } });
      } else {
        await tx.discussionReply.update({ where: { id: validatedData.targetId }, data: { upvoteCount, downvoteCount } });
      }

      // The author's points follow the upvotes they hold NOW: +1 when one is given, -1 when it is taken back
      // or turned into a downvote. Toggling therefore earns nothing.
      const hasUpvote = !removed && validatedData.voteType === "UPVOTE";
      const delta = (hasUpvote ? 1 : 0) - (hadUpvote ? 1 : 0);
      if (delta > 0) {
        await tx.user.update({ where: { id: target.authorId }, data: { communityPoints: { increment: 1 } } });
      } else if (delta < 0) {
        await tx.user.updateMany({
          where: { id: target.authorId, communityPoints: { gte: 1 } },
          data: { communityPoints: { decrement: 1 } },
        });
      }

      return { removed, upvoteCount, downvoteCount };
    });

    const voteResult = { type: validatedData.voteType, removed: outcome.removed };

    revalidatePath("/community");

    return {
      success: true,
      vote: {
        type: validatedData.voteType,
        count: outcome.upvoteCount - outcome.downvoteCount,
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
