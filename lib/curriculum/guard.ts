import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface AuthorUser {
  id: string;
  role: "ADMIN" | "INSTRUCTOR";
}

export type Guarded<T> = ({ ok: true; user: AuthorUser } & T) | { ok: false; error: string };

/** An administrator edits any course; an instructor only the ones assigned to them. */
export function canEditCourse(
  user: { id: string; role: string },
  course: { instructorId: string | null },
): boolean {
  if (user.role === "ADMIN") return true;
  return user.role === "INSTRUCTOR" && course.instructorId !== null && course.instructorId === user.id;
}

/** The signed-in user when they may author courses (ADMIN or INSTRUCTOR). */
export async function requireAuthor(): Promise<Guarded<unknown>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { ok: false, error: "Vous devez être connecté." };
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return { ok: false, error: "Vous n'avez pas les permissions pour gérer des formations." };
  }
  return { ok: true, user: { id: session.user.id, role } };
}

const DENIED = "Vous n'avez pas accès à cette formation.";

interface CourseRef {
  id: string;
  slug: string;
  instructorId: string | null;
}

export async function guardCourse(courseId: string): Promise<Guarded<{ course: CourseRef }>> {
  const author = await requireAuthor();
  if (!author.ok) return author;
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, slug: true, instructorId: true },
  });
  if (!course) return { ok: false, error: "Formation introuvable." };
  if (!canEditCourse(author.user, course)) return { ok: false, error: DENIED };
  return { ok: true, user: author.user, course };
}

export async function guardModule(
  moduleId: string,
): Promise<Guarded<{ course: CourseRef; module: { id: string; courseId: string } }>> {
  const found = await db.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      courseId: true,
      course: { select: { id: true, slug: true, instructorId: true } },
    },
  });
  if (!found) return { ok: false, error: "Module introuvable." };
  const guarded = await guardCourse(found.courseId);
  if (!guarded.ok) return guarded;
  return { ok: true, user: guarded.user, course: found.course, module: { id: found.id, courseId: found.courseId } };
}

export async function guardLesson(
  lessonId: string,
): Promise<Guarded<{ course: CourseRef; lesson: { id: string; courseId: string; moduleId: string | null; slug: string } }>> {
  const found = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      courseId: true,
      moduleId: true,
      slug: true,
      course: { select: { id: true, slug: true, instructorId: true } },
    },
  });
  if (!found) return { ok: false, error: "Leçon introuvable." };
  const guarded = await guardCourse(found.courseId);
  if (!guarded.ok) return guarded;
  const { course, ...lesson } = found;
  return { ok: true, user: guarded.user, course, lesson };
}

export async function guardQuiz(
  quizId: string,
): Promise<Guarded<{ course: CourseRef; quiz: { id: string; courseId: string; moduleId: string } }>> {
  const found = await db.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      courseId: true,
      moduleId: true,
      course: { select: { id: true, slug: true, instructorId: true } },
    },
  });
  if (!found) return { ok: false, error: "Quiz introuvable." };
  const guarded = await guardCourse(found.courseId);
  if (!guarded.ok) return guarded;
  const { course, ...quiz } = found;
  return { ok: true, user: guarded.user, course, quiz };
}

export async function guardSupport(
  supportId: string,
): Promise<Guarded<{ course: CourseRef; support: { id: string; courseId: string; moduleId: string } }>> {
  const found = await db.visualSupport.findUnique({
    where: { id: supportId },
    select: {
      id: true,
      courseId: true,
      moduleId: true,
      course: { select: { id: true, slug: true, instructorId: true } },
    },
  });
  if (!found) return { ok: false, error: "Support introuvable." };
  const guarded = await guardCourse(found.courseId);
  if (!guarded.ok) return guarded;
  const { course, ...support } = found;
  return { ok: true, user: guarded.user, course, support };
}

export async function guardResource(
  resourceId: string,
): Promise<
  Guarded<{ course: CourseRef; resource: { id: string; lessonId: string }; lesson: { id: string; slug: string } }>
> {
  const found = await db.lessonResource.findUnique({
    where: { id: resourceId },
    select: { id: true, lessonId: true },
  });
  if (!found) return { ok: false, error: "Ressource introuvable." };
  const guarded = await guardLesson(found.lessonId);
  if (!guarded.ok) return guarded;
  return { ok: true, user: guarded.user, course: guarded.course, resource: found, lesson: guarded.lesson };
}
