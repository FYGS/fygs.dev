import { CourseCardShared } from "@/components/courses/course-card-shared";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import type { CourseCardData } from "@/lib/access/course-cards";

export function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  return (
    <FadeInStagger>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <li key={course.id}>
            <FadeIn className="h-full">
              <CourseCardShared course={course} />
            </FadeIn>
          </li>
        ))}
      </ul>
    </FadeInStagger>
  );
}
