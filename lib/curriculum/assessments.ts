/**
 * Quizzes (one or more per module), visual supports (slides per module) and the final exam of a course.
 * Callers have already checked who may edit the course (lib/curriculum/guard.ts).
 */
import { db } from "@/lib/db";
import { applyOrder, nextOrder, sameIdSet, TEMP_ORDER_BASE } from "./ordering";
import type { Result, Tx } from "./curriculum";
import { slideContentToHtml } from "@/lib/visual-support-slide";
import { validateQuestions, type QuestionInput } from "./questions";

export { MAX_OPTIONS, MIN_OPTIONS, validateQuestions, type QuestionInput } from "./questions";

const fail = (error: string): { success: false; error: string } => ({ success: false, error });

// ---------------------------------------------------------------- quizzes

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string | null;
  order: number;
}

export interface QuizItem {
  id: string;
  moduleId: string;
  title: string;
  questions: QuizQuestionItem[];
}

export async function listQuizzes(courseId: string): Promise<QuizItem[]> {
  const quizzes = await db.quiz.findMany({
    where: { courseId },
    orderBy: [{ module: { order: "asc" } }, { createdAt: "asc" }],
    include: { questions: { orderBy: { order: "asc" } } },
  });
  return quizzes.map((q) => ({
    id: q.id,
    moduleId: q.moduleId,
    title: q.title,
    questions: q.questions.map<QuizQuestionItem>((x) => ({
      id: x.id,
      question: x.question,
      options: x.options,
      correct: x.correct,
      explanation: x.explanation,
      order: x.order,
    })),
  }));
}

export async function createQuiz(
  courseId: string,
  moduleId: string,
  input: { title: string; questions: QuestionInput[] },
): Promise<Result<{ quizId: string }>> {
  const title = input.title.trim();
  if (!title) return fail("Le titre du quiz est requis.");
  const mod = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!mod || mod.courseId !== courseId) return fail("Ce module n'appartient pas à la formation.");
  const checked = validateQuestions(input.questions);
  if (!checked.ok) return fail(checked.error);

  const quiz = await db.quiz.create({
    data: {
      courseId,
      moduleId,
      title: title.slice(0, 150),
      questions: {
        create: checked.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation ?? null,
          order: i + 1,
        })),
      },
    },
  });
  return { success: true, quizId: quiz.id };
}

/**
 * Replaces the title and the questions of a quiz. Questions that keep their id are updated in place
 * (past attempts still point at them), new ones are created, the ones left out are deleted.
 */
export async function updateQuiz(
  quizId: string,
  input: { title: string; questions: QuestionInput[]; moduleId?: string },
): Promise<Result> {
  const title = input.title.trim();
  if (!title) return fail("Le titre du quiz est requis.");
  const checked = validateQuestions(input.questions);
  if (!checked.ok) return fail(checked.error);

  const quiz = await db.quiz.findUnique({ where: { id: quizId }, select: { courseId: true } });
  if (!quiz) return fail("Quiz introuvable.");
  if (input.moduleId) {
    const mod = await db.module.findUnique({ where: { id: input.moduleId }, select: { courseId: true } });
    if (!mod || mod.courseId !== quiz.courseId) return fail("Ce module n'appartient pas à la formation.");
  }

  await db.$transaction(async (tx) => {
    const existing = await tx.quizQuestion.findMany({ where: { quizId }, select: { id: true } });
    const existingIds = new Set(existing.map((e) => e.id));
    const keptIds = new Set(checked.questions.map((q) => q.id).filter((id): id is string => !!id && existingIds.has(id)));

    await tx.quizQuestion.deleteMany({ where: { quizId, id: { notIn: [...keptIds] } } });
    // Park the kept questions so the final positions (unique per quiz) can be assigned in any order.
    let parked = 0;
    for (const id of keptIds) await tx.quizQuestion.update({ where: { id }, data: { order: TEMP_ORDER_BASE + parked++ } });

    for (let i = 0; i < checked.questions.length; i++) {
      const q = checked.questions[i];
      const data = { question: q.question, options: q.options, correct: q.correct, explanation: q.explanation ?? null, order: i + 1 };
      if (q.id && keptIds.has(q.id)) await tx.quizQuestion.update({ where: { id: q.id }, data });
      else await tx.quizQuestion.create({ data: { quizId, ...data } });
    }
    await tx.quiz.update({
      where: { id: quizId },
      data: { title: title.slice(0, 150), ...(input.moduleId ? { moduleId: input.moduleId } : {}) },
    });
  });
  return { success: true };
}

