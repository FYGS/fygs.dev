"use server";

import { auth } from "@/lib/auth";
import { AccessService } from "@/lib/access-service";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { generateSampleVisualSupports } from "@/lib/loaders/visual-supports-loader";

export async function getVisualSupports(courseSlug: string) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Authentication required");
    }

    // Get course ID from slug
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      select: { id: true, title: true },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user has access to the course
    const userAccess = await AccessService.checkCourseAccess(userId, course.id);
    if (!userAccess.canAccessCourse) {
      throw new Error("Access denied");
    }

    // Fetch visual supports for the course
    const visualSupports = await db.visualSupport.findMany({
      where: { courseId: course.id },
      orderBy: [{ moduleId: "asc" }, { order: "asc" }],
    });

    // If no visual supports exist, generate sample data
    if (visualSupports.length === 0) {
      return generateSampleVisualSupports(course.title, courseSlug);
    }

    return visualSupports;
  } catch (error) {
    console.error("Error fetching visual supports:", error);
    throw error;
  }
}
