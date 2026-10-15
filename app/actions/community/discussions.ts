"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import {
  createDiscussionSchema,
  updateDiscussionSchema,
} from "@/types/community";
import type {
  DiscussionActionResult,
  ActionResult,
} from "@/types/community";
import { checkAndAwardBadges } from "./_badges";
import { isCommunityWriteLimited } from "./_rate-limit";

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
    if (await isCommunityWriteLimited(session.user.id)) {
      return { success: false, error: "Too many requests" };
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
    if (await isCommunityWriteLimited(session.user.id)) {
      return { success: false, error: "Too many requests" };
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
    if (await isCommunityWriteLimited(session.user.id)) {
      return { success: false, error: "Too many requests" };
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
