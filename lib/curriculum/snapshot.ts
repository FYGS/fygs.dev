/**
 * Pure edits of a curriculum snapshot, mirroring what the server does. The builder applies them at once
 * (drag and drop feels instant) and replaces its state with the server's answer, or rolls back on failure.
 * Type-only imports: this file is safe to ship to the browser.
 */
import type { CurriculumSnapshot, LessonSummary, ModuleSummary } from "./curriculum";
import { moveId } from "./ordering";

function renumber<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i + 1 }));
}

export function moveModuleInSnapshot(snapshot: CurriculumSnapshot, moduleId: string, index: number): CurriculumSnapshot {
  const ids = moveId(
    snapshot.modules.map((m) => m.id),
    moduleId,
    index,
  );
  const byId = new Map(snapshot.modules.map((m) => [m.id, m]));
  return { ...snapshot, modules: renumber(ids.map((id) => byId.get(id)!)) };
}

/** Moves a lesson to `index` of a module; a lesson of the loose list can be moved into a module as well. */
export function moveLessonInSnapshot(
  snapshot: CurriculumSnapshot,
  lessonId: string,
  toModuleId: string,
  index: number,
): CurriculumSnapshot {
  const lesson =
    snapshot.looseLessons.find((l) => l.id === lessonId) ??
    snapshot.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!lesson || !snapshot.modules.some((m) => m.id === toModuleId)) return snapshot;

  const withoutLesson = (lessons: LessonSummary[]) => lessons.filter((l) => l.id !== lessonId);
  const modules: ModuleSummary[] = snapshot.modules.map((m) => {
    if (m.id === toModuleId) {
      const rest = withoutLesson(m.lessons);
      const target = Math.max(0, Math.min(index, rest.length));
      rest.splice(target, 0, { ...lesson, moduleId: toModuleId });
      return { ...m, lessons: renumber(rest) };
    }
    return m.lessons.some((l) => l.id === lessonId) ? { ...m, lessons: renumber(withoutLesson(m.lessons)) } : m;
  });
  return { modules, looseLessons: withoutLesson(snapshot.looseLessons) };
}

export function replaceLessonInSnapshot(snapshot: CurriculumSnapshot, lesson: LessonSummary): CurriculumSnapshot {
  const swap = (lessons: LessonSummary[]) => lessons.map((l) => (l.id === lesson.id ? { ...l, ...lesson, order: l.order } : l));
  return {
    modules: snapshot.modules.map((m) => ({ ...m, lessons: swap(m.lessons) })),
    looseLessons: swap(snapshot.looseLessons),
  };
}

export function allLessons(snapshot: CurriculumSnapshot): LessonSummary[] {
  return [...snapshot.looseLessons, ...snapshot.modules.flatMap((m) => m.lessons)];
}
