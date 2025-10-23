import { CourseCard } from "./course-card";
import { FadeIn, FadeInStagger } from "@/components/ui/motion";
import { CourseSummaryDTO } from "@/types/course";

interface CourseGridProps { courses: CourseSummaryDTO[] }

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Aucune formation trouvée</h3>
        <p className="text-muted-foreground">
          Essayez de modifier vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <FadeInStagger>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <FadeIn key={course.id}>
            <CourseCard course={course} />
          </FadeIn>
        ))}
      </div>
    </FadeInStagger>
  );
}
