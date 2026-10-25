"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { canEditCourse, requireAuthor } from "@/lib/curriculum/guard";

const id = z.string().min(1).max(64);

/**
 * Names of the records an admin address points to (`/admin/courses/<id>` → the course title), for the breadcrumb.
 * Only what the user may open is named; anything else keeps a neutral label.
 */
export async function resolveAdminCrumb(kind: "courses" | "paths" | "users" | "reviews", rawId: string): Promise<string | null> {
  const author = await requireAuthor();
  if (!author.ok) return null;
  const parsed = id.safeParse(rawId);
  if (!parsed.success) return null;
  const isAdmin = author.user.role === "ADMIN";

  switch (kind) {
    case "courses": {
      const course = await db.course.findUnique({ where: { id: parsed.data }, select: { title: true, instructorId: true } });
      return course && canEditCourse(author.user, course) ? course.title : null;
    }
    case "paths": {
      if (!isAdmin) return null;
      return (await db.path.findUnique({ where: { id: parsed.data }, select: { title: true } }))?.title ?? null;
    }
    case "users": {
      if (!isAdmin) return null;
      const user = await db.user.findUnique({ where: { id: parsed.data }, select: { name: true, email: true } });
      return user ? user.name || user.email : null;
    }
    case "reviews": {
      if (!isAdmin) return null;
      const review = await db.review.findUnique({ where: { id: parsed.data }, select: { user: { select: { name: true } }, course: { select: { title: true } } } });
      return review ? `Avis de ${review.user.name ?? "un apprenant"} sur « ${review.course.title} »` : null;
    }
  }
}
