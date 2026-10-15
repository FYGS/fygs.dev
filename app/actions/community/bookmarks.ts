"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type {
  ActionResult,
} from "@/types/community";
import { isCommunityWriteLimited } from "./_rate-limit";

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
    if (await isCommunityWriteLimited(session.user.id)) {
      return { success: false, error: "Too many requests" };
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

      // Revalidate community pages
      revalidatePath("/community");
      revalidatePath("/community/bookmarks");

      return { success: true, message: "Bookmark removed" };
    } else {
      await db.discussionBookmark.create({
        data: {
          userId: session.user.id,
          discussionId,
        },
      });

      // Revalidate community pages
      revalidatePath("/community");
      revalidatePath("/community/bookmarks");

      return { success: true, message: "Discussion bookmarked" };
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}
