"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  mentorRequestSchema,
} from "@/types/community";
import type {
  ActionResult,
} from "@/types/community";

/**
 * Create a mentor request
 */
export async function createMentorRequest(
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const rawData = {
      mentorId: formData.get("mentorId") as string,
      courseId: (formData.get("courseId") as string) || undefined,
      message: formData.get("message") as string,
    };

    const validatedData = mentorRequestSchema.parse(rawData);

    // Check if request already exists
    const existingRequest = await db.mentorRequest.findFirst({
      where: {
        studentId: session.user.id,
        mentorId: validatedData.mentorId,
        courseId: validatedData.courseId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return { success: false, error: "Mentor request already exists" };
    }

    await db.mentorRequest.create({
      data: {
        studentId: session.user.id,
        mentorId: validatedData.mentorId,
        courseId: validatedData.courseId,
        message: validatedData.message,
      },
    });

    // Create notification for mentor
    await db.notification.create({
      data: {
        recipientId: validatedData.mentorId,
        senderId: session.user.id,
        type: "MENTOR_REQUEST",
        title: "New mentorship request",
        message: `${session.user.name} has requested mentorship`,
        data: {
          studentId: session.user.id,
          courseId: validatedData.courseId,
        },
      },
    });

    // Send email notification to mentor
    const mentorRequest = await db.mentorRequest.findFirst({
      where: {
        studentId: session.user.id,
        mentorId: validatedData.mentorId,
        courseId: validatedData.courseId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        mentor: true,
      },
    });

    if (mentorRequest) {
      const { CommunityNotificationService } = await import(
        "@/lib/services/community-notification"
      );
      await CommunityNotificationService.notifyMentorRequest(
        mentorRequest as any
      );
    }

    return { success: true, message: "Mentor request sent successfully!" };
  } catch (error) {
    console.error("Error creating mentor request:", error);
    return { success: false, error: "Failed to send mentor request" };
  }
}

/**
 * Get available mentors
 */
export async function getAvailableMentors(): Promise<ActionResult> {
  try {
    const mentors = await db.user.findMany({
      where: {
        role: "INSTRUCTOR",
        lastActiveAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        bio: true,
        communityLevel: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        userBadges: {
          include: {
            badge: true,
          },
        },
        _count: {
          select: {
            discussions: true,
            discussionReplies: true,
          },
        },
      },
      orderBy: {
        communityLevel: "desc",
      },
    });

    return {
      success: true,
      data: mentors,
    };
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return { success: false, error: "Failed to fetch mentors" };
  }
}

/**
 * Get mentor requests for a user (both sent and received)
 */
export async function getMentorRequests(userId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const [sentRequests, receivedRequests] = await Promise.all([
      db.mentorRequest.findMany({
        where: { studentId: userId },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.mentorRequest.findMany({
        where: { mentorId: userId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      success: true,
      data: {
        sent: sentRequests,
        received: receivedRequests,
      },
    };
  } catch (error) {
    console.error("Error fetching mentor requests:", error);
    return { success: false, error: "Failed to fetch mentor requests" };
  }
}

/**
 * Respond to a mentor request (accept/decline)
 */
export async function respondToMentorRequest(
  requestId: string,
  action: "accept" | "decline"
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const request = await db.mentorRequest.findUnique({
      where: { id: requestId },
      include: {
        student: true,
        mentor: true,
      },
    });

    if (!request) {
      return { success: false, error: "Request not found" };
    }

    if (request.mentorId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const status = action === "accept" ? "ACCEPTED" : "DECLINED";

    await db.mentorRequest.update({
      where: { id: requestId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // Create notification for student
    await db.notification.create({
      data: {
        recipientId: request.studentId,
        senderId: session.user.id,
        type: "MENTOR_REQUEST",
        title: `Mentorship request ${action}ed`,
        message: `${session.user.name} has ${action}ed your mentorship request`,
        data: {
          requestId: requestId,
          action: action,
        },
      },
    });

    // Send email notification to student
    const { CommunityNotificationService } = await import(
      "@/lib/services/community-notification"
    );
    await CommunityNotificationService.notifyMentorResponse(request, action);

    return {
      success: true,
      message: `Request ${action}ed successfully`,
    };
  } catch (error) {
    console.error("Error responding to mentor request:", error);
    return { success: false, error: "Failed to respond to request" };
  }
}
