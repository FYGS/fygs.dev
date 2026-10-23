import { db } from "@/lib/db";

const NEXT_LEVEL: Record<string, string> = {
  BEGINNER: "INTERMEDIATE",
  INTERMEDIATE: "ADVANCED",
  ADVANCED: "EXPERT",
};

export interface NextCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  level: string;
  category: string;
}

/**
 * What to learn after a course: published courses the learner is not enrolled in, the same
 * subject first, one level up before the same level, featured ones before the others.
 */
export async function suggestNextCourses(userId: string, courseId: string, limit = 3): Promise<NextCourse[]> {
  const current = await db.course.findUnique({ where: { id: courseId }, select: { category: true, level: true } });
  if (!current) return [];

  const candidates = await db.course.findMany({
    where: { published: true, id: { not: courseId }, enrollments: { none: { userId } } },
    select: { id: true, slug: true, title: true, description: true, thumbnail: true, level: true, category: true, featured: true },
    take: 50,
  });

  const higher = NEXT_LEVEL[current.level];
  const score = (c: (typeof candidates)[number]) =>
    (c.category === current.category ? 4 : 0) + (c.level === higher ? 2 : c.level === current.level ? 1 : 0) + (c.featured ? 0.5 : 0);

  return candidates
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title, "fr"))
    .slice(0, limit)
    .map(({ featured: _featured, ...course }) => course);
}
