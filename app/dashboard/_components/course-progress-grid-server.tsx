import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { CourseProgressGrid, Summary } from '@/components/dashboard/course-progress-grid';

// Server component to hydrate CourseProgressGrid with initial data using direct DB queries
// to avoid an extra client fetch on first paint.
export async function CourseProgressGridServer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return <CourseProgressGrid initialData={null} />; // Fallback, client will fetch
  const userId = session.user.id;

  // Mirror logic from /api/progress/summary but simplified (no ETag / justEarned flag needed for initial render)
  const [enrollments, progresses, certificates, lessons] = await Promise.all([
    db.enrollment.findMany({ where: { userId }, select: { courseId: true } }),
    db.progress.findMany({ where: { userId }, select: { lessonId: true, completed: true, lesson: { select: { courseId: true } } } }),
    db.certificate.findMany({ where: { userId }, select: { courseId: true } }),
    db.lesson.findMany({ where: { published: true }, select: { id: true, courseId: true } }),
  ]);

  const certSet = new Set(certificates.map(c => c.courseId));
  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessons) {
    const arr = lessonsByCourse.get(l.courseId) || [];
    arr.push(l.id);
    lessonsByCourse.set(l.courseId, arr);
  }
  const completedMap = new Map<string, Set<string>>();
  for (const p of progresses) {
    if (!p.completed) continue;
    const set = completedMap.get(p.lesson.courseId) || new Set<string>();
    set.add(p.lessonId);
    completedMap.set(p.lesson.courseId, set);
  }

  const summaries: Summary[] = enrollments.map(e => {
    const lessonIds = lessonsByCourse.get(e.courseId) || [];
    const completedSet = completedMap.get(e.courseId) || new Set<string>();
    const totalLessons = lessonIds.length;
    const completedLessons = completedSet.size;
    const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    const hasCertificate = certSet.has(e.courseId) || percent === 100;
    return { courseId: e.courseId, totalLessons, completedLessons, percent, hasCertificate };
  });

  // Reproduce ETag hash logic identical to API route
  const etagSource = JSON.stringify(summaries.map(s => [s.courseId, s.percent, s.hasCertificate]));
  let hash = 2166136261;
  for (let i = 0; i < etagSource.length; i++) {
    hash ^= etagSource.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  const etag = 'W/"' + hash.toString(16) + '"';
  return <CourseProgressGrid initialData={{ summaries }} initialEtag={etag} />;
}
