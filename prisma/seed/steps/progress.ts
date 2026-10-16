import {
  type PrismaClient,
} from "@prisma/client";
import { randomDate } from "../utils";
import type { EnrollmentWithRelations } from "../types";

/** Lesson progress tracking. */
export async function seedProgress(
  prisma: PrismaClient,
  { enrollments }: { enrollments: EnrollmentWithRelations[] },
): Promise<void> {
  // 10. Create progress tracking data
  console.log("📊 Creating progress tracking data...");

  const progressEnrollments = enrollments.filter(() => Math.random() < 0.7); // 70% have progress

  for (const enrollment of progressEnrollments) {
    // Get lessons for this course
    const lessons = await prisma.lesson.findMany({
      where: { courseId: enrollment.courseId },
      orderBy: { order: "asc" },
    });

    // Create progress for a portion of lessons
    const progressPercentage = Math.random();
    const lessonsToComplete = Math.floor(lessons.length * progressPercentage);

    for (let i = 0; i < lessonsToComplete; i++) {
      const lesson = lessons[i];
      const isCompleted = i < lessonsToComplete - 1 || Math.random() < 0.8;

      await prisma.progress.create({
        data: {
          userId: enrollment.userId,
          lessonId: lesson.id,
          completed: isCompleted,
          watchTime: Math.floor(
            (lesson.duration || 30) * (0.7 + Math.random() * 0.5)
          ), // 70-120% of lesson duration
          completedAt: isCompleted
            ? randomDate(enrollment.enrolledAt, new Date())
            : null,
          createdAt: enrollment.enrolledAt,
        },
      });
    }
  }
  console.log("✅ Created realistic progress tracking data");
}
