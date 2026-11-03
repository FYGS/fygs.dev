/**
 * Certificate Issuance Service
 *
 * Transactional certificate issuance with a single-issue guarantee (FR-013, FR-040).
 * Completion is the one rule of lib/learning/outline.ts: every published lesson done,
 * every quiz passed and the final exam passed when the course has one.
 */

import { db } from "./db";
import { AccessService } from "./access-service";
import { cleanDisplayName } from "./html-escape";
import { loadLearnerCourseState } from "./learning/course-state";
import { withPurchaseLock } from "./payments/locks";

export interface CertificateIssuanceResult {
  success: boolean;
  certificate?: {
    id: string;
    code: string;
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

const certificateSelect = { id: true, code: true, issuedAt: true } as const;

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
      // Under the buyer's purchase lock (lib/payments/locks.ts): a refund of this learner and this issuance exclude each
      // other, whichever takes the lock first. The learner must still be entitled once the lock is held.
      const result = await withPurchaseLock(userId, courseId, async (tx) => {
        // Check if certificate already exists (idempotent guard)
        const existingCertificate = await tx.certificate.findUnique({
          where: { userId_courseId: { userId, courseId } },
          select: certificateSelect,
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
          where: { userId_courseId: { userId, courseId } },
          select: { id: true },
        });

        if (!enrollment) {
          throw new Error("User not enrolled in course");
        }

        // Entitlement, read after the lock was taken: a refund committed before this point has closed the access
        const access = await AccessService.checkCourseAccess(userId, courseId);
        if (!access.canAccessCourse) {
          throw new Error("User is no longer entitled to the course");
        }

        // Re-verify completion from the records, whatever the caller claims
        const { progress } = await loadLearnerCourseState(userId, courseId);
        if (!progress.isComplete) {
          throw new Error(
            `Actual completion is ${progress.percent}%, certificate requires 100%`
          );
        }

        // The name printed is the one at issue time, cleaned: renaming the account later does not rewrite a certificate
        const holder = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
        const certificate = await tx.certificate.create({
          data: { userId, courseId, issuedAt: new Date(), holderName: cleanDisplayName(holder?.name) || null },
          select: certificateSelect,
        });

        return {
          success: true,
          certificate,
          alreadyIssued: false,
        };
      });

      return result;
    } catch (error) {
      // Concurrent issuance: another request created the certificate between our
      // existence check and our insert (unique userId+courseId). The transaction is
      // aborted at that point, so read the winner's row outside of it and answer
      // as for any later attempt.
      if ((error as { code?: string } | null)?.code === "P2002") {
        const existing = await db.certificate.findUnique({
          where: { userId_courseId: { userId, courseId } },
          select: certificateSelect,
        });
        if (existing) {
          return { success: true, certificate: existing, alreadyIssued: true };
        }
      }

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
}
