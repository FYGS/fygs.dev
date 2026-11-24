import { db } from "@/lib/db";
import { canOpenItem, resolveLearnerAccess, type LearnerMode } from "./access";
import { loadCourseOutline } from "./course-state";

export interface LessonAccess {
  /** The visitor may open the lesson (free sample, entitled learner, or the course's staff). */
  canOpen: boolean;
  mode: LearnerMode;
  /** The lesson's video captions address (stored), when it may be opened. */
  captionsUrl: string | null;
  courseId: string;
}

/**
 * Whether this visitor (`null`: not signed in) may open one lesson, by the same rule as the learning pages:
 * the staff of the course see every lesson, published or not; others see the published lessons the access mode
 * opens (all of them, or the free samples only). `null` when the lesson does not exist.
 */
export async function getLessonAccess(
  viewer: { id: string; role?: string | null } | null,
  lessonId: string,
): Promise<LessonAccess | null> {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      published: true,
      captionsUrl: true,
      course: { select: { id: true, published: true, instructorId: true } },
    },
  });
  if (!lesson) return null;

  const outline = await loadCourseOutline(lesson.course.id);
  const access = await resolveLearnerAccess({ userId: viewer?.id ?? null, role: viewer?.role, course: lesson.course, outline });
  const item = outline.items.find((i) => i.kind === "lesson" && i.id === lesson.id);
  const canOpen =
    access.mode === "staff" || (lesson.published && !!item && canOpenItem(access.mode, item, outline, new Set(access.previewLessonIds)));
  return { canOpen, mode: access.mode, captionsUrl: canOpen ? lesson.captionsUrl : null, courseId: lesson.course.id };
}
