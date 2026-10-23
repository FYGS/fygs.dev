import { CourseCard } from "./course-card";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import { CourseSummaryDTO } from "@/types/course";

interface CourseGridProps {
  courses: CourseSummaryDTO[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <FadeInStagger>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <FadeIn key={course.id}>
            <CourseCard course={course} />
          </FadeIn>
        ))}
      </div>
    </FadeInStagger>
  );
}
