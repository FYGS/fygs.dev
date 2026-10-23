/**
 * Modules, lessons and lesson resources of a course.
 *
 * Every function here assumes the caller already checked who may edit the course (lib/curriculum/guard.ts):
 * the server actions do. What these functions guarantee is data integrity: positions stay 1..n without
 * holes or collisions, slugs are unique, a lesson never leaves its course, deleting a module takes its
 * lessons, quizzes and supports with it.
 */
import { db } from "@/lib/db";
import { courseMinutesFromLessons } from "@/lib/format-duration";
import { slugify, uniqueSlug } from "@/lib/text/slug";
import { isEmptyHtml } from "./content";
import { applyOrder, moveId, nextOrder, sameIdSet } from "./ordering";
import { lessonStatus, type LessonStatus } from "./publish";

export type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];
type Client = typeof db | Tx;

export type Result<T = unknown> = ({ success: true } & T) | { success: false; error: string };

const fail = (error: string): { success: false; error: string } => ({ success: false, error });

export interface LessonSummary {
  id: string;
  moduleId: string | null;
  title: string;
  slug: string;
  order: number;
  published: boolean;
  isPreview: boolean;
  /** Seconds. */
  duration: number | null;
  hasVideo: boolean;
  hasContent: boolean;
  resourceCount: number;
  status: LessonStatus;
}

export interface ModuleSummary {
  id: string;
  title: string;
  slug: string;
  order: number;
  lessons: LessonSummary[];
  quizCount: number;
  supportCount: number;
}

export interface CurriculumSnapshot {
  modules: ModuleSummary[];
  /** Lessons that belong to no module (data from before modules were required). */
  looseLessons: LessonSummary[];
}

/** The whole outline of a course, light enough to send to the browser after every change. */
export async function getCurriculum(courseId: string, client: Client = db): Promise<CurriculumSnapshot> {
  const [modules, lessons, withContent, quizzes, supports] = await Promise.all([
    client.module.findMany({ where: { courseId }, orderBy: { order: "asc" } }),
    client.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        moduleId: true,
        title: true,
        slug: true,
        order: true,
        published: true,
        isPreview: true,
        duration: true,
        videoUrl: true,
        _count: { select: { resources: true } },
      },
    }),
    client.lesson.findMany({
      where: { courseId, content: { not: null }, NOT: { content: "" } },
      select: { id: true },
    }),
    client.quiz.groupBy({ by: ["moduleId"], where: { courseId }, _count: { _all: true } }),
    client.visualSupport.groupBy({ by: ["moduleId"], where: { courseId }, _count: { _all: true } }),
  ]);

  const contentIds = new Set(withContent.map((l) => l.id));
  const summaries: LessonSummary[] = lessons.map((l) => {
    const hasVideo = Boolean(l.videoUrl?.trim());
    const hasContent = contentIds.has(l.id);
    return {
      id: l.id,
      moduleId: l.moduleId,
      title: l.title,
      slug: l.slug,
      order: l.order,
      published: l.published,
      isPreview: l.isPreview,
      duration: l.duration,
      hasVideo,
      hasContent,
      resourceCount: l._count.resources,
      status: lessonStatus({ published: l.published, hasVideo, hasContent }),
    };
  });
  const quizByModule = new Map(quizzes.map((q) => [q.moduleId, q._count._all]));
  const supportByModule = new Map(supports.map((s) => [s.moduleId, s._count._all]));
  const moduleIds = new Set(modules.map((m) => m.id));

  return {
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      order: m.order,
      lessons: summaries.filter((l) => l.moduleId === m.id),
      quizCount: quizByModule.get(m.id) ?? 0,
      supportCount: supportByModule.get(m.id) ?? 0,
    })),
    looseLessons: summaries.filter((l) => !l.moduleId || !moduleIds.has(l.moduleId)),
  };
}