export async function deleteQuiz(quizId: string): Promise<Result> {
  await db.quiz.delete({ where: { id: quizId } });
  return { success: true };
}

// ---------------------------------------------------------------- visual supports

export interface SupportSlide {
  title: string;
  content: string;
}

function validateSlides(slides: readonly SupportSlide[]): { ok: true; slides: SupportSlide[] } | { ok: false; error: string } {
  if (slides.length === 0) return { ok: false, error: "Un support a besoin d'au moins une diapositive." };
  const cleaned: SupportSlide[] = [];
  for (let i = 0; i < slides.length; i++) {
    const title = slides[i].title.trim();
    if (!title) return { ok: false, error: `Diapositive ${i + 1} : le titre est vide.` };
    cleaned.push({ title, content: slides[i].content });
  }
  return { ok: true, slides: cleaned };
}

export interface SupportItem {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  slides: SupportSlide[];
}

export async function listSupports(courseId: string): Promise<SupportItem[]> {
  const supports = await db.visualSupport.findMany({
    where: { courseId },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });
  return supports.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    title: s.title,
    order: s.order,
    slides: normalizeSlides(s.content),
  }));
}

/** Support content is `{ slides: [{ title, content }] }`; the seed also wrote structured sections as content. */
function normalizeSlides(content: unknown): SupportSlide[] {
  const slides = (content as { slides?: unknown } | null)?.slides;
  if (!Array.isArray(slides)) return [];
  return slides.map((s) => {
    const slide = s as { title?: unknown; content?: unknown };
    return {
      title: typeof slide.title === "string" ? slide.title : "",
      content: slideContentToHtml(slide.content),
    };
  });
}

export async function createSupport(
  courseId: string,
  moduleId: string,
  input: { title: string; slides: SupportSlide[] },
): Promise<Result<{ supportId: string }>> {
  const title = input.title.trim();
  if (!title) return fail("Le titre du support est requis.");
  const slides = validateSlides(input.slides);
  if (!slides.ok) return fail(slides.error);
  const mod = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!mod || mod.courseId !== courseId) return fail("Ce module n'appartient pas à la formation.");

  const siblings = await db.visualSupport.findMany({ where: { courseId, moduleId }, select: { order: true } });
  const created = await db.visualSupport.create({
    data: { courseId, moduleId, title: title.slice(0, 150), content: { slides: slides.slides.map((x) => ({ title: x.title, content: x.content })) }, order: nextOrder(siblings.map((s) => s.order)) },
  });
  return { success: true, supportId: created.id };
}

export async function updateSupport(
  supportId: string,
  input: { title: string; slides: SupportSlide[]; moduleId?: string },
): Promise<Result> {
  const title = input.title.trim();
  if (!title) return fail("Le titre du support est requis.");
  const slides = validateSlides(input.slides);
  if (!slides.ok) return fail(slides.error);
  const support = await db.visualSupport.findUnique({ where: { id: supportId }, select: { courseId: true, moduleId: true } });
  if (!support) return fail("Support introuvable.");

  const data: Record<string, unknown> = { title: title.slice(0, 150), content: { slides: slides.slides } };
  if (input.moduleId && input.moduleId !== support.moduleId) {
    const mod = await db.module.findUnique({ where: { id: input.moduleId }, select: { courseId: true } });
    if (!mod || mod.courseId !== support.courseId) return fail("Ce module n'appartient pas à la formation.");
    const siblings = await db.visualSupport.findMany({ where: { moduleId: input.moduleId }, select: { order: true } });
    data.moduleId = input.moduleId;
    data.order = nextOrder(siblings.map((s) => s.order));
  }
  await db.visualSupport.update({ where: { id: supportId }, data });
  return { success: true };
}

