"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { CertificateService } from "@/lib/certificate-service";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { auth } from "@/lib/auth";

const issueCertificateSchema = z.object({
  courseId: z.string().cuid(),
});

export type IssueCertificateResult = {
  success: boolean;
  message: string;
  certificate?: {
    id: string;
    issuedAt: Date;
    courseTitle?: string;
  };
  error?: string;
  alreadyIssued?: boolean;
  eligibility?: {
    eligible: boolean;
    reason: string;
    completionPercentage: number;
  };
};

export async function issueCertificate(
  input: z.infer<typeof issueCertificateSchema>
): Promise<IssueCertificateResult> {
  try {
    // Validate input
    const { courseId } = issueCertificateSchema.parse(input);

    // Get authenticated user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      };
    }

    const userId = session.user.id;

    // Check eligibility first
    const eligibility = await CertificateService.checkCertificateEligibility(
      userId,
      courseId
    );

    if (!eligibility.eligible) {
      return {
        success: false,
        message: eligibility.reason,
        error: "NOT_ELIGIBLE",
        eligibility: {
          eligible: eligibility.eligible,
          reason: eligibility.reason,
          completionPercentage: eligibility.completionPercentage,
        },
      };
    }

    // Handle already issued case
    if (eligibility.reason === "Certificate already issued") {
      const certificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Certificate already issued",
        certificate: certificate
          ? {
              id: certificate.id,
              issuedAt: certificate.issuedAt,
              courseTitle: certificate.course.title,
            }
          : undefined,
        alreadyIssued: true,
      };
    }

    // Issue new certificate
    const issuanceData = {
      userId,
      courseId,
      completedLessons: eligibility.breakdown?.lessons.completed || 0,
      totalLessons: eligibility.breakdown?.lessons.total || 0,
      completionPercentage: eligibility.completionPercentage,
    };

    const result = await CertificateService.issueCertificate(issuanceData);

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to issue certificate",
        error: "ISSUANCE_FAILED",
      };
    }

    // Get course title for response
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    // Log analytics event
    await AnalyticsHelper.recordCertificateIssuance(userId, {
      certificateId: result.certificate!.id,
      courseId,
      courseTitle: course?.title,
      completionDate: new Date().toISOString(),
      totalLessons: eligibility.breakdown?.lessons.total || 0,
      totalWatchTime: 0, // TODO: Calculate actual watch time
      timestamp: new Date().toISOString(),
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/certificates");
    revalidatePath(`/formations/${courseId}`);
    revalidatePath(`/certificates/${courseId}`);

    return {
      success: true,
      message: `Certificate issued for ${course?.title || "course"}`,
      certificate: {
        id: result.certificate!.id,
        issuedAt: result.certificate!.issuedAt,
        courseTitle: course?.title,
      },
      alreadyIssued: result.alreadyIssued,
    };
  } catch (error) {
    console.error("Certificate issuance failed:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid input data",
        error: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      message: "Failed to issue certificate",
      error: "INTERNAL_ERROR",
    };
  }
}