/** Course duration in minutes follows the published lessons that have a duration; otherwise it is left as typed. */
export async function syncCourseDuration(courseId: string, client: Client = db): Promise<void> {
  const lessons = await client.lesson.findMany({
    where: { courseId, published: true },
    select: { duration: true },
  });
  const minutes = courseMinutesFromLessons(lessons.map((l) => l.duration));
  if (minutes > 0) await client.course.update({ where: { id: courseId }, data: { duration: minutes } });
}

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";

/** Runs `fn`; when a concurrent request took the same slug or position, tries again with fresh reads. */
async function retryOnConflict<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (error) {
      if (!isUniqueViolation(error) || i >= attempts) throw error;
    }
  }
}

async function renumberModules(tx: Tx, courseId: string, desiredIds?: string[]) {
  const rows = await tx.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  await applyOrder(rows, desiredIds ?? rows.map((r) => r.id), (id, order) =>
    tx.module.update({ where: { id }, data: { order } }),
  );
}

async function renumberLessons(tx: Tx, moduleId: string, desiredIds?: string[]) {
  const rows = await tx.lesson.findMany({
    where: { moduleId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  await applyOrder(rows, desiredIds ?? rows.map((r) => r.id), (id, order) =>
    tx.lesson.update({ where: { id }, data: { order } }),
  );
}

// ---------------------------------------------------------------- modules

export async function createModule(courseId: string, title: string): Promise<Result<{ moduleId: string }>> {
  const clean = title.trim();
  if (!clean) return fail("Le titre du module est requis.");
  if (clean.length > 150) return fail("Le titre du module est trop long (150 caractères maximum).");

  const created = await retryOnConflict(() =>
    db.$transaction(async (tx) => {
      const last = await tx.module.findMany({ where: { courseId }, select: { order: true } });
      const slug = await uniqueSlug(slugify(clean, "module"), async (s) =>
        (await tx.module.count({ where: { courseId, slug: s } })) > 0,
      );
      return tx.module.create({
        data: { courseId, title: clean, slug, order: nextOrder(last.map((m) => m.order)) },
      });
    }),
  );
  return { success: true, moduleId: created.id };
}

export async function renameModule(moduleId: string, title: string): Promise<Result> {
  const clean = title.trim();
  if (!clean) return fail("Le titre du module est requis.");
  if (clean.length > 150) return fail("Le titre du module est trop long (150 caractères maximum).");
  await db.module.update({ where: { id: moduleId }, data: { title: clean } });
  return { success: true };
}

export interface ModuleImpact {
  lessons: number;
  quizzes: number;
  supports: number;
  /** Learners who completed at least one lesson of the module: their progress on it is lost. */
  learnersWithProgress: number;
}

export async function getModuleImpact(moduleId: string): Promise<ModuleImpact> {
  const [lessons, quizzes, supports, learners] = await Promise.all([
    db.lesson.count({ where: { moduleId } }),
    db.quiz.count({ where: { moduleId } }),
    db.visualSupport.count({ where: { moduleId } }),
    db.progress.findMany({
      where: { completed: true, lesson: { moduleId } },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);
  return { lessons, quizzes, supports, learnersWithProgress: learners.length };
}

export async function deleteModule(moduleId: string): Promise<Result<{ courseId: string; lessonSlugs: string[] }>> {
  const found = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!found) return fail("Module introuvable.");

  const lessonSlugs = await db.$transaction(async (tx) => {
    const lessons = await tx.lesson.findMany({ where: { moduleId }, select: { slug: true } });
    // Lessons only point at their module (no cascade), quizzes and supports are removed by the foreign key.
    await tx.lesson.deleteMany({ where: { moduleId } });
    await tx.module.delete({ where: { id: moduleId } });
    await renumberModules(tx, found.courseId);
    await syncCourseDuration(found.courseId, tx);
    return lessons.map((l) => l.slug);
  });
  return { success: true, courseId: found.courseId, lessonSlugs };
}

export async function reorderModules(courseId: string, orderedIds: string[]): Promise<Result> {
  return db.$transaction(async (tx) => {
    const rows = await tx.module.findMany({ where: { courseId }, select: { id: true, order: true } });
    if (!sameIdSet(rows.map((r) => r.id), orderedIds)) {
      return fail("La liste des modules ne correspond plus à la formation. Rechargez la page.");
    }
    await renumberModules(tx, courseId, orderedIds);
    return { success: true } as const;
  });
}

/**
 * Publishes or hides every lesson of a module. A lesson with neither video nor content is not published
 * (a learner would open an empty page): the count of those is returned.
 */
export async function setModulePublished(
  moduleId: string,
  published: boolean,
): Promise<Result<{ changed: number; skipped: number; courseId: string }>> {
  const found = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!found) return fail("Module introuvable.");

  const result = await db.$transaction(async (tx) => {
    const lessons = await tx.lesson.findMany({
      where: { moduleId },
      select: { id: true, published: true, videoUrl: true, content: true },
    });
    const eligible = lessons.filter(
      (l) => !published || Boolean(l.videoUrl?.trim()) || (l.content ? !isEmptyHtml(l.content) : false),
    );
    const ids = eligible.filter((l) => l.published !== published).map((l) => l.id);
    if (ids.length > 0) await tx.lesson.updateMany({ where: { id: { in: ids } }, data: { published } });
    await syncCourseDuration(found.courseId, tx);
    return { changed: ids.length, skipped: lessons.length - eligible.length };
  });
  return { success: true, courseId: found.courseId, ...result };
}

// ---------------------------------------------------------------- lessons

export async function createLesson(
  courseId: string,
  moduleId: string,
  title: string,
): Promise<Result<{ lessonId: string; slug: string }>> {
  const clean = title.trim();
  if (!clean) return fail("Le titre de la leçon est requis.");
  if (clean.length > 200) return fail("Le titre de la leçon est trop long (200 caractères maximum).");

  const mod = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!mod || mod.courseId !== courseId) return fail("Ce module n'appartient pas à la formation.");

  const lesson = await retryOnConflict(() =>
    db.$transaction(async (tx) => {
      const siblings = await tx.lesson.findMany({ where: { moduleId }, select: { order: true } });
      const slug = await uniqueSlug(slugify(clean, "lecon"), async (s) =>
        (await tx.lesson.count({ where: { courseId, slug: s } })) > 0,
      );
      return tx.lesson.create({
        data: { courseId, moduleId, title: clean, slug, order: nextOrder(siblings.map((l) => l.order)), published: false },
      });
    }),
  );
  return { success: true, lessonId: lesson.id, slug: lesson.slug };
}

export interface LessonPatch {
  title?: string;
  description?: string | null;
  content?: string | null;
  videoUrl?: string | null;
  /** Seconds. */
  duration?: number | null;
  published?: boolean;
  isPreview?: boolean;
}

export interface LessonDetail {
  id: string;
  courseId: string;
  moduleId: string | null;
  title: string;
  slug: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number | null;
  published: boolean;
  isPreview: boolean;
  resources: ResourceItem[];
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  kind: "FILE" | "LINK";
  sizeBytes: number | null;
  order: number;
}

export async function getLessonDetail(lessonId: string): Promise<LessonDetail | null> {
  const l = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { resources: { orderBy: { order: "asc" } } },
  });
  if (!l) return null;
  return {
    id: l.id,
    courseId: l.courseId,
    moduleId: l.moduleId,
    title: l.title,
    slug: l.slug,
    description: l.description ?? "",
    content: l.content ?? "",
    videoUrl: l.videoUrl ?? "",
    duration: l.duration,
    published: l.published,
    isPreview: l.isPreview,
    resources: l.resources.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      kind: r.kind,
      sizeBytes: r.sizeBytes,
      order: r.order,
    })),
  };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Saves the given fields of a lesson. The slug never changes, so learners' links keep working. */
