import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as curriculum from "@/lib/curriculum/curriculum";
import * as assessments from "@/lib/curriculum/assessments";
import * as courses from "@/lib/curriculum/courses";
import { createCourse, createUser, enroll } from "../support/factories";
import * as curriculumActions from "@/app/[locale]/(admin)/admin/courses/[id]/_actions/curriculum-actions";
import * as courseActions from "@/app/[locale]/(admin)/admin/courses/_actions/course-actions";
import * as assessmentActions from "@/app/[locale]/(admin)/admin/courses/[id]/_actions/assessment-actions";

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

const signedInAs = (user: { id: string; role: string } | null) =>
  vi.mocked(auth.api.getSession).mockResolvedValue((user ? { user } : null) as never);

const createdCourses: string[] = [];
const createdUsers: string[] = [];

async function newCourse(data: Parameters<typeof createCourse>[0] = {}) {
  const course = await createCourse({ published: false, ...data });
  createdCourses.push(course.id);
  return course;
}

async function newUser(role: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
  const user = await createUser({ role });
  createdUsers.push(user.id);
  return user;
}

const orders = async (moduleId: string) =>
  (await db.lesson.findMany({ where: { moduleId }, orderBy: { order: "asc" } })).map((l) => `${l.title}:${l.order}`);

const titles = async (moduleId: string) =>
  (await db.lesson.findMany({ where: { moduleId }, orderBy: { order: "asc" } })).map((l) => l.title);

async function lessonsOf(courseId: string, moduleId: string, names: string[]) {
  const ids: string[] = [];
  for (const name of names) {
    const r = await curriculum.createLesson(courseId, moduleId, name);
    if (!r.success) throw new Error(r.error);
    ids.push(r.lessonId);
  }
  return ids;
}

async function moduleOf(courseId: string, name = "Module") {
  const r = await curriculum.createModule(courseId, name);
  if (!r.success) throw new Error(r.error);
  return r.moduleId;
}

beforeEach(() => {
  vi.mocked(auth.api.getSession).mockReset();
});

afterEach(async () => {
  await db.course.deleteMany({ where: { id: { in: createdCourses.splice(0) } } });
  await db.user.deleteMany({ where: { id: { in: createdUsers.splice(0) } } });
});

describe("modules and lessons keep clean positions", () => {
  it("numbers from 1 and never collides after a delete", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a, b, c] = await lessonsOf(course.id, m, ["A", "B", "C"]);
    expect(await orders(m)).toEqual(["A:1", "B:2", "C:3"]);

    await curriculum.deleteLesson(b);
    expect(await orders(m)).toEqual(["A:1", "C:2"]);

    const added = await curriculum.createLesson(course.id, m, "D");
    expect(added.success).toBe(true);
    expect(await orders(m)).toEqual(["A:1", "C:2", "D:3"]);
    expect([a, c]).toHaveLength(2);
  });

  it("reorders under the unique(order) constraint, including a full reversal and a rotation", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const ids = await lessonsOf(course.id, m, ["A", "B", "C", "D"]);

    expect((await curriculum.reorderLessons(m, [...ids].reverse())).success).toBe(true);
    expect(await titles(m)).toEqual(["D", "C", "B", "A"]);

    const [d, c, b, a] = [...ids].reverse();
    expect((await curriculum.reorderLessons(m, [c, b, a, d])).success).toBe(true);
    expect(await orders(m)).toEqual(["C:1", "B:2", "A:3", "D:4"]);
  });

  it("refuses an order that does not list exactly the lessons of the module", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const other = await moduleOf(course.id, "Autre");
    const [a, b] = await lessonsOf(course.id, m, ["A", "B"]);
    const [foreign] = await lessonsOf(course.id, other, ["X"]);

    expect((await curriculum.reorderLessons(m, [a])).success).toBe(false);
    expect((await curriculum.reorderLessons(m, [a, foreign])).success).toBe(false);
    expect((await curriculum.reorderLessons(m, [a, a])).success).toBe(false);
    expect(await titles(m)).toEqual(["A", "B"]);
    expect(b).toBeTruthy();
  });

  it("reorders modules, and a module keeps contiguous positions after a delete", async () => {
    const course = await newCourse();
    const [m1, m2, m3] = [await moduleOf(course.id, "M1"), await moduleOf(course.id, "M2"), await moduleOf(course.id, "M3")];
    expect((await curriculum.reorderModules(course.id, [m3, m1, m2])).success).toBe(true);
    const order = async () => (await db.module.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" } })).map((m) => `${m.title}:${m.order}`);
    expect(await order()).toEqual(["M3:1", "M1:2", "M2:3"]);

    await curriculum.deleteModule(m1);
    expect(await order()).toEqual(["M3:1", "M2:2"]);
    expect((await curriculum.createModule(course.id, "M4")).success).toBe(true);
    expect(await order()).toEqual(["M3:1", "M2:2", "M4:3"]);
  });

  it("moves a lesson inside a module and to another module, closing the gap it leaves", async () => {
    const course = await newCourse();
    const m1 = await moduleOf(course.id, "M1");
    const m2 = await moduleOf(course.id, "M2");
    const [a, b, c] = await lessonsOf(course.id, m1, ["A", "B", "C"]);
    const [x, y] = await lessonsOf(course.id, m2, ["X", "Y"]);

    expect((await curriculum.moveLesson(c, m1, 0)).success).toBe(true);
    expect(await orders(m1)).toEqual(["C:1", "A:2", "B:3"]);

    expect((await curriculum.moveLesson(a, m2, 1)).success).toBe(true);
    expect(await orders(m1)).toEqual(["C:1", "B:2"]);
    expect(await orders(m2)).toEqual(["X:1", "A:2", "Y:3"]);
    expect([b, x, y]).toHaveLength(3);
  });

  it("refuses to move a lesson into a module of another course", async () => {
    const course = await newCourse();
    const other = await newCourse();
    const m = await moduleOf(course.id);
    const foreignModule = await moduleOf(other.id);
    const [a] = await lessonsOf(course.id, m, ["A"]);
    expect((await curriculum.moveLesson(a, foreignModule, 0)).success).toBe(false);
    expect((await db.lesson.findUnique({ where: { id: a } }))?.moduleId).toBe(m);
  });
});

