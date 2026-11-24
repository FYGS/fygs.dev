"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getEntitlement } from "@/lib/access/entitlement";
import { LAPSED_REASON_TEXT } from "@/lib/access/offer";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { emailService } from "@/lib/email-service";
import { createLogger } from "@/lib/structured-logger";
import { SITE_BASE_URL } from "@/app/_lib/constants";
import { CourseAccessTier } from "@/lib/generated/prisma/browser";

const enrollCourseSchema = z.object({ courseId: z.string().cuid() });

export type EnrollCourseResult = {
  success: boolean;
  message: string;
  enrollment?: { id: string; enrolledAt: Date };
  error?: string;
  alreadyEnrolled?: boolean;
};

/**
 * Puts a course in the learner's space. A free course is open to any signed-in learner; a premium course needs a
 * right (purchase, subscription or access granted), checked by the one entitlement rule. Idempotent: a second click,
 * a second tab or a learner already enrolled get the existing enrolment.
 */
export async function enrollCourse(input: z.infer<typeof enrollCourseSchema>): Promise<EnrollCourseResult> {
  const logger = createLogger({ operation: "enrollCourse" });
  try {
    const { courseId } = enrollCourseSchema.parse(input);
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Connectez-vous pour vous inscrire à cette formation.", error: "UNAUTHORIZED" };
    }
    const user = session.user;
    const log = logger.withContext({ userId: user.id, resourceId: courseId, resourceType: "course" });

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, slug: true, published: true, accessTier: true },
    });
    if (!course) return { success: false, message: "Formation introuvable.", error: "COURSE_NOT_FOUND" };
    if (!course.published) {
      return { success: false, message: "Cette formation n’est pas ouverte aux inscriptions.", error: "COURSE_NOT_PUBLISHED" };
    }

    const existing = () =>
      db.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
        select: { id: true, enrolledAt: true },
      });

    const entitlement = await getEntitlement({ id: user.id, role: user.role }, course.id);
    if (entitlement?.enrolled) {
      if (entitlement.lapsed) {
        return {
          success: false,
          message: LAPSED_REASON_TEXT[entitlement.lapsed].title,
          error: "ACCESS_EXPIRED",
        };
      }
      return {
        success: true,
        message: "Vous suivez déjà cette formation.",
        enrollment: (await existing()) ?? undefined,
        alreadyEnrolled: true,
      };
    }
    if (!entitlement?.eligible) {
      return {
        success: false,
        message: "Cette formation est Premium : achetez-la ou abonnez-vous pour la suivre.",
        error: "PREMIUM_ACCESS_REQUIRED",
      };
    }

    let enrollment: { id: string; enrolledAt: Date };
    try {
      enrollment = await db.enrollment.create({
        data: { userId: user.id, courseId: course.id },
        select: { id: true, enrolledAt: true },
      });
    } catch (error) {
      // A concurrent request (double click, two tabs) enrolled the learner in between: unique (userId, courseId)
      if ((error as { code?: string } | null)?.code !== "P2002") throw error;
      const winner = await existing();
      if (!winner) throw error;
      return { success: true, message: "Vous suivez déjà cette formation.", enrollment: winner, alreadyEnrolled: true };
    }

    log.businessEvent("COURSE_ENROLLMENT", { metadata: { enrollmentId: enrollment.id, courseTier: course.accessTier, source: entitlement.source } });
    await AnalyticsHelper.recordEnrollment(user.id, {
      courseId: course.id,
      courseTitle: course.title,
      courseTier: course.accessTier as CourseAccessTier,
      enrollmentSource: "direct_link",
      hasActiveSubscription: entitlement.source === "subscription",
      timestamp: new Date().toISOString(),
    });

    // The confirmation goes once, with the enrolment that created it; it never blocks the enrolment
    const template = emailService.enrollmentConfirmationEmail(
      user.name || "apprenant",
      course.title,
      new URL(`/fr/learn/${course.slug}`, SITE_BASE_URL).toString(),
    );
    await emailService
      .sendEmail({ to: user.email, subject: template.subject, html: template.html })
      .catch((error: unknown) => log.warn("Enrollment email failed", { metadata: { error: String(error) } }));

    revalidatePath("/fr/dashboard");
    revalidatePath("/fr/dashboard/my-courses");
    revalidatePath(`/fr/formations/${course.slug}`);
    revalidatePath(`/fr/learn/${course.slug}`, "layout");

    return { success: true, message: `Vous êtes inscrit à « ${course.title} ».`, enrollment };
  } catch (error) {
    logger.error(
      "Enrollment failed",
      { metadata: { error: error instanceof Error ? error.message : "Unknown error" } },
      error instanceof Error ? error : undefined,
    );
    if (error instanceof z.ZodError) return { success: false, message: "Données invalides.", error: "VALIDATION_ERROR" };
    return { success: false, message: "L’inscription n’a pas abouti. Réessayez dans un instant.", error: "INTERNAL_ERROR" };
  }
}
