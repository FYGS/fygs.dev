import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";
import { pathInputSchema, type PathInput } from "./schema";
import { pathPublishIssues } from "./rules";

/**
 * Writes of the path editor. Only an ADMIN composes paths: a path mixes courses of several authors
 * and carries its own certificate, so it is an editorial decision of the platform, not of one instructor.
 * Kept free of `next/headers` so the server actions stay thin and these rules are tested on a real database.
 */

export interface Actor {
  id: string;
  role: string | null | undefined;
}

export type SavePathResult =
  | { success: true; id: string; slug: string }
  | { success: false; error: string; issues?: string[] };

const FORBIDDEN = { success: false, error: "Seul un administrateur peut gérer les parcours" } as const;
const isAdmin = (actor: Actor) => actor.role === Role.ADMIN;
const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

export async function isPathSlugAvailable(slug: string, exceptId?: string): Promise<boolean> {
  const found = await db.path.findUnique({ where: { slug }, select: { id: true } });
  return !found || found.id === exceptId;
}

async function courseRows(ids: string[]) {
  return db.course.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, published: true, _count: { select: { lessons: { where: { published: true } } } } },
  });
}

/** Creates (`id` null) or updates a path, courses in the order sent. A published path must stay publishable. */
export async function savePath(actor: Actor, id: string | null, input: PathInput): Promise<SavePathResult> {
  if (!isAdmin(actor)) return FORBIDDEN;

  const parsed = pathInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  const data = parsed.data;

  const existing = id ? await db.path.findUnique({ where: { id }, select: { id: true, published: true } }) : null;
  if (id && !existing) return { success: false, error: "Parcours introuvable" };

  const rows = await courseRows(data.courses.map((c) => c.courseId));
  if (rows.length !== data.courses.length) return { success: false, error: "Une formation du parcours n'existe plus" };

  if (existing?.published) {
    const byId = new Map(rows.map((r) => [r.id, r]));
    const issues = pathPublishIssues({
      description: data.description,
      thumbnail: data.thumbnail,
      courses: data.courses.map((c) => {
        const row = byId.get(c.courseId)!;
        return { title: row.title, published: row.published, optional: c.optional, lessonsCount: row._count.lessons };
      }),
    });
    if (issues.length > 0) {
      return {
        success: false,
        error: "Ce parcours est publié et doit rester publiable. Dépubliez-le pour le modifier librement.",
        issues,
      };
    }
  }

  if (!(await isPathSlugAvailable(data.slug, id ?? undefined))) {
    return { success: false, error: "Ce slug est déjà utilisé par un autre parcours" };
  }

  const fields = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    thumbnail: data.thumbnail,
    level: data.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
    objectives: data.objectives,
    featured: data.featured,
  };

  try {
    const saved = await db.$transaction(async (tx) => {
      const path = id
        ? await tx.path.update({ where: { id }, data: fields, select: { id: true, slug: true } })
        : await tx.path.create({ data: { ...fields, authorId: actor.id }, select: { id: true, slug: true } });
      // Rewritten whole: with the (pathId, order) unique key this avoids swap collisions.
      await tx.pathCourse.deleteMany({ where: { pathId: path.id } });
      if (data.courses.length > 0) {
        await tx.pathCourse.createMany({
          data: data.courses.map((c, index) => ({
            pathId: path.id,
            courseId: c.courseId,
            order: index + 1,
            optional: c.optional,
          })),
        });
      }
      return path;
    });
    return { success: true, id: saved.id, slug: saved.slug };
  } catch (error) {
    if (isUniqueViolation(error)) return { success: false, error: "Ce slug est déjà utilisé par un autre parcours" };
    throw error;
  }
}

export async function setPathPublished(actor: Actor, id: string, published: boolean): Promise<SavePathResult> {
  if (!isAdmin(actor)) return FORBIDDEN;
  const path = await db.path.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      description: true,
      thumbnail: true,
      publishedAt: true,
      courses: {
        select: {
          optional: true,
          course: { select: { title: true, published: true, _count: { select: { lessons: { where: { published: true } } } } } },
        },
      },
    },
  });
  if (!path) return { success: false, error: "Parcours introuvable" };

  if (published) {
    const issues = pathPublishIssues({
      description: path.description,
      thumbnail: path.thumbnail,
      courses: path.courses.map((c) => ({
        title: c.course.title,
        published: c.course.published,
        optional: c.optional,
        lessonsCount: c.course._count.lessons,
      })),
    });
    if (issues.length > 0) return { success: false, error: "Ce parcours ne peut pas encore être publié", issues };
  }

  await db.path.update({
    where: { id },
    data: { published, ...(published && !path.publishedAt && { publishedAt: new Date() }) },
  });
  return { success: true, id, slug: path.slug };
}

export async function deletePath(
  actor: Actor,
  id: string,
): Promise<{ success: true; slug: string } | { success: false; error: string }> {
  if (!isAdmin(actor)) return FORBIDDEN;
  const path = await db.path.findUnique({
    where: { id },
    select: { slug: true, _count: { select: { certificates: true } } },
  });
  if (!path) return { success: false, error: "Parcours introuvable" };
  // A certificate that was handed out must stay verifiable: such a path is unpublished, not deleted.
  if (path._count.certificates > 0) {
    return {
      success: false,
      error: `${path._count.certificates} certificat(s) ont été délivrés : dépubliez ce parcours plutôt que de le supprimer.`,
    };
  }
  // enrolments go with it (cascade): the editor asks for confirmation and shows the count
  await db.path.delete({ where: { id } });
  return { success: true, slug: path.slug };
}