describe("slugs", () => {
  it("keeps accented letters as plain ones and numbers duplicates", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    await lessonsOf(course.id, m, ["Présentation", "Présentation", "日本語"]);
    const slugs = (await db.lesson.findMany({ where: { moduleId: m }, orderBy: { order: "asc" } })).map((l) => l.slug);
    expect(slugs).toEqual(["presentation", "presentation-2", "lecon"]);
  });

  it("does not change a lesson's address when its title changes", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a] = await lessonsOf(course.id, m, ["Titre initial"]);
    await curriculum.updateLesson(a, { title: "Titre modifié" });
    const lesson = await db.lesson.findUnique({ where: { id: a } });
    expect(lesson?.slug).toBe("titre-initial");
    expect(lesson?.title).toBe("Titre modifié");
  });

  it("renames a course address with the same rules and refuses a taken one", async () => {
    const one = await newCourse();
    const two = await newCourse();
    expect((await courses.renameCourseSlug(one.id, "Mon Cours!")).success).toBe(false);
    const ok = await courses.renameCourseSlug(one.id, "mon-cours");
    expect(ok).toMatchObject({ success: true, slug: "mon-cours", previous: one.slug });
    expect((await courses.renameCourseSlug(two.id, "mon-cours")).success).toBe(false);
  });
});

describe("deleting a module", () => {
  it("removes its lessons, quizzes and supports and reports the impact first", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id, "M1");
    const keep = await moduleOf(course.id, "M2");
    const [lesson] = await lessonsOf(course.id, m, ["A", "B"]);
    await assessments.createQuiz(course.id, m, {
      title: "Quiz",
      questions: [{ question: "Q ?", options: ["a", "b"], correct: 0 }],
    });
    await assessments.createSupport(course.id, m, { title: "Support", slides: [{ title: "S1", content: "<p>x</p>" }] });
    const student = await newUser("STUDENT");
    await db.progress.create({ data: { userId: student.id, lessonId: lesson, completed: true } });

    expect(await curriculum.getModuleImpact(m)).toEqual({ lessons: 2, quizzes: 1, supports: 1, learnersWithProgress: 1 });

    const r = await curriculum.deleteModule(m);
    expect(r.success).toBe(true);
    expect(await db.lesson.count({ where: { courseId: course.id } })).toBe(0);
    expect(await db.quiz.count({ where: { courseId: course.id } })).toBe(0);
    expect(await db.visualSupport.count({ where: { courseId: course.id } })).toBe(0);
    expect((await db.module.findUnique({ where: { id: keep } }))?.order).toBe(1);
  });
});

