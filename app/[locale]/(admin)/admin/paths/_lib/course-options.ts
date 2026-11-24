import { db } from "@/lib/db";
import type { CourseOption } from "../_components/path-editor";

/** Every course, published or not: the editor lists the published ones to pick from and flags the others. */
export async function loadCourseOptions(): Promise<CourseOption[]> {
  const courses = await db.course.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      level: true,
      thumbnail: true,
      accessTier: true,
      published: true,
      _count: { select: { lessons: { where: { published: true } } } },
    },
  });
  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    level: c.level,
    thumbnail: c.thumbnail,
    accessTier: c.accessTier,
    published: c.published,
    lessonsCount: c._count.lessons,
  }));
}
