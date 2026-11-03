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
import { communityWriteBlock } from "./_rate-limit";

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
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
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

    // A discussion can only be attached to a course that exists and is on sale
    if (validatedData.courseId) {
      const course = await db.course.findFirst({
        where: { id: validatedData.courseId, published: true },
        select: { id: true },
      });
      if (!course) {
        return { success: false, error: "Course not found" };
      }
    }
    const topic = await db.topic.findUnique({ where: { id: validatedData.topicId }, select: { id: true } });
    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

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
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
    }


    const discussion = await db.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return { success: false, error: "Discussion not found" };
    }

    // Who may do what:
    // - the text (title, content, tags): the author only, and not once a moderator locked the discussion
    // - pinning and locking: an administrator, or the instructor of the course the discussion belongs to
    // - marking it solved: the author, or those who moderate it
    const isAuthor = discussion.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    let isCourseInstructor = false;
    if (discussion.courseId && session.user.role === "INSTRUCTOR") {
      const course = await db.course.findUnique({
        where: { id: discussion.courseId },
        select: { instructorId: true },
      });
      isCourseInstructor = course?.instructorId === session.user.id;
    }
    const canModerate = isAdmin || isCourseInstructor;

    if (!isAuthor && !canModerate) {
      return { success: false, error: "Permission denied" };
    }

    const flag = (name: string): boolean | undefined => {
      const value = formData.get(name);
      return value === "true" ? true : value === "false" ? false : undefined;
    };

    const rawData = {
      title: (formData.get("title") as string) || undefined,
      content: (formData.get("content") as string) || undefined,
      tags:
        formData.get("tags")?.toString().split(",").filter(Boolean) ||
        undefined,
      isPinned: flag("isPinned"),
      isLocked: flag("isLocked"),
      isSolved: flag("isSolved"),
    };

    const validatedData = updateDiscussionSchema.parse(rawData);

    const editsText =
      validatedData.title !== undefined ||
      validatedData.content !== undefined ||
      validatedData.tags !== undefined;
    if (editsText && !isAuthor) {
      return { success: false, error: "Permission denied" };
    }
    if (editsText && discussion.isLocked && !canModerate) {
      return { success: false, error: "Discussion is locked" };
    }
    if ((validatedData.isPinned !== undefined || validatedData.isLocked !== undefined) && !canModerate) {
      return { success: false, error: "Permission denied" };
    }
    if (validatedData.isSolved !== undefined && !isAuthor && !canModerate) {
      return { success: false, error: "Permission denied" };
    }

    let slug: string | undefined;
    if (validatedData.title && validatedData.title !== discussion.title) {
      const base = generateSlug(validatedData.title);
      const taken = await db.discussion.findFirst({
        where: { slug: base, topicId: discussion.topicId, id: { not: discussion.id } },
        select: { id: true },
      });
      slug = taken ? `${base}-${Date.now().toString(36)}` : base;
    }

    const updatedDiscussion = await db.discussion.update({
      where: { id: discussionId },
      // Fields are listed one by one: nothing the client sends reaches the database unless it is named here
      data: {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(slug && { slug }),
        ...(validatedData.content !== undefined && { content: validatedData.content }),
        ...(validatedData.tags !== undefined && { tags: validatedData.tags }),
        ...(validatedData.isPinned !== undefined && { isPinned: validatedData.isPinned }),
        ...(validatedData.isLocked !== undefined && { isLocked: validatedData.isLocked }),
        ...(validatedData.isSolved !== undefined && { isSolved: validatedData.isSolved }),
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
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
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