describe("lessons", () => {
  it("cannot be published without a video or content, and empty rich text counts as no content", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a] = await lessonsOf(course.id, m, ["A"]);

    expect((await curriculum.updateLesson(a, { published: true })).success).toBe(false);
    expect((await curriculum.updateLesson(a, { content: "<p></p>", published: true })).success).toBe(false);
    expect((await db.lesson.findUnique({ where: { id: a } }))?.content).toBeNull();

    const ok = await curriculum.updateLesson(a, { content: "<h2>Titre</h2><p>Texte</p>", published: true });
    expect(ok).toMatchObject({ success: true, lesson: { status: "ready", hasContent: true } });

    // removing the only material of a published lesson is refused
    expect((await curriculum.updateLesson(a, { content: "<p></p>" })).success).toBe(false);
    const video = await curriculum.updateLesson(a, { content: null, videoUrl: "https://cdn.example.com/v.mp4" });
    expect(video).toMatchObject({ success: true, lesson: { hasVideo: true, status: "ready" } });
  });

  it("validates the video address and the duration", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a] = await lessonsOf(course.id, m, ["A"]);
    expect((await curriculum.updateLesson(a, { videoUrl: "javascript:alert(1)" })).success).toBe(false);
    expect((await curriculum.updateLesson(a, { duration: -5 })).success).toBe(false);
    expect((await curriculum.updateLesson(a, { duration: 90 })).success).toBe(true);
  });

  it("publishes a whole module but leaves the empty lessons as drafts", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a, b] = await lessonsOf(course.id, m, ["A", "B"]);
    await curriculum.updateLesson(a, { content: "<p>Du texte</p>" });
    const r = await curriculum.setModulePublished(m, true);
    expect(r).toMatchObject({ success: true, changed: 1, skipped: 1 });
    expect((await db.lesson.findUnique({ where: { id: a } }))?.published).toBe(true);
    expect((await db.lesson.findUnique({ where: { id: b } }))?.published).toBe(false);
    expect(await curriculum.setModulePublished(m, false)).toMatchObject({ success: true, changed: 1 });
  });

  it("sets the course duration from the published lessons", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a, b] = await lessonsOf(course.id, m, ["A", "B"]);
    await curriculum.updateLesson(a, { content: "<p>x</p>", duration: 600, published: true });
    await curriculum.updateLesson(b, { content: "<p>y</p>", duration: 1800, published: true });
    expect((await db.course.findUnique({ where: { id: course.id } }))?.duration).toBe(40);
  });

  it("keeps resources in order and renumbers after a delete", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const [a] = await lessonsOf(course.id, m, ["A"]);
    const add = (title: string) => curriculum.addResource(a, { title, url: `https://example.com/${title}`, kind: "LINK" });
    const [r1, r2, r3] = [await add("un"), await add("deux"), await add("trois")];
    if (!r1.success || !r2.success || !r3.success) throw new Error("add failed");
    expect((await curriculum.addResource(a, { title: "x", url: "ftp://x", kind: "LINK" })).success).toBe(false);

    await curriculum.deleteResource(r2.resource.id);
    await curriculum.reorderResources(a, [r3.resource.id, r1.resource.id]);
    const rows = await db.lessonResource.findMany({ where: { lessonId: a }, orderBy: { order: "asc" } });
    expect(rows.map((r) => `${r.title}:${r.order}`)).toEqual(["trois:1", "un:2"]);
  });
});