export async function updateLesson(lessonId: string, patch: LessonPatch): Promise<Result<{ lesson: LessonSummary }>> {
  const current = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true, moduleId: true, published: true, videoUrl: true, content: true },
  });
  if (!current) return fail("Leçon introuvable.");

  const data: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const title = patch.title.trim();
    if (!title) return fail("Le titre de la leçon est requis.");
    if (title.length > 200) return fail("Le titre de la leçon est trop long (200 caractères maximum).");
    data.title = title;
  }
  if (patch.description !== undefined) {
    const d = patch.description?.trim() ?? "";
    if (d.length > 500) return fail("La description est trop longue (500 caractères maximum).");
    data.description = d || null;
  }
  if (patch.content !== undefined) {
    data.content = patch.content && !isEmptyHtml(patch.content) ? patch.content : null;
  }
  if (patch.videoUrl !== undefined) {
    const v = patch.videoUrl?.trim() ?? "";
    if (v && !isHttpUrl(v)) return fail("L'adresse de la vidéo n'est pas valide (http ou https).");
    data.videoUrl = v || null;
  }
  if (patch.duration !== undefined) {
    if (patch.duration !== null && (!Number.isInteger(patch.duration) || patch.duration < 0 || patch.duration > 86_400)) {
      return fail("La durée doit être un nombre entier de secondes (24 h maximum).");
    }
    data.duration = patch.duration && patch.duration > 0 ? patch.duration : null;
  }
  if (patch.published !== undefined) data.published = patch.published;
  if (patch.isPreview !== undefined) data.isPreview = patch.isPreview;

  const published = (data.published as boolean | undefined) ?? current.published;
  const nextVideo = "videoUrl" in data ? (data.videoUrl as string | null) : current.videoUrl;
  const hasVideo = Boolean(nextVideo?.trim());
  const content = "content" in data ? (data.content as string | null) : current.content;
  const hasContent = Boolean(content && !isEmptyHtml(content));
  if (published && !hasVideo && !hasContent) {
    return fail("Une leçon publiée doit avoir une vidéo ou du contenu. Ajoutez-en, ou laissez la leçon en brouillon.");
  }

  const updated = await db.$transaction(async (tx) => {
    const lesson = await tx.lesson.update({
      where: { id: lessonId },
      data,
      include: { _count: { select: { resources: true } } },
    });
    if ("published" in data || "duration" in data) await syncCourseDuration(current.courseId, tx);
    return lesson;
  });

  return {
    success: true,
    lesson: {
      id: updated.id,
      moduleId: updated.moduleId,
      title: updated.title,
      slug: updated.slug,
      order: updated.order,
      published: updated.published,
      isPreview: updated.isPreview,
      duration: updated.duration,
      hasVideo,
      hasContent,
      resourceCount: updated._count.resources,
      status: lessonStatus({ published: updated.published, hasVideo, hasContent }),
    },
  };
}

