"use server";

import { z } from "zod";
import * as curriculum from "@/lib/curriculum/curriculum";
import { guardCourse, guardLesson, guardModule, guardResource } from "@/lib/curriculum/guard";
import { revalidateCourse } from "@/lib/curriculum/revalidate";
import {
  failure,
  snapshotAfterChange,
  unexpected,
  type ActionFailure,
  type SnapshotResult,
} from "../../_actions/shared";

const id = z.string().min(1).max(64);
const title = z.string().max(300);
const ids = z.array(id).max(500);

/** The outline of a course; used to refresh the builder. */
export async function loadCurriculum(courseId: string): Promise<SnapshotResult> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    return { success: true, snapshot: await curriculum.getCurriculum(g.course.id) };
  } catch (error) {
    return unexpected("loadCurriculum", error);
  }
}

// ---------------------------------------------------------------- modules

export async function addModule(courseId: string, moduleTitle: string): Promise<SnapshotResult & { moduleId?: string }> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.createModule(g.course.id, title.parse(moduleTitle));
    if (!r.success) return r;
    return { ...(await snapshotAfterChange(g.course)), moduleId: r.moduleId };
  } catch (error) {
    return unexpected("addModule", error);
  }
}

export async function renameModule(moduleId: string, moduleTitle: string): Promise<SnapshotResult> {
  try {
    const g = await guardModule(id.parse(moduleId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.renameModule(g.module.id, title.parse(moduleTitle));
    if (!r.success) return r;
    return snapshotAfterChange(g.course);
  } catch (error) {
    return unexpected("renameModule", error);
  }
}

/** What deleting a module would remove: shown in the confirmation dialog. */
export async function getModuleImpact(
  moduleId: string,
): Promise<({ success: true } & curriculum.ModuleImpact) | ActionFailure> {
  try {
    const g = await guardModule(id.parse(moduleId));
    if (!g.ok) return failure(g.error);
    return { success: true, ...(await curriculum.getModuleImpact(g.module.id)) };
  } catch (error) {
    return unexpected("getModuleImpact", error);
  }
}

export async function removeModule(moduleId: string): Promise<SnapshotResult> {
  try {
    const g = await guardModule(id.parse(moduleId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.deleteModule(g.module.id);
    if (!r.success) return r;
    return snapshotAfterChange(g.course, { lessonSlugs: r.lessonSlugs });
  } catch (error) {
    return unexpected("removeModule", error);
  }
}

export async function reorderModules(courseId: string, orderedIds: string[]): Promise<SnapshotResult> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.reorderModules(g.course.id, ids.parse(orderedIds));
    if (!r.success) return r;
    return snapshotAfterChange(g.course);
  } catch (error) {
    return unexpected("reorderModules", error);
  }
}

export async function setModulePublished(
  moduleId: string,
  published: boolean,
): Promise<(SnapshotResult & { changed?: number; skipped?: number })> {
  try {
    const g = await guardModule(id.parse(moduleId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.setModulePublished(g.module.id, z.boolean().parse(published));
    if (!r.success) return r;
    return { ...(await snapshotAfterChange(g.course)), changed: r.changed, skipped: r.skipped };
  } catch (error) {
    return unexpected("setModulePublished", error);
  }
}

// ---------------------------------------------------------------- lessons

export async function addLesson(
  courseId: string,
  moduleId: string,
  lessonTitle: string,
): Promise<SnapshotResult & { lessonId?: string }> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.createLesson(g.course.id, id.parse(moduleId), title.parse(lessonTitle));
    if (!r.success) return r;
    return { ...(await snapshotAfterChange(g.course)), lessonId: r.lessonId };
  } catch (error) {
    return unexpected("addLesson", error);
  }
}

/** The full lesson (content, video, resources) for the editing panel. */
export async function loadLesson(
  lessonId: string,
): Promise<({ success: true; lesson: curriculum.LessonDetail } | ActionFailure)> {
  try {
    const g = await guardLesson(id.parse(lessonId));
    if (!g.ok) return failure(g.error);
    const lesson = await curriculum.getLessonDetail(g.lesson.id);
    return lesson
      ? { success: true, lesson }
      : failure("Leçon introuvable.");
  } catch (error) {
    return unexpected("loadLesson", error);
  }
}

const lessonPatch = z.object({
  title: title.optional(),
  description: z.string().max(2000).nullable().optional(),
  content: z.string().max(2_000_000).nullable().optional(),
  videoUrl: z.string().max(2000).nullable().optional(),
  duration: z.number().int().nullable().optional(),
  published: z.boolean().optional(),
  isPreview: z.boolean().optional(),
});

/** Autosave of the editing panel: saves the fields given and returns the lesson's new summary. */
export async function saveLesson(
  lessonId: string,
  patch: z.input<typeof lessonPatch>,
): Promise<({ success: true; lesson: curriculum.LessonSummary } | ActionFailure)> {
  try {
    const g = await guardLesson(id.parse(lessonId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.updateLesson(g.lesson.id, lessonPatch.parse(patch));
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], lessonSlugs: [g.lesson.slug] });
    return r;
  } catch (error) {
    return unexpected("saveLesson", error);
  }
}

export async function removeLesson(lessonId: string): Promise<SnapshotResult> {
  try {
    const g = await guardLesson(id.parse(lessonId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.deleteLesson(g.lesson.id);
    if (!r.success) return r;
    return snapshotAfterChange(g.course, { lessonSlugs: [r.slug] });
  } catch (error) {
    return unexpected("removeLesson", error);
  }
}

export async function reorderLessons(moduleId: string, orderedIds: string[]): Promise<SnapshotResult> {
  try {
    const g = await guardModule(id.parse(moduleId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.reorderLessons(g.module.id, ids.parse(orderedIds));
    if (!r.success) return r;
    return snapshotAfterChange(g.course);
  } catch (error) {
    return unexpected("reorderLessons", error);
  }
}

/** Moves a lesson to `index` of a module (the same one or another one of the course). */
export async function moveLesson(lessonId: string, toModuleId: string, index: number): Promise<SnapshotResult> {
  try {
    const g = await guardLesson(id.parse(lessonId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.moveLesson(g.lesson.id, id.parse(toModuleId), z.number().int().min(0).max(1000).parse(index));
    if (!r.success) return r;
    return snapshotAfterChange(g.course);
  } catch (error) {
    return unexpected("moveLesson", error);
  }
}

// ---------------------------------------------------------------- resources

const resourceInput = z.object({
  title: z.string().max(300),
  url: z.string().max(2000),
  kind: z.enum(["FILE", "LINK"]),
  sizeBytes: z.number().int().min(0).nullable().optional(),
});

export async function addLessonResource(
  lessonId: string,
  input: z.input<typeof resourceInput>,
): Promise<({ success: true; resource: curriculum.ResourceItem } | ActionFailure)> {
  try {
    const g = await guardLesson(id.parse(lessonId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.addResource(g.lesson.id, resourceInput.parse(input));
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], lessonSlugs: [g.lesson.slug] });
    return r;
  } catch (error) {
    return unexpected("addLessonResource", error);
  }
}

export async function renameLessonResource(resourceId: string, resourceTitle: string): Promise<{ success: true } | ActionFailure> {
  try {
    const g = await guardResource(id.parse(resourceId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.updateResource(g.resource.id, { title: title.parse(resourceTitle) });
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], lessonSlugs: [g.lesson.slug] });
    return { success: true };
  } catch (error) {
    return unexpected("renameLessonResource", error);
  }
}

export async function removeLessonResource(resourceId: string): Promise<{ success: true } | ActionFailure> {
  try {
    const g = await guardResource(id.parse(resourceId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.deleteResource(g.resource.id);
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug] });
    return { success: true };
  } catch (error) {
    return unexpected("removeLessonResource", error);
  }
}

export async function reorderLessonResources(lessonId: string, orderedIds: string[]): Promise<{ success: true } | ActionFailure> {
  try {
    const g = await guardLesson(id.parse(lessonId));
    if (!g.ok) return failure(g.error);
    const r = await curriculum.reorderResources(g.lesson.id, ids.parse(orderedIds));
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], lessonSlugs: [g.lesson.slug] });
    return { success: true };
  } catch (error) {
    return unexpected("reorderLessonResources", error);
  }
}
