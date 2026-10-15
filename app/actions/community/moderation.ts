"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Moderate content (discussions and replies)
 */
export async function moderateContent(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (
      !session?.user ||
      !session.user.role ||
      !["ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    const discussionId = formData.get("discussionId") as string;
    const replyId = formData.get("replyId") as string;
    const action = formData.get("action") as string; // "moderate" or "flag"

    if (discussionId) {
      // Use status field to mark as CLOSED for moderated discussions
      const newStatus = action === "moderate" ? "CLOSED" : "ACTIVE";
      await db.discussion.update({
        where: { id: discussionId },
        data: {
          status: newStatus,
          isLocked: action === "moderate", // Lock moderated discussions
        },
      });
      revalidatePath("/community/discussions");
      revalidatePath("/admin/community/moderation");
    } else if (replyId) {
      // For replies, we can delete inappropriate ones
      if (action === "delete") {
        await db.discussionReply.delete({
          where: { id: replyId },
        });
      }
      revalidatePath("/community/discussions");
      revalidatePath("/admin/community/moderation");
    } else {
      return { success: false, error: "Content ID is required" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error moderating content:", error);
    return {
      success: false,
      error: "Failed to moderate content",
    };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !session.user.role || session.user.role !== "ADMIN") {
      return { success: false, error: "Insufficient permissions" };
    }

    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;

    if (!userId || !role) {
      return { success: false, error: "User ID and role are required" };
    }

    if (!["USER", "MENTOR", "MODERATOR", "ADMIN"].includes(role)) {
      return { success: false, error: "Invalid role" };
    }

    await db.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: "Failed to update user role",
    };
  }
}

/**
 * Ban user
 */
export async function banUser(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (
      !session?.user ||
      !session.user.role ||
      !["ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    const userId = formData.get("userId") as string;

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    await db.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return {
      success: false,
      error: "Failed to ban user",
    };
  }
}

/**
 * Unban user
 */
export async function unbanUser(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (
      !session?.user ||
      !session.user.role ||
      !["ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    const userId = formData.get("userId") as string;

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    await db.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return {
      success: false,
      error: "Failed to unban user",
    };
  }
}
