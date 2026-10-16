import {
  type PrismaClient,
} from "@prisma/client";
import { randomDate, randomBetween } from "../utils";
import type { EnrollmentWithRelations } from "../types";

/** Exam results for some students. */
export async function seedExamResults(
  prisma: PrismaClient,
  { finalExams, enrollments }: { finalExams: any[]; enrollments: EnrollmentWithRelations[] },
): Promise<{ examResults: any[] }> {
  // 14. Create exam results for some students
  console.log("📊 Creating exam results...");

  const examResults: any[] = [];
  for (const exam of finalExams) {
    // Get students enrolled in this course
    const courseEnrollments = enrollments.filter(
      (e) => e.courseId === exam.courseId && e.completedAt
    );

    // Create exam results for 60% of enrolled students
    const studentsToTest = courseEnrollments.slice(
      0,
      Math.floor(courseEnrollments.length * 0.6)
    );

    for (const enrollment of studentsToTest) {
      const score = randomBetween(3, 5); // Score between 3-5 out of 5
      const total = 5;
      const percentage = Math.round((score / total) * 100);
      const passed = percentage >= exam.passingScore;

      const result = await prisma.examResult.create({
        data: {
          userId: enrollment.userId,
          examId: exam.id,
          score,
          total,
          percentage,
          passed,
          answers: [
            { questionId: 1, answer: passed ? 1 : 0 },
            { questionId: 2, answer: passed ? 2 : 1 },
            { questionId: 3, answer: passed ? 0 : 1 },
            { questionId: 4, answer: passed ? 1 : 0 },
            { questionId: 5, answer: passed ? 2 : 1 },
          ],
          completedAt: randomDate(
            enrollment.enrolledAt,
            enrollment.completedAt!
          ),
        },
      });
      examResults.push(result);
    }
  }
  console.log(`✅ Created ${examResults.length} exam results`);

  return { examResults };
}
