import { itemHref, type CourseOutline, type OutlineItem } from "./outline";

export interface CurriculumItemView {
  id: string;
  kind: OutlineItem["kind"];
  title: string;
  /** Where the item opens, or null when this visitor cannot open it. */
  href: string | null;
  /** Seconds, lessons only. */
  duration: number | null;
  questionCount: number | null;
  done: boolean;
  /** The recommended next step for this learner. */
  isNext: boolean;
  isPreview: boolean;
}

export interface CurriculumSectionView {
  id: string;
  /** null for lessons that belong to no module. */
  title: string | null;
  items: CurriculumItemView[];
}

export interface CurriculumStats {
  modules: number;
  lessons: number;
  quizzes: number;
  hasExam: boolean;
  /** Total video/reading time announced by the lessons, in minutes. */
  minutes: number;
}

export function buildCurriculumView(
  outline: CourseOutline,
  courseSlug: string,
  opts: { isDone: (item: OutlineItem) => boolean; nextId: string | null; canOpen: (item: OutlineItem) => boolean },
): CurriculumSectionView[] {
  const view = (item: OutlineItem): CurriculumItemView => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    href: opts.canOpen(item) ? itemHref(courseSlug, item) : null,
    duration: item.kind === "lesson" ? item.duration : null,
    questionCount: item.kind === "lesson" ? null : item.questionCount,
    done: opts.isDone(item),
    isNext: item.id === opts.nextId,
    isPreview: item.kind === "lesson" && item.isPreview,
  });

  const sections: CurriculumSectionView[] = outline.sections.map((section) => ({
    id: section.module?.id ?? "standalone",
    title: section.module?.title ?? null,
    items: section.items.map(view),
  }));

  const exam = outline.items.find((i) => i.kind === "exam");
  if (exam) sections.push({ id: "exam", title: "Examen final", items: [view(exam)] });
  return sections;
}

export function curriculumStats(outline: CourseOutline): CurriculumStats {
  let seconds = 0;
  let lessons = 0;
  let quizzes = 0;
  for (const item of outline.items) {
    if (item.kind === "lesson") {
      lessons++;
      seconds += item.duration ?? 0;
    } else if (item.kind === "quiz") quizzes++;
  }
  return {
    modules: outline.sections.filter((s) => s.module).length,
    lessons,
    quizzes,
    hasExam: outline.items.some((i) => i.kind === "exam"),
    minutes: Math.round(seconds / 60),
  };
}
