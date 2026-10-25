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
 * What to learn next: published courses the learner is not enrolled in. After a given course (wrap-up page), the
 * same subject first, one level up before the same level; without one (dashboard), the subjects and levels of the
 * courses the learner follows, most recent first. Featured courses come before the others at equal score.
 * The one recommendation rule of the platform.
 */
export async function suggestNextCourses(userId: string, courseId?: string | null, limit = 3): Promise<NextCourse[]> {
  const anchors = courseId
    ? await db.course.findMany({ where: { id: courseId }, select: { category: true, level: true } })
    : (
        await db.enrollment.findMany({
          where: { userId },
          orderBy: { enrolledAt: "desc" },
          take: 5,
          select: { course: { select: { category: true, level: true } } },
        })
      ).map((e) => e.course);

  const candidates = await db.course.findMany({
    where: { published: true, ...(courseId ? { id: { not: courseId } } : {}), enrollments: { none: { userId } } },
    select: { id: true, slug: true, title: true, description: true, thumbnail: true, level: true, category: true, featured: true },
    take: 60,
  });

  // The most recent course weighs most; a learner with no course gets the featured ones
  const score = (c: (typeof candidates)[number]) =>
    anchors.reduce((sum, anchor, rank) => {
      const weight = 1 / (rank + 1);
      const higher = NEXT_LEVEL[anchor.level];
      const subject = c.category === anchor.category ? 4 : 0;
      const level = c.level === higher ? 2 : c.level === anchor.level ? 1 : 0;
      return sum + weight * (subject + level);
    }, 0) + (c.featured ? 0.5 : 0);

  return candidates
    .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title, "fr"))
    .slice(0, limit)
    .map(({ featured: _featured, ...course }) => course);
}