export async function deleteLesson(lessonId: string): Promise<Result<{ courseId: string; slug: string }>> {
  const found = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { courseId: true, moduleId: true, slug: true },
  });
  if (!found) return fail("Leçon introuvable.");
  await db.$transaction(async (tx) => {
    await tx.lesson.delete({ where: { id: lessonId } });
    if (found.moduleId) await renumberLessons(tx, found.moduleId);
    await syncCourseDuration(found.courseId, tx);
  });
  return { success: true, courseId: found.courseId, slug: found.slug };
}

export async function reorderLessons(moduleId: string, orderedIds: string[]): Promise<Result> {
  return db.$transaction(async (tx) => {
    const rows = await tx.lesson.findMany({ where: { moduleId }, select: { id: true, order: true } });
    if (!sameIdSet(rows.map((r) => r.id), orderedIds)) {
      return fail("La liste des leçons ne correspond plus au module. Rechargez la page.");
    }
    await renumberLessons(tx, moduleId, orderedIds);
    return { success: true } as const;
  });
}

const PARKED_ORDER = 2_000_000;

/** Puts a lesson at `index` (0-based) of a module of the same course, in that module or another. */
export async function moveLesson(lessonId: string, toModuleId: string, index: number): Promise<Result<{ courseId: string }>> {
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true, moduleId: true } });
  if (!lesson) return fail("Leçon introuvable.");
  const target = await db.module.findUnique({ where: { id: toModuleId }, select: { courseId: true } });
  if (!target || target.courseId !== lesson.courseId) return fail("Ce module n'appartient pas à la formation.");

  await db.$transaction(async (tx) => {
    if (lesson.moduleId === toModuleId) {
      const rows = await tx.lesson.findMany({ where: { moduleId: toModuleId }, orderBy: { order: "asc" }, select: { id: true } });
      await renumberLessons(tx, toModuleId, moveId(rows.map((r) => r.id), lessonId, index));
      return;
    }
    // Park the lesson in the target module, then give the target its final order, then close the gap it left.
    await tx.lesson.update({ where: { id: lessonId }, data: { moduleId: toModuleId, order: PARKED_ORDER } });
    const rows = await tx.lesson.findMany({ where: { moduleId: toModuleId }, orderBy: { order: "asc" }, select: { id: true } });
    await renumberLessons(tx, toModuleId, moveId(rows.map((r) => r.id), lessonId, index));
    if (lesson.moduleId) await renumberLessons(tx, lesson.moduleId);
  });
  return { success: true, courseId: lesson.courseId };
}

