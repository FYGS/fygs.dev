/**
 * Course Completion Service
 *
 * Calculates comprehensive course completion based on:
 * - Lessons: 33.3% weight
 * - Quizzes: 33.3% weight
 * - Final Exam: 33.4% weight
 *
 * Provides unified completion tracking across all course components.
 */

import { db } from "./db";

export interface CompletionBreakdown {
  lessons: {
    completed: number;
    total: number;
    percentage: number;
    weight: number;
    weightedScore: number;
  };
  quizzes: {
    passed: number;
    total: number;
    percentage: number;
    weight: number;
    weightedScore: number;
  };
  exam: {
    passed: boolean;
    required: boolean;
    percentage: number;
    weight: number;
    weightedScore: number;
  };
  overall: {
    percentage: number;
    isComplete: boolean;
  };
}

export class CourseCompletionService {
  // Completion weights (must total 1.0)
  private static readonly LESSON_WEIGHT = 0.333;
  private static readonly QUIZ_WEIGHT = 0.333;
  private static readonly EXAM_WEIGHT = 0.334;

  // Passing threshold for quizzes and exams
  private static readonly PASSING_SCORE = 70;

  /**
   * Calculate comprehensive course completion for a user
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @returns Detailed completion breakdown
   */
  static async calculateCourseCompletion(
    userId: string,
    courseId: string
  ): Promise<CompletionBreakdown> {
    try {
      // Fetch all course components in parallel
      const [
        lessons,
        completedLessons,
        quizzes,
        passedQuizzes,
        finalExam,
        examResult,
      ] = await Promise.all([
        // Get all published lessons
        db.lesson.findMany({
          where: { courseId, published: true },
          select: { id: true },
        }),
        // Get completed lessons
        db.progress.count({
          where: {
            userId,
            completed: true,
            lesson: { courseId, published: true },
          },
        }),
        // Get all quizzes
        db.quiz.findMany({
          where: {
            courseId,
          },
          select: { id: true },
        }),
        // Get passed quizzes
        db.quizResult.count({
          where: {
            userId,
            quiz: {
              courseId,
            },
            percentage: { gte: this.PASSING_SCORE },
          },
        }),
        // Get final exam
        db.finalExam.findUnique({
          where: { courseId },
          select: {
            id: true,
            published: true,
            passingScore: true,
          },
        }),
        // Get exam result
        db.examResult.findFirst({
          where: {
            userId,
            exam: { courseId },
          },
          orderBy: { completedAt: "desc" },
          select: {
            passed: true,
            percentage: true,
          },
        }),
      ]);

      // Calculate lesson completion
      const totalLessons = lessons.length;
      const lessonCompletion =
        totalLessons > 0 ? completedLessons / totalLessons : 0;
      const lessonPercentage = Math.round(lessonCompletion * 100);
      const lessonWeightedScore = lessonCompletion * this.LESSON_WEIGHT;

      // Calculate quiz completion
      const totalQuizzes = quizzes.length;
      const quizCompletion =
        totalQuizzes > 0 ? passedQuizzes / totalQuizzes : 1; // If no quizzes, consider complete
      const quizPercentage = Math.round(quizCompletion * 100);
      const quizWeightedScore = quizCompletion * this.QUIZ_WEIGHT;

      // Calculate exam completion
      const hasExam = finalExam?.published ?? false;
      const examPassed = examResult?.passed ?? false;
      const examCompletion = hasExam ? (examPassed ? 1 : 0) : 1; // If no exam, consider complete
      const examPercentage = examCompletion * 100;
      const examWeightedScore = examCompletion * this.EXAM_WEIGHT;

      // Calculate overall completion
      const overallPercentage = Math.round(
        (lessonWeightedScore + quizWeightedScore + examWeightedScore) * 100
      );
      const isComplete = overallPercentage >= 100;

      return {
        lessons: {
          completed: completedLessons,
          total: totalLessons,
          percentage: lessonPercentage,
          weight: this.LESSON_WEIGHT,
          weightedScore: Math.round(lessonWeightedScore * 100),
        },
        quizzes: {
          passed: passedQuizzes,
          total: totalQuizzes,
          percentage: quizPercentage,
          weight: this.QUIZ_WEIGHT,
          weightedScore: Math.round(quizWeightedScore * 100),
        },
        exam: {
          passed: examPassed,
          required: hasExam,
          percentage: examPercentage,
          weight: this.EXAM_WEIGHT,
          weightedScore: Math.round(examWeightedScore * 100),
        },
        overall: {
          percentage: overallPercentage,
          isComplete,
        },
      };
    } catch (error) {
      console.error("Error calculating course completion:", error);
      // Return empty state on error
      return {
        lessons: {
          completed: 0,
          total: 0,
          percentage: 0,
          weight: this.LESSON_WEIGHT,
          weightedScore: 0,
        },
        quizzes: {
          passed: 0,
          total: 0,
          percentage: 0,
          weight: this.QUIZ_WEIGHT,
          weightedScore: 0,
        },
        exam: {
          passed: false,
          required: false,
          percentage: 0,
          weight: this.EXAM_WEIGHT,
          weightedScore: 0,
        },
        overall: {
          percentage: 0,
          isComplete: false,
        },
      };
    }
  }

  /**
   * Check if user meets certificate eligibility requirements
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @returns Eligibility status with detailed breakdown
   */
  static async checkEligibility(userId: string, courseId: string) {
    const completion = await this.calculateCourseCompletion(userId, courseId);

    return {
      eligible: completion.overall.isComplete,
      completion: completion.overall.percentage,
      requirements: {
        lessons: completion.lessons.completed === completion.lessons.total,
        quizzes: completion.quizzes.passed === completion.quizzes.total,
        exam: !completion.exam.required || completion.exam.passed,
      },
      breakdown: completion,
    };
  }

  /**
   * Get user's progress across all enrolled courses
   *
   * @param userId - User ID
   * @returns Array of course progress data
   */
  static async getUserCoursesProgress(userId: string) {
    try {
      const enrollments = await db.enrollment.findMany({
        where: { userId },
        select: {
          courseId: true,
          enrolledAt: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      });

      const progressData = await Promise.all(
        enrollments.map(async (enrollment) => {
          const completion = await this.calculateCourseCompletion(
            userId,
            enrollment.courseId
          );

          // Check for existing certificate
          const certificate = await db.certificate.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId: enrollment.courseId,
              },
            },
            select: {
              id: true,
              issuedAt: true,
            },
          });

          return {
            course: enrollment.course,
            enrolledAt: enrollment.enrolledAt,
            completion,
            certificate,
          };
        })
      );

      return progressData;
    } catch (error) {
      console.error("Error getting user courses progress:", error);
      return [];
    }
  }
}

export const courseCompletionService = CourseCompletionService;
