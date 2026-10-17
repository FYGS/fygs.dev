import { db } from './db';

export interface CourseProgressSummary {
  courseId: string;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  totalDurationSec: number;
  consumedDurationSec: number;
  hasCertificate: boolean;
}

export async function getUserCoursesProgress(userId: string): Promise<CourseProgressSummary[]> {
  const courses = await db.enrollment.findMany({
    where: { userId },
    select: { courseId: true, course: { select: { id: true, lessons: { select: { id: true, duration: true, published: true } } } } }
  });
  const results: CourseProgressSummary[] = [];
  for (const c of courses) {
    const lessons = c.course.lessons.filter(l => l.published);
    const totalLessons = lessons.length;
    if (totalLessons === 0) continue;
    const progresses = await db.progress.findMany({ where: { userId, lesson: { courseId: c.courseId } }, select: { lessonId: true, completed: true, watchTime: true } });
    // Only published lessons count: progress left on a lesson that was unpublished
    // since must not push the percentage above 100%
    const publishedIds = new Set(lessons.map(l => l.id));
    const completedSet = new Set(progresses.filter(p => p.completed && publishedIds.has(p.lessonId)).map(p => p.lessonId));
    const completedLessons = completedSet.size;
    const percent = Math.round((completedLessons / totalLessons) * 100);
    const totalDurationSec = lessons.reduce((a,l)=> a + (l.duration || 0), 0);
    const consumedDurationSec = progresses.reduce((a,p)=> a + p.watchTime, 0);
    const hasCertificate = percent === 100; // future: verify certificate record else issue
    results.push({
      courseId: c.courseId,
      percent,
      completedLessons,
      totalLessons,
      totalDurationSec,
      consumedDurationSec,
      hasCertificate,
    });
  }
  return results;
}
