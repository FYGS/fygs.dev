import {
  CourseAccessTier,
  PaymentStatus,
  PaymentKind,
  type PrismaClient,
} from "@prisma/client";
import type { EnrollmentWithRelations } from "../types";

/** Payments for premium courses. */
export async function seedPayments(
  prisma: PrismaClient,
  { enrollments, courses }: { enrollments: EnrollmentWithRelations[]; courses: any[] },
): Promise<{ premiumEnrollments: EnrollmentWithRelations[] }> {
  // 11. Create payments for premium courses
  console.log("💰 Creating payment records...");

  const premiumEnrollments = enrollments.filter(
    (e) =>
      courses.find((c) => c.id === e.courseId)?.accessTier ===
      CourseAccessTier.PREMIUM
  );

  for (const enrollment of premiumEnrollments) {
    const course = courses.find((c) => c.id === enrollment.courseId);

    await prisma.payment.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        amount: course?.price || 99.99,
        currency: "eur",
        status: PaymentStatus.COMPLETED,
        kind: PaymentKind.COURSE,
        description: `Achat du cours: ${course?.title}`,
        stripePaymentIntentId: `pi_${Math.random()
          .toString(36)
          .substring(7)}`,
        createdAt: enrollment.enrolledAt,
      },
    });
  }
  console.log(`✅ Created ${premiumEnrollments.length} payment records`);

  return { premiumEnrollments };
}
