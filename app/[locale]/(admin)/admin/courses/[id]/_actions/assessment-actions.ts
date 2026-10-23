"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import * as assessments from "@/lib/curriculum/assessments";
import { guardCourse, guardQuiz, guardSupport } from "@/lib/curriculum/guard";
import { revalidateCourse } from "@/lib/curriculum/revalidate";
import { failure, unexpected, type ActionFailure } from "../../_actions/shared";

const id = z.string().min(1).max(64);

const question = z.object({
  id: id.optional(),
  question: z.string().max(2000),
  options: z.array(z.string().max(500)).max(10),
  correct: z.number().int(),
  explanation: z.string().max(2000).nullable().optional(),
});
const questions = z.array(question).max(200);

type Ok = { success: true };

async function refreshed(course: { id: string; slug: string }) {
  revalidateCourse({ courseId: course.id, slugs: [course.slug] });
}

// ---------------------------------------------------------------- quizzes

export async function loadQuizzes(courseId: string) {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    return { success: true as const, quizzes: await assessments.listQuizzes(g.course.id) };
  } catch (error) {
    return unexpected("loadQuizzes", error);
  }
}

export async function addQuiz(
  courseId: string,
  moduleId: string,
  input: { title: string; questions: z.input<typeof questions> },
): Promise<(Ok & { quizzes: Awaited<ReturnType<typeof assessments.listQuizzes>> }) | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.createQuiz(g.course.id, id.parse(moduleId), {
      title: z.string().max(300).parse(input.title),
      questions: questions.parse(input.questions),
    });
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, quizzes: await assessments.listQuizzes(g.course.id) };
  } catch (error) {
    return unexpected("addQuiz", error);
  }
}

export async function saveQuiz(
  quizId: string,
  input: { title: string; moduleId?: string; questions: z.input<typeof questions> },
): Promise<(Ok & { quizzes: Awaited<ReturnType<typeof assessments.listQuizzes>> }) | ActionFailure> {
  try {
    const g = await guardQuiz(id.parse(quizId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.updateQuiz(g.quiz.id, {
      title: z.string().max(300).parse(input.title),
      moduleId: input.moduleId ? id.parse(input.moduleId) : undefined,
      questions: questions.parse(input.questions),
    });
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, quizzes: await assessments.listQuizzes(g.course.id) };
  } catch (error) {
    return unexpected("saveQuiz", error);
  }
}

export async function removeQuiz(
  quizId: string,
): Promise<(Ok & { quizzes: Awaited<ReturnType<typeof assessments.listQuizzes>> }) | ActionFailure> {
  try {
    const g = await guardQuiz(id.parse(quizId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.deleteQuiz(g.quiz.id);
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, quizzes: await assessments.listQuizzes(g.course.id) };
  } catch (error) {
    return unexpected("removeQuiz", error);
  }
}

// ---------------------------------------------------------------- visual supports

const slides = z.array(z.object({ title: z.string().max(300), content: z.string().max(200_000) })).max(100);

type Supports = Awaited<ReturnType<typeof assessments.listSupports>>;

export async function loadSupports(courseId: string) {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    return { success: true as const, supports: await assessments.listSupports(g.course.id) };
  } catch (error) {
    return unexpected("loadSupports", error);
  }
}

export async function addSupport(
  courseId: string,
  moduleId: string,
  input: { title: string; slides: z.input<typeof slides> },
): Promise<(Ok & { supports: Supports }) | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.createSupport(g.course.id, id.parse(moduleId), {
      title: z.string().max(300).parse(input.title),
      slides: slides.parse(input.slides),
    });
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, supports: await assessments.listSupports(g.course.id) };
  } catch (error) {
    return unexpected("addSupport", error);
  }
}

export async function saveSupport(
  supportId: string,
  input: { title: string; moduleId?: string; slides: z.input<typeof slides> },
): Promise<(Ok & { supports: Supports }) | ActionFailure> {
  try {
    const g = await guardSupport(id.parse(supportId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.updateSupport(g.support.id, {
      title: z.string().max(300).parse(input.title),
      moduleId: input.moduleId ? id.parse(input.moduleId) : undefined,
      slides: slides.parse(input.slides),
    });
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, supports: await assessments.listSupports(g.course.id) };
  } catch (error) {
    return unexpected("saveSupport", error);
  }
}

export async function removeSupport(supportId: string): Promise<(Ok & { supports: Supports }) | ActionFailure> {
  try {
    const g = await guardSupport(id.parse(supportId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.deleteSupport(g.support.id);
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, supports: await assessments.listSupports(g.course.id) };
  } catch (error) {
    return unexpected("removeSupport", error);
  }
}

export async function reorderModuleSupports(
  moduleId: string,
  orderedIds: string[],
  courseId: string,
): Promise<(Ok & { supports: Supports }) | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const mod = await db.module.findUnique({ where: { id: id.parse(moduleId) }, select: { courseId: true } });
    if (!mod || mod.courseId !== g.course.id) return failure("Ce module n'appartient pas à la formation.");
    const r = await assessments.reorderSupports(moduleId, z.array(id).max(200).parse(orderedIds));
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true, supports: await assessments.listSupports(g.course.id) };
  } catch (error) {
    return unexpected("reorderModuleSupports", error);
  }
}

// ---------------------------------------------------------------- final exam

const examInput = z.object({
  title: z.string().max(300),
  description: z.string().max(2000).nullable().optional(),
  passingScore: z.number().int(),
  timeLimit: z.number().int().nullable(),
  questions,
  published: z.boolean(),
});

export async function loadExam(courseId: string) {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    return { success: true as const, exam: await assessments.getExam(g.course.id) };
  } catch (error) {
    return unexpected("loadExam", error);
  }
}

export async function saveFinalExam(courseId: string, input: z.input<typeof examInput>): Promise<Ok | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    const r = await assessments.saveExam(g.course.id, examInput.parse(input));
    if (!r.success) return r;
    await refreshed(g.course);
    return { success: true };
  } catch (error) {
    return unexpected("saveFinalExam", error);
  }
}

export async function removeFinalExam(courseId: string): Promise<Ok | ActionFailure> {
  try {
    const g = await guardCourse(id.parse(courseId));
    if (!g.ok) return failure(g.error);
    await assessments.deleteExam(g.course.id);
    await refreshed(g.course);
    return { success: true };
  } catch (error) {
    return unexpected("removeFinalExam", error);
  }
}
