import {
  type PrismaClient,
} from "../../../lib/generated/prisma/client";
import type { EnrollmentWithRelations } from "../types";

/** Certificates for completed courses. */
export async function seedCertificates(
  prisma: PrismaClient,
  { enrollments }: { enrollments: EnrollmentWithRelations[] },
): Promise<{ completedEnrollments: EnrollmentWithRelations[] }> {
  // 15. Create certificates for completed courses
  console.log("🏆 Issuing certificates...");

  const completedEnrollments = enrollments.filter((e) => e.completedAt);

  for (const enrollment of completedEnrollments) {
    await prisma.certificate.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        issuedAt: enrollment.completedAt!,
      },
    });
  }
  console.log(`✅ Issued ${completedEnrollments.length} certificates`);

  return { completedEnrollments };
}
