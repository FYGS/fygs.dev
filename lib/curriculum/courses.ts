/**
 * Course-level operations of the builder: create, edit, rename the URL, publish, duplicate, delete.
 * Callers have already checked who may edit the course (lib/curriculum/guard.ts).
 */
import { db } from "@/lib/db";
import type { CourseAccessTier, CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";
import { slugify, uniqueSlug } from "@/lib/text/slug";
import { normalizeFaq, normalizeObjectives, normalizeTrailerUrl, isEmptyHtml, type FaqEntry } from "./content";
import { syncCourseDuration, type Result } from "./curriculum";
import { checkPublishReadiness, type Readiness } from "./publish";
import { SLUG_PATTERN } from "./slug-pattern";

const fail = (error: string): { success: false; error: string } => ({ success: false, error });

export { SLUG_PATTERN };

export async function isCourseSlugTaken(slug: string, exceptCourseId?: string): Promise<boolean> {
  const found = await db.course.findUnique({ where: { slug }, select: { id: true } });
  return found !== null && found.id !== exceptCourseId;
}

// ---------------------------------------------------------------- create

export interface NewCourseInput {
  title: string;
  category: CourseCategory;
  level: CourseLevel;
}

/** A draft with just enough to open the builder. An instructor owns what they create; an admin's course starts unassigned. */
export async function createCourseDraft(
  user: { id: string; role: "ADMIN" | "INSTRUCTOR" },
  input: NewCourseInput,
): Promise<Result<{ courseId: string; slug: string }>> {
  const title = input.title.trim();
  if (title.length < 3) return fail("Le titre doit contenir au moins 3 caractères.");
  if (title.length > 120) return fail("Le titre est trop long (120 caractères maximum).");

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = await uniqueSlug(slugify(title, "formation"), (s) => isCourseSlugTaken(s));
    try {
      const course = await db.course.create({
        data: {
          title,
          slug,
          description: "",
          category: input.category,
          level: input.level,
          accessTier: "FREE",
          published: false,
          instructorId: user.role === "INSTRUCTOR" ? user.id : null,
          objectives: [],
        },
      });
      return { success: true, courseId: course.id, slug: course.slug };
    } catch (error) {
      if ((error as { code?: string }).code !== "P2002") throw error;
    }
  }
  return fail("Impossible de réserver une adresse pour cette formation. Réessayez.");
}

// ---------------------------------------------------------------- edit

/** Fields the builder may change. `published` is deliberately absent: only `setCoursePublished` publishes. */
export interface CoursePatch {
  title?: string;
  description?: string;
  /** `null` removes the image. */
  thumbnail?: string | null;
  category?: CourseCategory;
  level?: CourseLevel;
  accessTier?: CourseAccessTier;
  price?: number | null;
  /** Minutes. Overwritten by the lessons' total as soon as they have durations. */
  duration?: number | null;
  previewEnabled?: boolean;
  objectives?: string[];
  faq?: FaqEntry[];
  trailerUrl?: string | null;
  publicPrerequisites?: string | null;
  publicStructure?: string | null;
  publicResources?: string | null;
  publicEvaluation?: string | null;
  tagIds?: string[];
}

/** Fields only an administrator may change. */
export interface AdminCoursePatch {
  featured?: boolean;
  instructorId?: string | null;
}