describe("quizzes, supports and the final exam", () => {
  it("rejects malformed questions with the position of the problem", () => {
    const check = (q: Partial<assessments.QuestionInput>) =>
      assessments.validateQuestions([{ question: "Q ?", options: ["a", "b"], correct: 0, ...q }]);
    expect(check({ question: " " })).toMatchObject({ ok: false, error: expect.stringContaining("Question 1") });
    expect(check({ options: ["a"] })).toMatchObject({ ok: false });
    expect(check({ options: ["a", ""] })).toMatchObject({ ok: false });
    expect(check({ options: ["a", "A"] })).toMatchObject({ ok: false });
    expect(check({ correct: 2 })).toMatchObject({ ok: false });
    expect(check({})).toMatchObject({ ok: true });
  });

  it("updates questions in place, reorders them and drops the ones removed", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const created = await assessments.createQuiz(course.id, m, {
      title: "Quiz",
      questions: [
        { question: "Un ?", options: ["a", "b"], correct: 0 },
        { question: "Deux ?", options: ["a", "b"], correct: 1 },
        { question: "Trois ?", options: ["a", "b", "c"], correct: 2 },
      ],
    });
    if (!created.success) throw new Error(created.error);
    const before = await db.quizQuestion.findMany({ where: { quizId: created.quizId }, orderBy: { order: "asc" } });

    const r = await assessments.updateQuiz(created.quizId, {
      title: "Quiz modifié",
      questions: [
        { id: before[2].id, question: "Trois ?", options: ["a", "b", "c"], correct: 2 },
        { id: before[0].id, question: "Un (modifié) ?", options: ["a", "b"], correct: 1 },
        { question: "Nouvelle ?", options: ["oui", "non"], correct: 0 },
      ],
    });
    expect(r.success).toBe(true);
    const after = await db.quizQuestion.findMany({ where: { quizId: created.quizId }, orderBy: { order: "asc" } });
    expect(after.map((q) => `${q.question}:${q.order}`)).toEqual(["Trois ?:1", "Un (modifié) ?:2", "Nouvelle ?:3"]);
    expect(after[0].id).toBe(before[2].id);
    expect(after[1].id).toBe(before[0].id);
    expect(await db.quizQuestion.count({ where: { id: before[1].id } })).toBe(0);
  });

  it("a quiz and a support belong to a module of their own course", async () => {
    const course = await newCourse();
    const other = await newCourse();
    const foreign = await moduleOf(other.id);
    const q = [{ question: "Q ?", options: ["a", "b"], correct: 0 }];
    expect((await assessments.createQuiz(course.id, foreign, { title: "Q", questions: q })).success).toBe(false);
    expect((await assessments.createSupport(course.id, foreign, { title: "S", slides: [{ title: "1", content: "" }] })).success).toBe(false);
  });

  it("keeps support slides and orders supports of a module", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    const mk = async (title: string) => {
      const r = await assessments.createSupport(course.id, m, { title, slides: [{ title: "Diapo", content: "<p>x</p>" }] });
      if (!r.success) throw new Error(r.error);
      return r.supportId;
    };
    const [a, b] = [await mk("A"), await mk("B")];
    expect((await assessments.createSupport(course.id, m, { title: "Vide", slides: [] })).success).toBe(false);
    await assessments.reorderSupports(m, [b, a]);
    expect((await assessments.listSupports(course.id)).map((s) => `${s.title}:${s.order}`)).toEqual(["B:1", "A:2"]);
    await assessments.deleteSupport(b);
    expect((await assessments.listSupports(course.id)).map((s) => `${s.title}:${s.order}`)).toEqual(["A:1"]);
  });

  it("stores the final exam in the shape the learner side reads", async () => {
    const course = await newCourse();
    const input = {
      title: "Examen",
      description: "Le grand final",
      passingScore: 70,
      timeLimit: 45,
      published: true,
      questions: [{ question: "Q ?", options: ["a", "b"], correct: 1, explanation: "Parce que" }],
    };
    expect((await assessments.saveExam(course.id, { ...input, questions: [] })).success).toBe(false);
    expect((await assessments.saveExam(course.id, { ...input, passingScore: 0 })).success).toBe(false);
    expect((await assessments.saveExam(course.id, input)).success).toBe(true);

    const row = await db.finalExam.findUnique({ where: { courseId: course.id } });
    expect(row?.questions).toEqual([{ id: 1, question: "Q ?", options: ["a", "b"], correct: 1, explanation: "Parce que" }]);
    expect(await assessments.getExam(course.id)).toMatchObject({ title: "Examen", timeLimit: 45, published: true });

    await assessments.saveExam(course.id, { ...input, published: false });
    expect((await db.finalExam.findUnique({ where: { courseId: course.id } }))?.published).toBe(false);
    await assessments.deleteExam(course.id);
    expect(await db.finalExam.count({ where: { courseId: course.id } })).toBe(0);
  });
});

