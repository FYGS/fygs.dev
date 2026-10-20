"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  updateProfileSchema,
} from "@/types/community";
import type {
  ActionResult,
} from "@/types/community";
import { communityWriteBlock } from "./_rate-limit";

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
    const writeBlock = await communityWriteBlock(session.user.id);
    if (writeBlock) {
      return { success: false, error: writeBlock };
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
