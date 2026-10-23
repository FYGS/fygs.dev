import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";

export class QuizRepository {
  static async findByCourseId(courseId: string) {
    try {
      return await db.quiz.findMany({
        where: { courseId },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: [{ module: { order: "asc" } }, { createdAt: "asc" }],
      });
    } catch (error) {
      logger.error("Error fetching quizzes for course", {
        metadata: {
          courseId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  static async findByCourseIdAndModule(courseId: string, moduleId: string) {
    try {
      return await db.quiz.findFirst({
        where: { courseId, moduleId },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      });
    } catch (error) {
      logger.error("Error fetching quiz for course module", {
        metadata: {
          courseId,
          moduleId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  static async create(data: {
    courseId: string;
    moduleId: string;
    title: string;
  }) {
    try {
      return await db.quiz.create({
        data: {
          courseId: data.courseId,
          moduleId: data.moduleId,
          title: data.title,
        },
      });
    } catch (error) {
      logger.error("Error creating quiz", {
        metadata: {
          courseId: data.courseId,
          moduleId: data.moduleId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  static async createQuestion(data: {
    quizId: string;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    order: number;
  }) {
    try {
      return await db.quizQuestion.create({
        data: {
          quizId: data.quizId,
          question: data.question,
          options: data.options,
          correct: data.correct,
          explanation: data.explanation,
          order: data.order,
        },
      });
    } catch (error) {
      logger.error("Error creating quiz question", {
        metadata: {
          quizId: data.quizId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }
}