describe("publishing", () => {
  async function readyCourse() {
    const course = await newCourse({ thumbnail: "https://cdn.example.com/c.png" });
    const m = await moduleOf(course.id);
    const [a] = await lessonsOf(course.id, m, ["A"]);
    await curriculum.updateLesson(a, { content: "<p>Du contenu</p>", published: true });
    return { course, m, lesson: a };
  }

  it("refuses an empty course and says what is missing", async () => {
    const course = await newCourse({ thumbnail: null, description: "" });
    const r = await courses.setCoursePublished(course.id, true);
    expect(r.success).toBe(false);
    if (!r.success && "readiness" in r) {
      expect(r.readiness.items.filter((i) => !i.ok).map((i) => i.key)).toEqual(["description", "thumbnail", "lessons"]);
    }
    expect((await db.course.findUnique({ where: { id: course.id } }))?.published).toBe(false);
  });

  it("publishes a ready course once, stamps the first publication, and unpublishes", async () => {
    const { course } = await readyCourse();
    expect((await courses.setCoursePublished(course.id, true)).success).toBe(true);
    const first = await db.course.findUnique({ where: { id: course.id } });
    expect(first?.published).toBe(true);
    expect(first?.publishedAt).toBeInstanceOf(Date);

    expect((await courses.setCoursePublished(course.id, false)).success).toBe(true);
    await courses.setCoursePublished(course.id, true);
    expect((await db.course.findUnique({ where: { id: course.id } }))?.publishedAt?.getTime()).toBe(first?.publishedAt?.getTime());
  });

  it("requires a price for a premium course", async () => {
    const { course } = await readyCourse();
    await courses.updateCourseInfo(course.id, { accessTier: "PREMIUM", price: 0 });
    expect((await courses.setCoursePublished(course.id, true)).success).toBe(false);
    await courses.updateCourseInfo(course.id, { price: 49 });
    expect((await courses.setCoursePublished(course.id, true)).success).toBe(true);
  });

  it("the autosave action cannot publish or feature, and keeps a published course published", async () => {
    const { course } = await readyCourse();
    const instructor = await newUser("INSTRUCTOR");
    await db.course.update({ where: { id: course.id }, data: { instructorId: instructor.id } });
    signedInAs({ id: instructor.id, role: "INSTRUCTOR" });

    // `published` is not part of the patch: a hostile payload is rejected or ignored
    const sneaky = await courseActions.updateCourse(course.id, { title: "Nouveau titre", published: true } as never);
    expect(sneaky.success).toBe(true);
    expect((await db.course.findUnique({ where: { id: course.id } }))?.published).toBe(false);

    expect((await courseActions.updateCourse(course.id, { featured: true })).success).toBe(false);

    await courses.setCoursePublished(course.id, true);
    await courseActions.updateCourse(course.id, { description: "Une description plus complète" });
    expect((await db.course.findUnique({ where: { id: course.id } }))?.published).toBe(true);
  });

  it("removes the thumbnail when asked", async () => {
    const course = await newCourse({ thumbnail: "https://cdn.example.com/c.png" });
    await courses.updateCourseInfo(course.id, { thumbnail: null });
    expect((await db.course.findUnique({ where: { id: course.id } }))?.thumbnail).toBeNull();
  });

  it("cleans FAQ, objectives and trailer", async () => {
    const course = await newCourse();
    expect((await courses.updateCourseInfo(course.id, { trailerUrl: "not a url" })).success).toBe(false);
    await courses.updateCourseInfo(course.id, {
      faq: [{ q: " Pourquoi ? ", a: " Parce que. " }, { q: "", a: "x" }],
      objectives: ["Écrire un test", "écrire un test", "  ", "Lancer la CI"],
      trailerUrl: "https://cdn.example.com/trailer.mp4",
    });
    const row = await db.course.findUnique({ where: { id: course.id } });
    expect(row?.faq).toEqual([{ q: "Pourquoi ?", a: "Parce que." }]);
    expect(row?.objectives).toEqual(["Écrire un test", "Lancer la CI"]);
    expect(row?.trailerUrl).toBe("https://cdn.example.com/trailer.mp4");
  });
});