// ---------------------------------------------------------------- resources

export interface ResourceInput {
  title: string;
  url: string;
  kind: "FILE" | "LINK";
  sizeBytes?: number | null;
}

export async function addResource(lessonId: string, input: ResourceInput): Promise<Result<{ resource: ResourceItem }>> {
  const title = input.title.trim();
  if (!title) return fail("Le titre de la ressource est requis.");
  if (title.length > 150) return fail("Le titre de la ressource est trop long (150 caractères maximum).");
  if (!isHttpUrl(input.url.trim())) return fail("L'adresse de la ressource n'est pas valide (http ou https).");

  const created = await retryOnConflict(async () => {
    const siblings = await db.lessonResource.findMany({ where: { lessonId }, select: { order: true } });
    return db.lessonResource.create({
      data: {
        lessonId,
        title,
        url: input.url.trim(),
        kind: input.kind,
        sizeBytes: input.sizeBytes ?? null,
        order: nextOrder(siblings.map((r) => r.order)),
      },
    });
  });
  return {
    success: true,
    resource: { id: created.id, title: created.title, url: created.url, kind: created.kind, sizeBytes: created.sizeBytes, order: created.order },
  };
}

export async function updateResource(resourceId: string, patch: { title: string }): Promise<Result> {
  const title = patch.title.trim();
  if (!title) return fail("Le titre de la ressource est requis.");
  await db.lessonResource.update({ where: { id: resourceId }, data: { title: title.slice(0, 150) } });
  return { success: true };
}

async function renumberResources(tx: Tx, lessonId: string, desiredIds?: string[]) {
  const rows = await tx.lessonResource.findMany({ where: { lessonId }, orderBy: { order: "asc" }, select: { id: true, order: true } });
  await applyOrder(rows, desiredIds ?? rows.map((r) => r.id), (id, order) =>
    tx.lessonResource.update({ where: { id }, data: { order } }),
  );
}

export async function deleteResource(resourceId: string): Promise<Result<{ lessonId: string }>> {
  const found = await db.lessonResource.findUnique({ where: { id: resourceId }, select: { lessonId: true } });
  if (!found) return fail("Ressource introuvable.");
  await db.$transaction(async (tx) => {
    await tx.lessonResource.delete({ where: { id: resourceId } });
    await renumberResources(tx, found.lessonId);
  });
  return { success: true, lessonId: found.lessonId };
}

export async function reorderResources(lessonId: string, orderedIds: string[]): Promise<Result> {
  return db.$transaction(async (tx) => {
    const rows = await tx.lessonResource.findMany({ where: { lessonId }, select: { id: true } });
    if (!sameIdSet(rows.map((r) => r.id), orderedIds)) return fail("La liste des ressources a changé. Rechargez la page.");
    await renumberResources(tx, lessonId, orderedIds);
    return { success: true } as const;
  });
}
