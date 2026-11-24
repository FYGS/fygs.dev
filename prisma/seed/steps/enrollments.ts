import {
  type PrismaClient,
  type User,
} from "../../../lib/generated/prisma/client";
import { randomDate } from "../utils";

/** Enrollments with realistic patterns. */
export async function seedEnrollments(
  prisma: PrismaClient,
  { courses, students }: { courses: any[]; students: User[] },
): Promise<void> {
  // 7. Create enrollments with realistic patterns
  console.log("🎓 Creating enrollment patterns...");
  const enrollmentPatterns = [
    // Free courses - multiple enrollments
    { courseIndex: 0, studentIndexes: [0, 1, 2, 3, 4, 5, 6, 7] }, // JavaScript Fundamentals
    { courseIndex: 3, studentIndexes: [1, 2, 4, 5, 7, 8] }, // TypeScript
    { courseIndex: 6, studentIndexes: [0, 3, 5, 6, 9] }, // Frontend Fundamentals
    // Premium courses - fewer enrollments (premium students only)
    { courseIndex: 1, studentIndexes: [0, 1, 7] }, // React Advanced
    { courseIndex: 2, studentIndexes: [0, 1, 2, 7] }, // Next.js Full-Stack
    { courseIndex: 4, studentIndexes: [0, 1, 7] }, // AI Applications
    { courseIndex: 5, studentIndexes: [1, 7] }, // DevOps
    { courseIndex: 7, studentIndexes: [0, 1] }, // Backend Architecture
  ];

  for (const pattern of enrollmentPatterns) {
    const course = courses[pattern.courseIndex];

    for (const studentIndex of pattern.studentIndexes) {
      const student = students[studentIndex];

      await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          enrolledAt: randomDate(
            new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            new Date()
          ),
          completedAt:
            Math.random() < 0.3
              ? randomDate(
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  new Date()
                )
              : null,
        },
      });
    }
  }
  console.log("✅ Created realistic enrollment patterns");
}
