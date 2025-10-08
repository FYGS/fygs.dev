import { CourseSummaryDTO } from "@/types/course";

export function transformCoursesData(courses: CourseSummaryDTO[]): CourseSummaryDTO[] {
  return courses.map((course) => ({
    ...course,
    isInSubscription: true,
  }));
}