import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Analytics } from '@/lib/analytics-helper';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const body = await req.json().catch(() => ({}));
    const { courseId, rank } = body;
    if (!courseId) return NextResponse.json({ error: 'MISSING_COURSE_ID' }, { status: 400 });
    const userId = session?.user?.id;
    // Enrich with course metadata if available (category/level) for better reinforcement
    let category: string | undefined; let level: string | undefined; let tags: string[] = [];
    try {
      const course = await db.course.findUnique({ where: { id: courseId }, select: { category: true, level: true, tags: { include: { tag: true } } } });
      if (course) {
        category = course.category; level = course.level; tags = course.tags.map(t => t.tag.name);
      }
    } catch {}
    if (userId) {
      await Analytics.recommendationClicked(userId, { courseId, rank, category, level, tags });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
