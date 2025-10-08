import { describe, it, expect, vi, beforeAll } from 'vitest';
import { markLessonProgress } from '@/lib/actions/lesson-progress';
import { db } from '@/lib/db';

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: async () => ({ user: { id: 'user_test' } }) } }
}));

vi.mock('next/headers', () => ({ headers: async () => new Headers() }));

// Simple in-memory stubs if needed (would require a test db or prisma sqlite config in real impl)

describe('lesson progress + certificate issuance', () => {
  let courseId = ''; let lessonIds: string[] = [];
  beforeAll(async () => {
    // create course + lessons if not existing (requires working test DB)
    // If using a real DB, adapt or skip if not available.
    const course = await db.course.create({ data: { title: 'Test Course', slug: 'test-course-'+Date.now(), description: 'd', category: 'AI', level: 'BEGINNER', published: true, accessTier: 'FREE' } });
    courseId = course.id;
    for (let i=0;i<3;i++) {
      const l = await db.lesson.create({ data: { title: 'L'+i, slug: 'l'+i, courseId, order: i, published: true } });
      lessonIds.push(l.id);
    }
  });

  it('increments watch time and marks completion', async () => {
    const r1 = await markLessonProgress({ lessonId: lessonIds[0], watchTimeIncrement: 50 });
    expect(r1.ok).toBe(true);
    const r2 = await markLessonProgress({ lessonId: lessonIds[0], completed: true });
    expect(r2.ok).toBe(true);
  expect(r2.progress?.completed).toBe(true);
  });

  it('issues certificate after all lessons complete', async () => {
    for (let i=1;i<lessonIds.length;i++) {
      await markLessonProgress({ lessonId: lessonIds[i], completed: true });
    }
    const certs = await db.certificate.findMany({ where: { userId: 'user_test', courseId } });
    expect(certs.length).toBe(1);
  });
});