describe("duplication", () => {
  it("copies the content of a course as an unpublished draft and nothing of its learners", async () => {
    const source = await newCourse({
      published: true,
      thumbnail: "https://cdn.example.com/c.png",
      faq: [{ q: "Q", a: "R" }],
      objectives: ["Objectif"],
    });
    const student = await newUser("STUDENT");
    await enroll(student.id, source.id);
    const tag = await db.tag.create({ data: { name: `tag-${source.id}`, color: "#111111" } });
    await db.courseTag.create({ data: { courseId: source.id, tagId: tag.id } });

    const m = await moduleOf(source.id, "Module 1");
    const [lesson] = await lessonsOf(source.id, m, ["Leçon un", "Leçon deux"]);
    await curriculum.updateLesson(lesson, { content: "<p>Contenu</p>", published: true, isPreview: true });
    await curriculum.addResource(lesson, { title: "Fiche", url: "https://example.com/f.pdf", kind: "FILE", sizeBytes: 100 });
    await assessments.createQuiz(source.id, m, {
      title: "Quiz",
      questions: [{ question: "Q ?", options: ["a", "b"], correct: 0 }],
    });
    await assessments.createSupport(source.id, m, { title: "Support", slides: [{ title: "1", content: "<p>x</p>" }] });
    await assessments.saveExam(source.id, {
      title: "Examen",
      passingScore: 70,
      timeLimit: null,
      published: true,
      questions: [{ question: "Q ?", options: ["a", "b"], correct: 0 }],
    });

    const instructor = await newUser("INSTRUCTOR");
    const r = await courses.duplicateCourse(source.id, { id: instructor.id, role: "INSTRUCTOR" });
    if (!r.success) throw new Error(r.error);
    createdCourses.push(r.courseId);

    const copy = await db.course.findUnique({
      where: { id: r.courseId },
      include: {
        modules: { include: { lessons: { include: { resources: true } }, quizzes: { include: { questions: true } }, supports: true } },
        tags: true,
        finalExam: true,
        enrollments: true,
      },
    });
    expect(copy).toMatchObject({
      title: `${source.title} (copie)`,
      slug: `${source.slug}-copie`,
      published: false,
      featured: false,
      instructorId: instructor.id,
      thumbnail: "https://cdn.example.com/c.png",
      objectives: ["Objectif"],
      faq: [{ q: "Q", a: "R" }],
    });
    expect(copy?.enrollments).toHaveLength(0);
    expect(copy?.tags).toHaveLength(1);
    expect(copy?.finalExam).toMatchObject({ title: "Examen", published: false });
    expect(copy?.modules).toHaveLength(1);
    const copiedModule = copy!.modules[0];
    expect(copiedModule.id).not.toBe(m);
    expect(copiedModule.lessons.map((l) => `${l.title}:${l.order}:${l.published}:${l.isPreview}`).sort()).toEqual([
      "Leçon deux:2:false:false",
      "Leçon un:1:true:true",
    ]);
    expect(copiedModule.lessons.find((l) => l.title === "Leçon un")?.resources).toHaveLength(1);
    expect(copiedModule.quizzes[0].questions).toHaveLength(1);
    expect(copiedModule.supports).toHaveLength(1);

    const again = await courses.duplicateCourse(source.id, { id: instructor.id, role: "INSTRUCTOR" });
    if (!again.success) throw new Error(again.error);
    createdCourses.push(again.courseId);
    expect(again.slug).toBe(`${source.slug}-copie-2`);
  });
});

describe("deleting a course", () => {
  it("is refused while learners are enrolled", async () => {
    const course = await newCourse();
    const student = await newUser("STUDENT");
    await enroll(student.id, course.id);
    expect((await courses.deleteCourse(course.id)).success).toBe(false);
    expect(await db.course.count({ where: { id: course.id } })).toBe(1);
  });

  it("removes the whole course otherwise", async () => {
    const course = await newCourse();
    const m = await moduleOf(course.id);
    await lessonsOf(course.id, m, ["A"]);
    expect((await courses.deleteCourse(course.id)).success).toBe(true);
    expect(await db.module.count({ where: { courseId: course.id } })).toBe(0);
  });
});

