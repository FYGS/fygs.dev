/**
 * Certificate Issuance Service
 *
 * Implements transactional certificate issuance with single-issue guarantee
 * as defined in FR-013 and FR-040.
 *
 * Updated to use comprehensive completion tracking (lessons + quizzes + exams).
 */

import { db } from "./db";
import { CourseCompletionService } from "./course-completion.service";

export interface CertificateIssuanceResult {
  success: boolean;
  certificate?: {
    id: string;
    issuedAt: Date;
  };
  error?: string;
  alreadyIssued?: boolean;
}

export interface CourseCompletionData {
  userId: string;
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
}

export class CertificateService {
  /**
   * Issue certificate for completed course with transactional safety
   * Enforces single issuance per (userId, courseId) combination
   *
   * @param completionData - Course completion verification data
   * @returns Result with certificate details or error information
   */
  static async issueCertificate(
    completionData: CourseCompletionData
  ): Promise<CertificateIssuanceResult> {
    const { userId, courseId, completionPercentage } = completionData;

    // Verify 100% completion requirement
    if (completionPercentage < 100) {
      return {
        success: false,
        error: `Course completion is ${completionPercentage}%, certificate requires 100%`,
      };
    }

    try {
      // Use transaction to ensure atomicity and prevent race conditions
      const result = await db.$transaction(async (tx) => {
        // Check if certificate already exists (idempotent guard)
        const existingCertificate = await tx.certificate.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          select: {
            id: true,
            issuedAt: true,
          },
        });

        if (existingCertificate) {
          return {
            success: true,
            certificate: existingCertificate,
            alreadyIssued: true,
          };
        }

        // Verify enrollment exists
        const enrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          select: { id: true },
        });

        if (!enrollment) {
          throw new Error("User not enrolled in course");
        }

        // Re-verify completion percentage within transaction
        const lessons = await tx.lesson.findMany({
          where: {
            courseId,
            published: true,
          },
          select: { id: true },
        });

        const completedProgress = await tx.progress.count({
          where: {
            userId,
            lessonId: { in: lessons.map((l) => l.id) },
            completed: true,
          },
        });

        const actualCompletionPercentage =
          lessons.length > 0
            ? Math.floor((completedProgress / lessons.length) * 100)
            : 0;

        if (actualCompletionPercentage < 100) {
          throw new Error(
            `Actual completion is ${actualCompletionPercentage}%, certificate requires 100%`
          );
        }

        // Issue certificate with immutable timestamp
        const issuedAt = new Date();
        const certificate = await tx.certificate.create({
          data: {
            userId,
            courseId,
            issuedAt,
          },
          select: {
            id: true,
            issuedAt: true,
          },
        });

        return {
          success: true,
          certificate,
          alreadyIssued: false,
        };
      });

      return result;
    } catch (error) {
      console.error("Certificate issuance failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during certificate issuance",
      };
    }
  }

  /**
   * Check if user is eligible for certificate issuance
   * Uses comprehensive completion tracking (lessons + quizzes + exam)
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @returns Eligibility status with completion details
   */
  static async checkCertificateEligibility(userId: string, courseId: string) {
    try {
      // Check enrollment
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: {
          id: true,
          enrolledAt: true,
        },
      });

      if (!enrollment) {
        return {
          eligible: false,
          reason: "Not enrolled in course",
          completionPercentage: 0,
        };
      }

      // Check existing certificate
      const existingCertificate = await db.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        select: {
          id: true,
          issuedAt: true,
        },
      });

      if (existingCertificate) {
        return {
          eligible: false,
          reason: "Certificate already issued",
          completionPercentage: 100,
          certificateId: existingCertificate.id,
          issuedAt: existingCertificate.issuedAt,
        };
      }

      // Use comprehensive completion service
      const eligibility = await CourseCompletionService.checkEligibility(
        userId,
        courseId
      );

      return {
        eligible: eligibility.eligible,
        reason: eligibility.eligible
          ? "Course completed"
          : "Course not completed",
        completionPercentage: eligibility.completion,
        enrollmentId: enrollment.id,
        requirements: eligibility.requirements,
        breakdown: eligibility.breakdown,
      };
    } catch (error) {
      console.error("Certificate eligibility check failed:", error);
      return {
        eligible: false,
        reason: "Error checking eligibility",
        completionPercentage: 0,
      };
    }
  }

  /**
   * Get user's certificates
   *
   * @param userId - User ID
   * @returns List of user certificates with course details
   */
  static async getUserCertificates(userId: string) {
    try {
      const certificates = await db.certificate.findMany({
        where: { userId },
        select: {
          id: true,
          userId: true,
          courseId: true,
          issuedAt: true,
        },
        orderBy: {
          issuedAt: "desc",
        },
      });

      // Manually fetch course details for each certificate
      const certificatesWithCourses = await Promise.all(
        certificates.map(async (cert) => {
          const course = await db.course.findUnique({
            where: { id: cert.courseId },
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
            },
          });

          return {
            ...cert,
            course,
          };
        })
      );

      return certificatesWithCourses;
    } catch (error) {
      console.error("Failed to get user certificates:", error);
      return [];
    }
  }
}

export const certificateService = CertificateService;
