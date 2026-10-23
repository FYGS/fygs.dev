import Link from "next/link";
import { Route } from "lucide-react";
import { listPathsOfCourse } from "@/lib/paths/queries";

/** « Fait partie des parcours » on a course page: the published paths that include this course. Renders nothing when there are none. */
export async function CoursePathBadges({ courseId }: { courseId: string }) {
  const paths = await listPathsOfCourse(courseId);
  if (paths.length === 0) return null;
  return (
    <section aria-labelledby="course-paths-title" className="space-y-2">
      <h2 id="course-paths-title" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Route className="h-4 w-4" aria-hidden /> Fait partie {paths.length > 1 ? "des parcours" : "du parcours"}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {paths.map((path) => (
          <li key={path.id}>
            <Link
              href={`/parcours/${path.slug}`}
              className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            >
              {path.title}
              <span className="ml-2 text-xs text-muted-foreground">{path._count.courses} formations</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