async function renumberSupports(tx: Tx, moduleId: string, desiredIds?: string[]) {
  const rows = await tx.visualSupport.findMany({ where: { moduleId }, orderBy: { order: "asc" }, select: { id: true, order: true } });
  await applyOrder(rows, desiredIds ?? rows.map((r) => r.id), (id, order) =>
    tx.visualSupport.update({ where: { id }, data: { order } }),
  );
}

export async function deleteSupport(supportId: string): Promise<Result> {
  const found = await db.visualSupport.findUnique({ where: { id: supportId }, select: { moduleId: true } });
  if (!found) return fail("Support introuvable.");
  await db.$transaction(async (tx) => {
    await tx.visualSupport.delete({ where: { id: supportId } });
    await renumberSupports(tx, found.moduleId);
  });
  return { success: true };
}

export async function reorderSupports(moduleId: string, orderedIds: string[]): Promise<Result> {
  return db.$transaction(async (tx) => {
    const rows = await tx.visualSupport.findMany({ where: { moduleId }, select: { id: true } });
    if (!sameIdSet(rows.map((r) => r.id), orderedIds)) return fail("La liste des supports a changé. Rechargez la page.");
    await renumberSupports(tx, moduleId, orderedIds);
    return { success: true } as const;
  });
}

// ---------------------------------------------------------------- final exam

export interface ExamInput {
  title: string;
  description?: string | null;
  /** Percentage of correct answers needed to pass. */
  passingScore: number;
  /** Minutes; null for no limit. */
  timeLimit: number | null;
  questions: QuestionInput[];
  published: boolean;
}

export interface ExamDetail {
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number | null;
  published: boolean;
  questions: QuestionInput[];
}

/** Stored shape (what the seed writes and the learner exam reads): numbered questions with their answers. */
interface StoredQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string | null;
}

export async function getExam(courseId: string): Promise<ExamDetail | null> {
  const exam = await db.finalExam.findUnique({ where: { courseId } });
  if (!exam) return null;
  const raw = Array.isArray(exam.questions) ? (exam.questions as unknown as Partial<StoredQuestion>[]) : [];
  return {
    title: exam.title,
    description: exam.description ?? "",
    passingScore: exam.passingScore,
    timeLimit: exam.timeLimit,
    published: exam.published,
    questions: raw.map((q) => ({
      question: q.question ?? "",
      options: Array.isArray(q.options) ? q.options : [],
      correct: typeof q.correct === "number" ? q.correct : 0,
      explanation: q.explanation ?? null,
    })),
  };
}

export async function saveExam(courseId: string, input: ExamInput): Promise<Result> {
  const title = input.title.trim();
  if (!title) return fail("Le titre de l'examen est requis.");
  if (!Number.isInteger(input.passingScore) || input.passingScore < 1 || input.passingScore > 100) {
    return fail("Le seuil de réussite doit être compris entre 1 et 100 %.");
  }
  if (input.timeLimit !== null && (!Number.isInteger(input.timeLimit) || input.timeLimit < 1 || input.timeLimit > 600)) {
    return fail("La durée limite doit être comprise entre 1 et 600 minutes, ou vide pour aucune limite.");
  }
  const checked = validateQuestions(input.questions);
  if (!checked.ok) return fail(checked.error);
  if (input.published && checked.questions.length === 0) return fail("Ajoutez au moins une question avant de publier l'examen.");

  const questions: StoredQuestion[] = checked.questions.map((q, i) => ({
    id: i + 1,
    question: q.question,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation ?? null,
  }));
  const data = {
    title: title.slice(0, 150),
    description: input.description?.trim() || null,
    passingScore: input.passingScore,
    timeLimit: input.timeLimit,
    questions: questions as unknown as object,
    published: input.published,
  };
  await db.finalExam.upsert({ where: { courseId }, create: { courseId, ...data }, update: data });
  return { success: true };
}

export async function deleteExam(courseId: string): Promise<Result> {
  await db.finalExam.deleteMany({ where: { courseId } });
  return { success: true };
}
