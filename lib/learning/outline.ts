/**
 * The shape of a course as a learner walks through it, and the single rule for progress.
 *
 * Order: modules by `order`; inside a module the lessons by `order`, then its quiz(zes);
 * the final exam closes the course. Lessons that belong to no module (legacy data) come first.
 * Every screen (course page, lesson sidebar, dashboard, certificate) reads progress from here, so
 * they all show the same number.
 *
 * Rule: progress = items done / items total, where an item is a published lesson, a quiz or the
 * published final exam. A lesson is done when it is marked complete, a quiz when its best score
 * reaches `PASSING_SCORE`, the exam when it was passed. The course is complete when every item is.
 * Navigation is free: nothing is locked, the order is a recommendation.
 */

export const PASSING_SCORE = 70;

export interface OutlineModule {
  id: string;
  title: string;
  slug: string;
  order: number;
}

export interface OutlineLessonInput {
  id: string;
  slug: string;
  title: string;
  order: number;
  duration: number | null;
  moduleId: string | null;
  isPreview?: boolean;
}

export interface OutlineQuizInput {
  id: string;
  title: string;
  moduleId: string;
  questionCount: number;
  createdAt?: Date | string;
}

export interface OutlineExamInput {
  id: string;
  title: string;
  questionCount: number;
}

export type OutlineItem =
  | {
      kind: "lesson";
      id: string;
      slug: string;
      title: string;
      duration: number | null;
      isPreview: boolean;
      moduleId: string | null;
    }
  | { kind: "quiz"; id: string; title: string; questionCount: number; moduleId: string }
  | { kind: "exam"; id: string; title: string; questionCount: number };

export interface OutlineSection {
  /** `null` for lessons that belong to no module. */
  module: OutlineModule | null;
  items: OutlineItem[];
}

export interface CourseOutline {
  sections: OutlineSection[];
  /** Every item in the order a learner should take them. */
  items: OutlineItem[];
}

export function buildOutline(input: {
  modules: OutlineModule[];
  lessons: OutlineLessonInput[];
  quizzes: OutlineQuizInput[];
  exam?: OutlineExamInput | null;
}): CourseOutline {
  const modules = [...input.modules].sort((a, b) => a.order - b.order);
  const moduleIds = new Set(modules.map((m) => m.id));
  const lessonItem = (l: OutlineLessonInput): OutlineItem => ({
    kind: "lesson",
    id: l.id,
    slug: l.slug,
    title: l.title,
    duration: l.duration,
    isPreview: l.isPreview ?? false,
    moduleId: l.moduleId,
  });
  const byOrder = (a: OutlineLessonInput, b: OutlineLessonInput) => a.order - b.order;
  const time = (d?: Date | string) => (d ? new Date(d).getTime() : 0);

  const sections: OutlineSection[] = [];

  // A lesson whose module is gone is treated like a standalone lesson rather than hidden.
  const standalone = input.lessons
    .filter((l) => !l.moduleId || !moduleIds.has(l.moduleId))
    .sort(byOrder);
  if (standalone.length > 0) sections.push({ module: null, items: standalone.map(lessonItem) });

  for (const m of modules) {
    const items: OutlineItem[] = input.lessons
      .filter((l) => l.moduleId === m.id)
      .sort(byOrder)
      .map(lessonItem);
    const quizzes = input.quizzes
      .filter((q) => q.moduleId === m.id && q.questionCount > 0)
      .sort((a, b) => time(a.createdAt) - time(b.createdAt));
    for (const q of quizzes) {
      items.push({
        kind: "quiz",
        id: q.id,
        title: q.title,
        questionCount: q.questionCount,
        moduleId: m.id,
      });
    }
    if (items.length > 0) sections.push({ module: m, items });
  }

  const items = sections.flatMap((s) => s.items);
  if (input.exam && input.exam.questionCount > 0) {
    items.push({
      kind: "exam",
      id: input.exam.id,
      title: input.exam.title,
      questionCount: input.exam.questionCount,
    });
  }
  return { sections, items };
}

export interface ProgressInput {
  completedLessonIds: ReadonlySet<string>;
  /** Quizzes whose best score reached `PASSING_SCORE`. */
  passedQuizIds: ReadonlySet<string>;
  examPassed: boolean;
}

export interface CourseProgress {
  total: number;
  done: number;
  /** 0 to 100, 100 only when every item is done. */
  percent: number;
  isComplete: boolean;
  lessons: { done: number; total: number };
  quizzes: { done: number; total: number };
  exam: { required: boolean; passed: boolean };
  /** First item not done, in course order: where "continue" goes. `null` when complete or empty. */
  next: OutlineItem | null;
}

export function isItemDone(item: OutlineItem, p: ProgressInput): boolean {
  if (item.kind === "lesson") return p.completedLessonIds.has(item.id);
  if (item.kind === "quiz") return p.passedQuizIds.has(item.id);
  return p.examPassed;
}

export function computeProgress(outline: CourseOutline, p: ProgressInput): CourseProgress {
  let lessonsDone = 0;
  let lessonsTotal = 0;
  let quizzesDone = 0;
  let quizzesTotal = 0;
  let exam = { required: false, passed: false };
  let next: OutlineItem | null = null;

  for (const item of outline.items) {
    const done = isItemDone(item, p);
    if (item.kind === "lesson") {
      lessonsTotal++;
      if (done) lessonsDone++;
    } else if (item.kind === "quiz") {
      quizzesTotal++;
      if (done) quizzesDone++;
    } else {
      exam = { required: true, passed: done };
    }
    if (!done && !next) next = item;
  }

  const total = outline.items.length;
  const done = lessonsDone + quizzesDone + (exam.passed ? 1 : 0);
  // Rounded down so that 99.6 % never reads 100 % while something is left.
  const percent = total === 0 ? 0 : Math.floor((done / total) * 100);
  return {
    total,
    done,
    percent,
    isComplete: total > 0 && done === total,
    lessons: { done: lessonsDone, total: lessonsTotal },
    quizzes: { done: quizzesDone, total: quizzesTotal },
    exam,
    next,
  };
}

/** Route of an item inside the learning area. */
export function itemHref(courseSlug: string, item: OutlineItem): string {
  const base = `/learn/${courseSlug}`;
  if (item.kind === "lesson") return `${base}/lessons/${item.slug}`;
  if (item.kind === "quiz") return `${base}/quizzes/${item.id}`;
  return `${base}/exam`;
}

/** The items just before and after `itemId` in course order. */
export function neighbours(
  outline: CourseOutline,
  itemId: string,
): { previous: OutlineItem | null; next: OutlineItem | null } {
  const index = outline.items.findIndex((i) => i.id === itemId);
  if (index === -1) return { previous: null, next: null };
  return { previous: outline.items[index - 1] ?? null, next: outline.items[index + 1] ?? null };
}
