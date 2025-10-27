import { db } from "@/lib/db";
import { logger } from "@/lib/structured-logger";

export class VisualSupportRepository {
  static async findByCourseId(courseId: string) {
    try {
      return await db.visualSupport.findMany({
        where: { courseId },
        orderBy: { moduleId: "asc", order: "asc" },
      });
    } catch (error) {
      logger.error("Error fetching visual supports for course", {
        metadata: {
          courseId,
          error: error instanceof Error ? error.message : String(error),
        }
      });
      throw error;
    }
  }

  static async findByCourseIdAndModule(courseId: string, moduleId: number) {
    try {
      return await db.visualSupport.findMany({
        where: { courseId, moduleId },
        orderBy: { order: "asc" },
      });
    } catch (error) {
      logger.error("Error fetching visual supports for course module", {
        metadata: {
          courseId,
          moduleId,
          error: error instanceof Error ? error.message : String(error),
        }
      });
      throw error;
    }
  }

  static async create(data: {
    courseId: string;
    moduleId: number;
    title: string;
    content: any;
    order: number;
  }) {
    try {
      return await db.visualSupport.create({
        data: {
          courseId: data.courseId,
          moduleId: data.moduleId,
          title: data.title,
          content: data.content,
          order: data.order,
        },
      });
    } catch (error) {
      logger.error("Error creating visual support", {
        metadata: {
          courseId: data.courseId,
          moduleId: data.moduleId,
          error: error instanceof Error ? error.message : String(error),
        }
      });
      throw error;
    }
  }
}