describe("who may edit what (server actions)", () => {
  async function owned() {
    const instructor = await newUser("INSTRUCTOR");
    const course = await newCourse({ instructorId: instructor.id });
    const m = await moduleOf(course.id);
    const [lesson] = await lessonsOf(course.id, m, ["A", "B"]);
    return { instructor, course, m, lesson };
  }

  it("lets the instructor of a course and any administrator edit it", async () => {
    const { instructor, course, m } = await owned();
    signedInAs({ id: instructor.id, role: "INSTRUCTOR" });
    expect((await curriculumActions.addLesson(course.id, m, "C")).success).toBe(true);

    const admin = await newUser("ADMIN");
    signedInAs({ id: admin.id, role: "ADMIN" });
    expect((await curriculumActions.addLesson(course.id, m, "D")).success).toBe(true);
  });

  it("denies another instructor on every kind of edit, including by lesson id and module id", async () => {
    const { course, m, lesson } = await owned();
    const stranger = await newUser("INSTRUCTOR");
    signedInAs({ id: stranger.id, role: "INSTRUCTOR" });

    const denied = { success: false };
    expect(await curriculumActions.addModule(course.id, "X")).toMatchObject(denied);
    expect(await curriculumActions.addLesson(course.id, m, "X")).toMatchObject(denied);
    expect(await curriculumActions.loadLesson(lesson)).toMatchObject(denied);
    expect(await curriculumActions.saveLesson(lesson, { title: "Piraté" })).toMatchObject(denied);
    expect(await curriculumActions.removeLesson(lesson)).toMatchObject(denied);
    expect(await curriculumActions.renameModule(m, "Piraté")).toMatchObject(denied);
    expect(await curriculumActions.removeModule(m)).toMatchObject(denied);
    expect(await curriculumActions.reorderLessons(m, [lesson])).toMatchObject(denied);
    expect(await curriculumActions.moveLesson(lesson, m, 0)).toMatchObject(denied);
    expect(await curriculumActions.addLessonResource(lesson, { title: "x", url: "https://x.dev", kind: "LINK" })).toMatchObject(denied);
    expect(await assessmentActions.addQuiz(course.id, m, { title: "Q", questions: [] })).toMatchObject(denied);
    expect(await assessmentActions.saveFinalExam(course.id, { title: "E", passingScore: 70, timeLimit: null, questions: [], published: false })).toMatchObject(denied);
    expect(await courseActions.updateCourse(course.id, { title: "Piraté" })).toMatchObject(denied);
    expect(await courseActions.publishCourse(course.id)).toMatchObject(denied);
    expect(await courseActions.duplicateCourse(course.id)).toMatchObject(denied);
    expect(await courseActions.deleteCourse(course.id)).toMatchObject(denied);

    expect((await db.lesson.findUnique({ where: { id: lesson } }))?.title).toBe("A");
    expect(await db.module.count({ where: { courseId: course.id } })).toBe(1);
  });

  it("cannot reorder lessons by naming lessons of a course one does not own", async () => {
    const mine = await owned();
    const theirs = await owned();
    signedInAs({ id: mine.instructor.id, role: "INSTRUCTOR" });
    // the module is mine, the lesson ids are not: the id set does not match, nothing moves
    const r = await curriculumActions.reorderLessons(mine.m, [theirs.lesson]);
    expect(r.success).toBe(false);
    expect(await titles(theirs.m)).toEqual(["A", "B"]);
  });

  it("denies students, anonymous visitors and a course with no instructor to an instructor", async () => {
    const { course } = await owned();
    const student = await newUser("STUDENT");
    signedInAs({ id: student.id, role: "STUDENT" });
    expect(await curriculumActions.addModule(course.id, "X")).toMatchObject({ success: false });
    signedInAs(null);
    expect(await curriculumActions.addModule(course.id, "X")).toMatchObject({ success: false });

    const orphan = await newCourse({ instructorId: null });
    const instructor = await newUser("INSTRUCTOR");
    signedInAs({ id: instructor.id, role: "INSTRUCTOR" });
    expect(await curriculumActions.addModule(orphan.id, "X")).toMatchObject({ success: false });
  });

  it("returns the new outline after a change, and creating a course never publishes", async () => {
    const instructor = await newUser("INSTRUCTOR");
    signedInAs({ id: instructor.id, role: "INSTRUCTOR" });
    const created = await courseActions.createCourse({ title: "Ma formation", category: "JAVASCRIPT", level: "BEGINNER" });
    if (!created.success) throw new Error(created.error);
    createdCourses.push(created.courseId);

    const row = await db.course.findUnique({ where: { id: created.courseId } });
    expect(row).toMatchObject({ published: false, instructorId: instructor.id, slug: "ma-formation" });

    const mod = await curriculumActions.addModule(created.courseId, "Premier module");
    if (!mod.success) throw new Error(mod.error);
    expect(mod.snapshot.modules.map((x) => x.title)).toEqual(["Premier module"]);

    const lesson = await curriculumActions.addLesson(created.courseId, mod.moduleId!, "Première leçon");
    if (!lesson.success) throw new Error(lesson.error);
    expect(lesson.snapshot.modules[0].lessons).toMatchObject([{ title: "Première leçon", status: "draft" }]);

    const publish = await courseActions.publishCourse(created.courseId);
    expect(publish.success).toBe(false);
  });
});
