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
import { isCommunityWriteLimited } from "./_rate-limit";

/**
 * Vote on a discussion or reply
 */
export async function vote(formData: FormData): Promise<VoteActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }
    if (await isCommunityWriteLimited(session.user.id)) {
      return { success: false, error: "Too many requests" };
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
