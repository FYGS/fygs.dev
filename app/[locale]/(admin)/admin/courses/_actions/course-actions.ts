"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import * as courses from "@/lib/curriculum/courses";
import { guardCourse, requireAuthor } from "@/lib/curriculum/guard";
import { revalidateCourse } from "@/lib/curriculum/revalidate";
import { CourseAccessTier, CourseCategory, CourseLevel } from "@/lib/generated/prisma/browser";
import type { Readiness } from "@/lib/curriculum/publish";
import { failure, unexpected, type ActionFailure } from "./shared";

const id = z.string().min(1).max(64);

/** Course analytics must never make a save fail. */
async function track(userId: string, type: string, properties: Record<string, unknown>) {
  try {
    await db.analyticsEvent.create({ data: { userId, type, source: "admin", properties: properties as object } });
  } catch {
    /* tracking is best effort */
  }
}

// ---------------------------------------------------------------- create

export async function createCourse(input: {
  title: string;
  category: CourseCategory;
  level: CourseLevel;
}): Promise<{ success: true; courseId: string } | ActionFailure> {
  try {
    const author = await requireAuthor();
    if (!author.ok) return failure(author.error);
    const parsed = z
      .object({
        title: z.string().max(300),
        category: z.nativeEnum(CourseCategory),
        level: z.nativeEnum(CourseLevel),
      })
      .safeParse(input);
    if (!parsed.success) return failure("Choisissez une catégorie et un niveau.");

    const r = await courses.createCourseDraft(author.user, parsed.data);
    if (!r.success) return r;
    revalidateCourse({ courseId: r.courseId, slugs: [] });
    await track(author.user.id, "COURSE_CREATED", { courseId: r.courseId, title: parsed.data.title });
    return { success: true, courseId: r.courseId };
  } catch (error) {
    return unexpected("createCourse", error);
  }
}

// ---------------------------------------------------------------- edit

const coursePatch = z.object({
  title: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  thumbnail: z.string().max(2000).nullable().optional(),
  category: z.nativeEnum(CourseCategory).optional(),
  level: z.nativeEnum(CourseLevel).optional(),
  accessTier: z.nativeEnum(CourseAccessTier).optional(),
  price: z.number().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  previewEnabled: z.boolean().optional(),
  objectives: z.array(z.string().max(500)).max(50).optional(),
  faq: z.array(z.object({ q: z.string().max(500), a: z.string().max(5000) })).max(50).optional(),
  trailerUrl: z.string().max(2000).nullable().optional(),
  publicPrerequisites: z.string().max(10_000).nullable().optional(),
  publicStructure: z.string().max(10_000).nullable().optional(),
  publicResources: z.string().max(10_000).nullable().optional(),
  publicEvaluation: z.string().max(10_000).nullable().optional(),
  tagIds: z.array(id).max(50).optional(),
  // administrators only
  featured: z.boolean().optional(),
  instructorId: id.nullable().optional(),
});

/**
 * Autosave of the builder. Never touches `published`: publishing is `publishCourse`, behind the checklist.
 * `featured` and `instructorId` are refused to anyone but an administrator.
 */
export async function updateCourse(
  courseId: string,
  patch: z.input<typeof coursePatch>,
): Promise<{ success: true } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const { featured, instructorId, ...rest } = coursePatch.parse(patch);
    if ((featured !== undefined || instructorId !== undefined) && g.user.role !== "ADMIN") {
      return failure("Seul un administrateur peut modifier ces réglages.");
    }
    const r = await courses.updateCourseInfo(g.course.id, rest, { featured, instructorId });
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], listings: featured !== undefined });
    return { success: true };
  } catch (error) {
    return unexpected("updateCourse", error);
  }
}

export async function checkCourseSlug(courseId: string, slug: string): Promise<{ available: boolean }> {
  const g = await guardCourse(id.parse(courseId));
  if (!g.ok) return { available: false };
  const value = slug.trim().toLowerCase();
  if (!courses.SLUG_PATTERN.test(value)) return { available: false };
  return { available: !(await courses.isCourseSlugTaken(value, g.course.id)) };
}

export async function changeCourseSlug(courseId: string, slug: string): Promise<{ success: true; slug: string } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await courses.renameCourseSlug(g.course.id, z.string().max(200).parse(slug));
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [r.slug, r.previous], listings: true });
    return { success: true, slug: r.slug };
  } catch (error) {
    return unexpected("changeCourseSlug", error);
  }
}

// ---------------------------------------------------------------- publish

export async function getReadiness(courseId: string): Promise<{ success: true; readiness: Readiness; published: boolean } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const [readiness, course] = await Promise.all([
      courses.loadReadiness(g.course.id),
      db.course.findUnique({ where: { id: g.course.id }, select: { published: true } }),
    ]);
    if (!readiness || !course) return failure("Formation introuvable.");
    return { success: true, readiness, published: course.published };
  } catch (error) {
    return unexpected("getReadiness", error);
  }
}

export async function publishCourse(courseId: string): Promise<{ success: true } | (ActionFailure & { readiness?: Readiness })> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await courses.setCoursePublished(g.course.id, true);
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], listings: true });
    await track(g.user.id, "COURSE_PUBLISHED", { courseId: g.course.id });
    return { success: true };
  } catch (error) {
    return unexpected("publishCourse", error);
  }
}

export async function unpublishCourse(courseId: string): Promise<{ success: true } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await courses.setCoursePublished(g.course.id, false);
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [g.course.slug], listings: true });
    await track(g.user.id, "COURSE_UNPUBLISHED", { courseId: g.course.id });
    return { success: true };
  } catch (error) {
    return unexpected("unpublishCourse", error);
  }
}

// ---------------------------------------------------------------- duplicate / delete

export async function duplicateCourse(courseId: string): Promise<{ success: true; courseId: string } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await courses.duplicateCourse(g.course.id, g.user);
    if (!r.success) return r;
    revalidateCourse({ courseId: r.courseId, slugs: [] });
    await track(g.user.id, "COURSE_DUPLICATED", { courseId: g.course.id, copyId: r.courseId });
    return { success: true, courseId: r.courseId };
  } catch (error) {
    return unexpected("duplicateCourse", error);
  }
}

export async function deleteCourse(courseId: string): Promise<{ success: true } | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await courses.deleteCourse(g.course.id);
    if (!r.success) return r;
    revalidateCourse({ courseId: g.course.id, slugs: [r.slug], listings: true });
    await track(g.user.id, "COURSE_DELETED", { courseId: g.course.id, slug: r.slug });
    return { success: true };
  } catch (error) {
    return unexpected("deleteCourse", error);
  }
}

// ---------------------------------------------------------------- tags

export async function createQuickTag(
  name: string,
  color = "#6366F1",
): Promise<{ success: true; tag: { id: string; name: string; color: string } } | ActionFailure> {
  try {
    const author = await requireAuthor();
    if (!author.ok) return failure(author.error);
    const clean = z.string().trim().min(2, "Le nom du tag est trop court.").max(40, "Le nom du tag est trop long.").parse(name);
    const existing = await db.tag.findFirst({ where: { name: { equals: clean, mode: "insensitive" } } });
    if (existing) return { success: true, tag: { id: existing.id, name: existing.name, color: existing.color } };
    const tag = await db.tag.create({ data: { name: clean, color } });
    return { success: true, tag: { id: tag.id, name: tag.name, color: tag.color } };
  } catch (error) {
    if (error instanceof z.ZodError) return failure(error.issues[0]?.message ?? "Nom invalide.");
    return unexpected("createQuickTag", error);
  }
}
