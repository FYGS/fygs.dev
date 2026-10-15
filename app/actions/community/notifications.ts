"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Get user notifications
 */
export async function getNotifications(
  userId: string,
  options: {
    filter: "all" | "unread" | "read";
    page?: number;
    limit?: number;
  } = { filter: "all" }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const { filter, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      recipientId: userId,
      ...(filter === "unread" && { isRead: false }),
      ...(filter === "read" && { isRead: true }),
    };

    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: "Failed to fetch notifications",
    };
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await db.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        recipientId: session.user.id, // Ensure user can only mark their own notifications
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/community/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark notifications as read",
    };
  }
}

/**
 * Mark single notification as read
 */
export async function markNotificationAsRead(formData: FormData) {
  const notificationId = formData.get("notificationId") as string;

  if (!notificationId) {
    return { success: false, error: "Notification ID is required" };
  }

  return markNotificationsAsRead([notificationId]);
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await db.notification.updateMany({
      where: {
        recipientId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/community/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(formData: FormData) {
  const notificationId = formData.get("notificationId") as string;

  if (!notificationId) {
    return { success: false, error: "Notification ID is required" };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    await db.notification.delete({
      where: {
        id: notificationId,
        recipientId: session.user.id, // Ensure user can only delete their own notifications
      },
    });

    revalidatePath("/community/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      error: "Failed to delete notification",
    };
  }
}
