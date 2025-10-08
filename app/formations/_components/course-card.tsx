import { CourseCardShared } from "@/components/courses/course-card-shared";
import { CourseSummaryDTO } from "@/types/course";
import { AccessService } from "@/lib/access-service";

interface CourseCardProps { course: CourseSummaryDTO }

export function CourseCard({ course }: CourseCardProps) {
  // Determine access state using unified resolver. The parent transformer already enriched course with access flags (isUnlocked, etc.).
  const isFree = course.price === 0 || course.requiredTier === 'FREE';
  // Access state: FREE (not enrolled & free), ENROLLED (enrolled), LOCKED otherwise.
  const accessState = AccessService.resolveAccessState({
    hasActiveSubscription: !!course.isInSubscription,
    isEnrolledInCourse: !!course.isEnrolled,
    canAccessCourse: !!course.isEnrolled,
    canAccessLessons: !!course.isEnrolled,
    isFreeCourse: isFree,
    isPremiumCourse: !isFree,
    subscriptionStatus: undefined,
    enrollmentDate: undefined,
    canPreviewFirstLesson: !!course.previewEnabled && !course.isEnrolled,
    accessReason: !!course.isEnrolled ? 'ok' : (!!course.previewEnabled ? 'preview_only' : 'not_enrolled')
  });

  return <CourseCardShared course={course as any} accessState={accessState} showPreviewCTA size="default" />;
}
