"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { guardCourse } from "@/lib/curriculum/guard";
import * as insights from "@/lib/curriculum/insights";
import { revalidateCourse } from "@/lib/curriculum/revalidate";
import { failure, unexpected, type ActionFailure } from "../../_actions/shared";

const id = z.string().min(1).max(64);

export async function loadCourseStatistics(
  courseId: string,
): Promise<{ success: true; statistics: insights.CourseStatistics } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    return { success: true, statistics: await insights.getCourseStatistics(g.course.id) };
  } catch (error) {
    return unexpected("loadCourseStatistics", error);
  }
}

export async function loadCourseLearners(
  courseId: string,
  query: { search?: string; page?: number },
): Promise<{ success: true; learners: insights.LearnerPage } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const parsed = z.object({ search: z.string().max(200).optional(), page: z.number().int().min(1).max(10_000).optional() }).parse(query);
    return { success: true, learners: await insights.listCourseLearners(g.course.id, parsed) };
  } catch (error) {
    return unexpected("loadCourseLearners", error);
  }
}

/** Opens the course to an existing account without purchase or subscription. Administrators only. */
export async function grantCourseAccess(
  courseId: string,
  email: string,
): Promise<{ success: true; name: string; created: boolean } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    if (g.user.role !== "ADMIN") return failure("Seul un administrateur peut offrir l'accès à une formation.");
    const r = await insights.grantCourseAccess(g.course.id, z.string().max(320).parse(email), g.user.id);
    if (!r.success) return r;
    const course = await db.course.findUnique({ where: { id: g.course.id }, select: { title: true } });
    await db.notification
      .create({
        data: {
          recipientId: r.userId,
          senderId: g.user.id,
          type: "SYSTEM_ANNOUNCEMENT",
          title: "Nouvel accès à une formation",
          message: `Vous avez maintenant accès à la formation « ${course?.title ?? ""} ».`,
          data: { courseId: g.course.id, courseSlug: g.course.slug },
        },
      })
      .catch(() => undefined); // the access is given even if the notice could not be written
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug] });
    return { success: true, name: r.name, created: r.created };
  } catch (error) {
    return unexpected("grantCourseAccess", error);
  }
}

export async function revokeCourseAccess(
  courseId: string,
  userId: string,
): Promise<{ success: true; removedEnrollment: boolean } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    if (g.user.role !== "ADMIN") return failure("Seul un administrateur peut retirer un accès offert.");
    const r = await insights.revokeCourseAccess(g.course.id, id.parse(userId));
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug] });
    return { success: true, removedEnrollment: r.removedEnrollment };
  } catch (error) {
    return unexpected("revokeCourseAccess", error);
  }
}