export async function updateCourseInfo(
  courseId: string,
  patch: CoursePatch,
  adminPatch: AdminCoursePatch = {},
): Promise<Result> {
  const data: Record<string, unknown> = {};

  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (t.length < 3) return fail("Le titre doit contenir au moins 3 caractères.");
    if (t.length > 120) return fail("Le titre est trop long (120 caractères maximum).");
    data.title = t;
  }
  if (patch.description !== undefined) {
    if (patch.description.length > 2000) return fail("La description est trop longue (2000 caractères maximum).");
    data.description = patch.description.trim();
  }
  if (patch.thumbnail !== undefined) data.thumbnail = patch.thumbnail?.trim() || null;
  if (patch.category !== undefined) data.category = patch.category;
  if (patch.level !== undefined) data.level = patch.level;
  if (patch.accessTier !== undefined) data.accessTier = patch.accessTier;
  if (patch.price !== undefined) {
    if (patch.price !== null && (!Number.isFinite(patch.price) || patch.price < 0 || patch.price > 100_000)) {
      return fail("Le prix doit être compris entre 0 et 100 000 €.");
    }
    data.price = patch.price;
  }
  if (patch.duration !== undefined) {
    if (patch.duration !== null && (!Number.isInteger(patch.duration) || patch.duration < 0)) {
      return fail("La durée doit être un nombre entier de minutes.");
    }
    data.duration = patch.duration && patch.duration > 0 ? patch.duration : null;
  }
  if (patch.previewEnabled !== undefined) data.previewEnabled = patch.previewEnabled;
  if (patch.objectives !== undefined) data.objectives = normalizeObjectives(patch.objectives);
  if (patch.faq !== undefined) {
    const faq = normalizeFaq(patch.faq);
    data.faq = faq.length > 0 ? faq : null;
  }
  if (patch.trailerUrl !== undefined) {
    const trailer = normalizeTrailerUrl(patch.trailerUrl);
    if (trailer === undefined) return fail("L'adresse de la bande-annonce n'est pas valide (http ou https).");
    data.trailerUrl = trailer;
  }
  for (const key of ["publicPrerequisites", "publicStructure", "publicResources", "publicEvaluation"] as const) {
    if (patch[key] !== undefined) data[key] = patch[key]?.trim() ? patch[key]!.trim() : null;
  }
  if (adminPatch.featured !== undefined) data.featured = adminPatch.featured;
  if (adminPatch.instructorId !== undefined) {
    if (adminPatch.instructorId !== null) {
      const user = await db.user.findUnique({ where: { id: adminPatch.instructorId }, select: { role: true } });
      if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
        return fail("Cette personne ne peut pas être instructeur.");
      }
    }
    data.instructorId = adminPatch.instructorId;
  }

  await db.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) await tx.course.update({ where: { id: courseId }, data });
    if (patch.tagIds !== undefined) {
      const ids = [...new Set(patch.tagIds)];
      const tags = await tx.tag.findMany({ where: { id: { in: ids } }, select: { id: true } });
      await tx.courseTag.deleteMany({ where: { courseId } });
      if (tags.length > 0) await tx.courseTag.createMany({ data: tags.map((t) => ({ courseId, tagId: t.id })) });
    }
  });
  return { success: true };
}

/** Changes the public address. The caller revalidates the old and the new one. */
export async function renameCourseSlug(courseId: string, slug: string): Promise<Result<{ slug: string; previous: string }>> {
  const next = slug.trim().toLowerCase();
  if (next.length < 3 || next.length > 80) return fail("L'adresse doit contenir entre 3 et 80 caractères.");
  if (!SLUG_PATTERN.test(next)) {
    return fail("L'adresse ne peut contenir que des lettres minuscules, des chiffres et des tirets (pas de tiret au début ni à la fin).");
  }
  const current = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  if (!current) return fail("Formation introuvable.");
  if (next === current.slug) return { success: true, slug: next, previous: current.slug };
  if (await isCourseSlugTaken(next, courseId)) return fail("Cette adresse est déjà utilisée par une autre formation.");
  try {
    await db.course.update({ where: { id: courseId }, data: { slug: next } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return fail("Cette adresse est déjà utilisée par une autre formation.");
    throw error;
  }
  return { success: true, slug: next, previous: current.slug };
}

// ---------------------------------------------------------------- publish

export async function loadReadiness(courseId: string): Promise<Readiness | null> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      description: true,
      thumbnail: true,
      accessTier: true,
      price: true,
      lessons: { select: { title: true, published: true, videoUrl: true, content: true } },
    },
  });
  if (!course) return null;
  return checkPublishReadiness({
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    accessTier: course.accessTier,
    price: course.price === null ? null : Number(course.price),
    lessons: course.lessons.map((l) => ({
      title: l.title,
      published: l.published,
      hasVideo: Boolean(l.videoUrl?.trim()),
      hasContent: !isEmptyHtml(l.content),
    })),
  });
}

