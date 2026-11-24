"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
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


    // A field that is absent is left alone; an empty one clears it
    const field = (name: string): string | undefined => {
      const value = formData.get(name);
      return typeof value === "string" ? value.trim() : undefined;
    };

    const validatedData = updateProfileSchema.parse({
      bio: field("bio"),
      githubUrl: field("githubUrl"),
      linkedinUrl: field("linkedinUrl"),
      websiteUrl: field("websiteUrl"),
    });

    const orNull = (value: string | undefined) => (value === undefined ? undefined : value === "" ? null : value);

    await db.user.update({
      where: { id: session.user.id },
      data: {
        bio: orNull(validatedData.bio),
        githubUrl: orNull(validatedData.githubUrl),
        linkedinUrl: orNull(validatedData.linkedinUrl),
        websiteUrl: orNull(validatedData.websiteUrl),
      },
    });

    revalidatePath("/community/profile");

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Invalid profile" };
    }
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Helper functions
