import { db } from "@/lib/db";

export interface UserCourseProgressSummary {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionRate: number; // 0-100
  lastActivityAt: Date | null;
  totalWatchTime: number; // seconds
}

export class ProgressRepository {
  static async getUserLessonProgress(userId: string) {
    return db.progress.findMany({
      where: { userId },
      select: { lessonId: true, completed: true, watchTime: true, updatedAt: true, lesson: { select: { courseId: true } } }
    });
  }

  static async getUserCourseProgress(userId: string): Promise<UserCourseProgressSummary[]> {
    // Aggregate per course using SQL-friendly approach (two queries) for clarity.
    const lessons = await db.lesson.findMany({
      where: { published: true },
      select: { id: true, courseId: true }
    });
    const progress = await this.getUserLessonProgress(userId);

    const lessonByCourse = new Map<string, number>();
    for (const l of lessons) {
      lessonByCourse.set(l.courseId, (lessonByCourse.get(l.courseId) || 0) + 1);
    }

    const accumulator: Record<string, UserCourseProgressSummary> = {};
    for (const p of progress) {
      const courseId = p.lesson.courseId;
      if (!accumulator[courseId]) {
        accumulator[courseId] = {
          courseId,
            completedLessons: 0,
          totalLessons: lessonByCourse.get(courseId) || 0,
          completionRate: 0,
          lastActivityAt: null,
          totalWatchTime: 0,
        };
      }
      const entry = accumulator[courseId];
      if (p.completed) entry.completedLessons += 1;
      entry.totalWatchTime += p.watchTime;
      if (!entry.lastActivityAt || p.updatedAt > entry.lastActivityAt) entry.lastActivityAt = p.updatedAt;
    }

    return Object.values(accumulator).map(e => ({
      ...e,
      completionRate: e.totalLessons > 0 ? Math.round((e.completedLessons / e.totalLessons) * 100) : 0,
    }));
  }

  static async getUserAggregateStats(userId: string) {
    const [progress, enrollments, certificates] = await Promise.all([
      db.progress.findMany({ where: { userId }, select: { watchTime: true, completed: true } }),
      db.enrollment.count({ where: { userId } }),
      db.certificate.count({ where: { userId } })
    ]);

    const totalWatchTime = progress.reduce((a, p) => a + p.watchTime, 0);
    const completedLessons = progress.filter(p => p.completed).length;
    const totalLessons = progress.length;
    const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return {
      enrollments,
      certificates,
      totalWatchTime,
      totalWatchHours: Math.round(totalWatchTime / 3600),
      completionRate,
    };
  }
}