/** The only way to publish. Refuses (and says what is missing) when the course is not ready. */
export async function setCoursePublished(
  courseId: string,
  published: boolean,
): Promise<Result<{ readiness: Readiness }> | { success: false; error: string; readiness: Readiness }> {
  const readiness = await loadReadiness(courseId);
  if (!readiness) return fail("Formation introuvable.");
  if (published && !readiness.ready) {
    return { success: false, error: `La formation n'est pas prête : ${readiness.missing.join(" ; ")}.`, readiness };
  }
  const current = await db.course.findUnique({ where: { id: courseId }, select: { publishedAt: true } });
  await db.course.update({
    where: { id: courseId },
    data: { published, ...(published && !current?.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  if (published) await syncCourseDuration(courseId);
  return { success: true, readiness };
}

// ---------------------------------------------------------------- duplicate

/** Deep copy of the content of a course as an unpublished draft. Enrolments, reviews, payments and certificates stay behind. */
export async function duplicateCourse(
  courseId: string,
  user: { id: string; role: "ADMIN" | "INSTRUCTOR" },
): Promise<Result<{ courseId: string; slug: string }>> {
  const source = await db.course.findUnique({
    where: { id: courseId },
    include: {
      tags: true,
      modules: { orderBy: { order: "asc" } },
      lessons: { include: { resources: true } },
      quizzes: { include: { questions: true } },
      visualSupports: true,
      finalExam: true,
    },
  });
  if (!source) return fail("Formation introuvable.");

  const title = `${source.title} (copie)`.slice(0, 120);
  const slug = await uniqueSlug(`${source.slug}-copie`.slice(0, 80), (s) => isCourseSlugTaken(s));

  const created = await db.$transaction(async (tx) => {
    const copy = await tx.course.create({
      data: {
        title,
        slug,
        description: source.description,
        thumbnail: source.thumbnail,
        price: source.price,
        category: source.category,
        level: source.level,
        duration: source.duration,
        accessTier: source.accessTier,
        previewEnabled: source.previewEnabled,
        publicEvaluation: source.publicEvaluation,
        publicPrerequisites: source.publicPrerequisites,
        publicResources: source.publicResources,
        publicStructure: source.publicStructure,
        trailerUrl: source.trailerUrl,
        faq: source.faq ?? undefined,
        objectives: source.objectives,
        published: false,
        featured: false,
        instructorId: user.role === "INSTRUCTOR" ? user.id : source.instructorId,
      },
    });

    const moduleIds = new Map<string, string>();
    for (const m of source.modules) {
      const created = await tx.module.create({
        data: { courseId: copy.id, title: m.title, slug: m.slug, order: m.order },
      });
      moduleIds.set(m.id, created.id);
    }

    for (const l of source.lessons) {
      await tx.lesson.create({
        data: {
          courseId: copy.id,
          moduleId: l.moduleId ? (moduleIds.get(l.moduleId) ?? null) : null,
          title: l.title,
          slug: l.slug,
          description: l.description,
          content: l.content,
          videoUrl: l.videoUrl,
          duration: l.duration,
          order: l.order,
          published: l.published,
          isPreview: l.isPreview,
          resources: {
            create: l.resources.map((r) => ({ title: r.title, url: r.url, kind: r.kind, sizeBytes: r.sizeBytes, order: r.order })),
          },
        },
      });
    }

    for (const q of source.quizzes) {
      const moduleId = moduleIds.get(q.moduleId);
      if (!moduleId) continue;
      await tx.quiz.create({
        data: {
          courseId: copy.id,
          moduleId,
          title: q.title,
          questions: {
            create: q.questions.map((x) => ({
              question: x.question,
              options: x.options,
              correct: x.correct,
              explanation: x.explanation,
              order: x.order,
            })),
          },
        },
      });
    }

    for (const s of source.visualSupports) {
      const moduleId = moduleIds.get(s.moduleId);
      if (!moduleId) continue;
      await tx.visualSupport.create({
        data: { courseId: copy.id, moduleId, title: s.title, content: s.content ?? {}, order: s.order },
      });
    }

    if (source.finalExam) {
      const e = source.finalExam;
      await tx.finalExam.create({
        data: {
          courseId: copy.id,
          title: e.title,
          description: e.description,
          passingScore: e.passingScore,
          timeLimit: e.timeLimit,
          questions: e.questions ?? [],
          published: false,
        },
      });
    }

    if (source.tags.length > 0) {
      await tx.courseTag.createMany({ data: source.tags.map((t) => ({ courseId: copy.id, tagId: t.tagId })) });
    }
    return copy;
  });

  return { success: true, courseId: created.id, slug: created.slug };
}

// ---------------------------------------------------------------- delete

export async function deleteCourse(courseId: string): Promise<Result<{ slug: string }>> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { slug: true, _count: { select: { enrollments: true } } },
  });
  if (!course) return fail("Formation introuvable.");
  if (course._count.enrollments > 0) {
    return fail(
      `Impossible de supprimer cette formation : ${course._count.enrollments} personne(s) y sont inscrites. Dépubliez-la pour la retirer du catalogue.`,
    );
  }
  await db.course.delete({ where: { id: courseId } });
  return { success: true, slug: course.slug };
}
