import { db } from "@/lib/db";
import {
  buildOutline,
  computeProgress,
  PASSING_SCORE,
  type CourseOutline,
  type CourseProgress,
} from "./outline";

/** Published lessons, quizzes with questions and the published final exam of a course, in learning order. */
export async function loadCourseOutline(courseId: string): Promise<CourseOutline> {
  const [modules, lessons, quizzes, exam] = await Promise.all([
    db.module.findMany({
      where: { courseId },
      select: { id: true, title: true, slug: true, order: true },
    }),
    db.lesson.findMany({
      where: { courseId, published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        order: true,
        duration: true,
        moduleId: true,
        isPreview: true,
      },
    }),
    db.quiz.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        moduleId: true,
        createdAt: true,
        _count: { select: { questions: true } },
      },
    }),
    db.finalExam.findFirst({
      where: { courseId, published: true },
      select: { id: true, title: true, questions: true },
    }),
  ]);

  return buildOutline({
    modules,
    lessons,
    quizzes: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      moduleId: q.moduleId,
      createdAt: q.createdAt,
      questionCount: q._count.questions,
    })),
    exam: exam
      ? {
          id: exam.id,
          title: exam.title,
          questionCount: Array.isArray(exam.questions) ? exam.questions.length : 0,
        }
      : null,
  });
}

export interface LearnerCourseState {
  outline: CourseOutline;
  progress: CourseProgress;
  completedLessonIds: Set<string>;
  passedQuizIds: Set<string>;
  examPassed: boolean;
}

/** What a learner has done in a course, and the progress it gives. One query set for every screen. */
export async function loadLearnerCourseState(
  userId: string,
  courseId: string,
  outline?: CourseOutline,
): Promise<LearnerCourseState> {
  const [resolvedOutline, completed, passed, exam] = await Promise.all([
    outline ?? loadCourseOutline(courseId),
    db.progress.findMany({
      where: { userId, completed: true, lesson: { courseId } },
      select: { lessonId: true },
    }),
    db.quizResult.findMany({
      where: { userId, quiz: { courseId }, percentage: { gte: PASSING_SCORE } },
      select: { quizId: true },
    }),
    db.examResult.findFirst({
      where: { userId, passed: true, exam: { courseId } },
      select: { id: true },
    }),
  ]);

  const completedLessonIds = new Set(completed.map((p) => p.lessonId));
  const passedQuizIds = new Set(passed.map((r) => r.quizId));
  const examPassed = exam !== null;
  return {
    outline: resolvedOutline,
    progress: computeProgress(resolvedOutline, { completedLessonIds, passedQuizIds, examPassed }),
    completedLessonIds,
    passedQuizIds,
    examPassed,
  };
}
