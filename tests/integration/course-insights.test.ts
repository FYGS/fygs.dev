import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as curriculum from "@/lib/curriculum/curriculum";
import * as courses from "@/lib/curriculum/courses";
import * as insights from "@/lib/curriculum/insights";
import * as questions from "@/lib/curriculum/lesson-questions";
import { findRedirectedCourseSlug } from "@/lib/courses/slug-redirect";
import { createCourse, createSubscription, createUser, enroll } from "../support/factories";
import * as insightActions from "@/app/[locale]/(admin)/admin/courses/[id]/_actions/insights-actions";
import * as questionActions from "@/app/[locale]/(admin)/admin/questions/_actions/question-actions";

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("@/app/actions/community/_rate-limit", () => ({ communityWriteBlock: vi.fn().mockResolvedValue(null) }));

const signedInAs = (user: { id: string; role: string; name?: string } | null) =>
  vi.mocked(auth.api.getSession).mockResolvedValue((user ? { user: { email: "x@example.test", name: "Équipe", ...user } } : null) as never);

const createdCourses: string[] = [];
const createdUsers: string[] = [];
const createdPaths: string[] = [];

async function newCourse(data: Parameters<typeof createCourse>[0] = {}) {
  const course = await createCourse({ published: false, thumbnail: "https://cdn.example.com/c.png", ...data });
  createdCourses.push(course.id);
  return course;
}
async function newUser(role: "ADMIN" | "INSTRUCTOR" | "STUDENT" = "STUDENT") {
  const user = await createUser({ role });
  createdUsers.push(user.id);
  return user;
}

/** A live course: one module, `n` published lessons, a quiz with one question. */
async function liveCourse(n = 2, data: Parameters<typeof createCourse>[0] = {}) {
  const course = await newCourse(data);
  const moduleId = (await curriculum.createModule(course.id, "Module")) as { success: true; moduleId: string };
  const lessons: string[] = [];
  for (let i = 0; i < n; i++) {
    const r = (await curriculum.createLesson(course.id, moduleId.moduleId, `Leçon ${i + 1}`)) as { success: true; lessonId: string };
    await curriculum.updateLesson(r.lessonId, { content: "<p>Du contenu</p>", published: true });
    lessons.push(r.lessonId);
  }
  const quiz = await db.quiz.create({
    data: { courseId: course.id, moduleId: moduleId.moduleId, title: "Quiz", questions: { create: [{ question: "Q", options: ["A", "B"], correct: 0, order: 1 }] } },
  });
  expect((await courses.setCoursePublished(course.id, true)).success).toBe(true);
  return { course, moduleId: moduleId.moduleId, lessons, quizId: quiz.id };
}

const complete = (userId: string, lessonId: string) =>
  db.progress.create({ data: { userId, lessonId, completed: true, completedAt: new Date() } });

beforeEach(() => {
  vi.mocked(auth.api.getSession).mockReset();
});

afterEach(async () => {
  await db.path.deleteMany({ where: { id: { in: createdPaths.splice(0) } } });
  await db.course.deleteMany({ where: { id: { in: createdCourses.splice(0) } } });
  await db.user.deleteMany({ where: { id: { in: createdUsers.splice(0) } } });
});

describe("course statistics", () => {
  it("counts enrolments, activity, completion and the drop-off per step with the learners' own progress rule", async () => {
    const { course, lessons, quizId } = await liveCourse(2);
    const [done, halfway, idle] = [await newUser(), await newUser(), await newUser()];
    for (const u of [done, halfway, idle]) await enroll(u.id, course.id);
    await complete(done.id, lessons[0]);
    await complete(done.id, lessons[1]);
    await db.quizResult.create({ data: { userId: done.id, quizId, score: 1, total: 1, percentage: 100 } });
    await complete(halfway.id, lessons[0]);
    await db.quizResult.create({ data: { userId: halfway.id, quizId, score: 0, total: 1, percentage: 40 } });
    // an old activity is outside the 7-day window
    await db.progress.updateMany({ where: { userId: halfway.id }, data: { updatedAt: new Date(Date.now() - 20 * 86_400_000) } });

    const stats = await insights.getCourseStatistics(course.id);
    expect(stats).toMatchObject({ enrollments: 3, completed: 1, completionRate: 33, activeLast7Days: 1, activeLast30Days: 2 });
    // done 100 %, halfway 1 of 3 steps (33), idle 0: the average of what learners see
    expect(stats.averageProgress).toBe(44);
    expect(stats.averageQuizScore).toBe(70);
    expect(stats.averageExamScore).toBeNull();
    expect(stats.steps.map((s) => [s.kind, s.done, s.rate])).toEqual([
      ["lesson", 2, 67],
      ["lesson", 1, 33],
      ["quiz", 1, 33],
    ]);
  });

  it("an empty course has zeros, not NaN", async () => {
    const course = await newCourse();
    const stats = await insights.getCourseStatistics(course.id);
    expect(stats).toMatchObject({ enrollments: 0, completionRate: 0, averageProgress: 0, steps: [] });
  });
});

describe("learners and granted access", () => {
  it("lists learners with progress and what opens the course to them, searchable and paginated", async () => {
    const { course, lessons } = await liveCourse(2, { accessTier: "PREMIUM", price: 30 });
    const buyer = await newUser();
    const subscriber = await newUser();
    const lapsed = await newUser();
    for (const u of [buyer, subscriber, lapsed]) await enroll(u.id, course.id);
    await db.payment.create({ data: { userId: buyer.id, courseId: course.id, amount: 30, status: "COMPLETED", kind: "COURSE" } });
    await createSubscription(subscriber.id);
    await createSubscription(lapsed.id, { status: "CANCELED" });
    await complete(buyer.id, lessons[0]);

    const page = await insights.listCourseLearners(course.id);
    const byId = new Map(page.rows.map((r) => [r.userId, r]));
    expect(page.total).toBe(3);
    expect(byId.get(buyer.id)).toMatchObject({ source: "purchase", progress: 33, lapsed: null });
    expect(byId.get(subscriber.id)).toMatchObject({ source: "subscription" });
    expect(byId.get(lapsed.id)).toMatchObject({ source: null, lapsed: "subscription_ended" });

    const found = await insights.listCourseLearners(course.id, { search: buyer.email.slice(0, 12) });
    expect(found.rows.map((r) => r.userId)).toEqual([buyer.id]);
    expect((await insights.listCourseLearners(course.id, { page: 99 })).page).toBe(1);
  });

  it("grants an access to an existing account, and withdraws it without losing progress", async () => {
    const { course, lessons } = await liveCourse(1, { accessTier: "PREMIUM", price: 30 });
    const admin = await newUser("ADMIN");
    const fresh = await newUser();
    const started = await newUser();

    expect((await insights.grantCourseAccess(course.id, "personne@nulle-part.test", admin.id)).success).toBe(false);

    const granted = await insights.grantCourseAccess(course.id, fresh.email.toUpperCase(), admin.id);
    expect(granted).toMatchObject({ success: true, created: true });
    expect((await insights.grantCourseAccess(course.id, fresh.email, admin.id)).success).toBe(false); // twice

    // a never-started grant goes away entirely
    expect(await insights.revokeCourseAccess(course.id, fresh.id)).toEqual({ success: true, removedEnrollment: true });
    expect(await db.enrollment.count({ where: { userId: fresh.id, courseId: course.id } })).toBe(0);

    // an existing enrolment keeps its date and progress, the grant is only an extra right
    const enrolment = await enroll(started.id, course.id);
    await complete(started.id, lessons[0]);
    await insights.grantCourseAccess(course.id, started.email, admin.id);
    const row = (await insights.listCourseLearners(course.id)).rows.find((r) => r.userId === started.id);
    expect(row).toMatchObject({ source: "grant", granted: true, progress: 50 });
    expect(await insights.revokeCourseAccess(course.id, started.id)).toEqual({ success: true, removedEnrollment: false });
    const after = await db.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: started.id, courseId: course.id } } });
    expect(after).toMatchObject({ grantedAt: null, grantedById: null, enrolledAt: enrolment.enrolledAt });
    expect(await db.progress.count({ where: { userId: started.id } })).toBe(1);
    expect((await insights.revokeCourseAccess(course.id, started.id)).success).toBe(false);
  });

  it("only an administrator gives or withdraws access; an instructor reads their own course's learners only", async () => {
    const { course } = await liveCourse(1);
    const owner = await newUser("INSTRUCTOR");
    const other = await newUser("INSTRUCTOR");
    const learner = await newUser();
    await db.course.update({ where: { id: course.id }, data: { instructorId: owner.id } });

    signedInAs({ id: owner.id, role: "INSTRUCTOR" });
    expect((await insightActions.loadCourseLearners(course.id, {})).success).toBe(true);
    expect((await insightActions.loadCourseStatistics(course.id)).success).toBe(true);
    expect((await insightActions.grantCourseAccess(course.id, learner.email)).success).toBe(false);

    signedInAs({ id: other.id, role: "INSTRUCTOR" });
    expect((await insightActions.loadCourseLearners(course.id, {})).success).toBe(false);
    expect((await insightActions.loadCourseStatistics(course.id)).success).toBe(false);

    const admin = await newUser("ADMIN");
    signedInAs({ id: admin.id, role: "ADMIN" });
    expect(await insightActions.grantCourseAccess(course.id, learner.email)).toMatchObject({ success: true, created: true });
    // the learner is told
    expect(await db.notification.count({ where: { recipientId: learner.id, type: "SYSTEM_ANNOUNCEMENT" } })).toBe(1);
  });
});

describe("a live course stays followable", () => {
  it("keeps its last published lesson: neither unpublished, deleted, nor taken away with its module", async () => {
    const { course, moduleId, lessons } = await liveCourse(1);
    expect(await curriculum.updateLesson(lessons[0], { published: false })).toMatchObject({ success: false, error: curriculum.LAST_LIVE_LESSON });
    expect(await curriculum.deleteLesson(lessons[0])).toMatchObject({ success: false });
    expect(await curriculum.deleteModule(moduleId)).toMatchObject({ success: false });
    expect(await curriculum.setModulePublished(moduleId, false)).toMatchObject({ success: false });
    expect(await db.lesson.count({ where: { courseId: course.id, published: true } })).toBe(1);

    // with a second published lesson, the first may go; once the course is a draft, anything goes
    const second = (await curriculum.createLesson(course.id, moduleId, "Autre")) as { success: true; lessonId: string };
    await curriculum.updateLesson(second.lessonId, { content: "<p>x</p>", published: true });
    expect((await curriculum.updateLesson(lessons[0], { published: false })).success).toBe(true);
    await courses.setCoursePublished(course.id, false);
    expect((await curriculum.deleteModule(moduleId)).success).toBe(true);
  });

  it("is not unpublished or deleted while a published path needs it", async () => {
    const { course } = await liveCourse(1);
    const path = await db.path.create({
      data: { slug: `parcours-${course.id}`, title: "Parcours test", description: "Un parcours", published: true, courses: { create: [{ courseId: course.id, order: 1 }] } },
    });
    createdPaths.push(path.id);
    const unpublish = await courses.setCoursePublished(course.id, false);
    expect(unpublish.success).toBe(false);
    expect(!unpublish.success && unpublish.error).toMatch(/Parcours test/);
    expect((await courses.deleteCourse(course.id)).success).toBe(false);

    await db.path.update({ where: { id: path.id }, data: { published: false } });
    expect((await courses.setCoursePublished(course.id, false)).success).toBe(true);
  });

  it("counts the learners still in progress (for the warning before adding a quiz or publishing an exam)", async () => {
    const { course } = await liveCourse(1);
    const [a, b] = [await newUser(), await newUser()];
    await enroll(a.id, course.id);
    await db.enrollment.create({ data: { userId: b.id, courseId: course.id, completedAt: new Date() } });
    expect(await insights.learnersInProgress(course.id)).toBe(1);
  });
});

describe("former addresses", () => {
  it("records the old slug as a redirect, follows chains to the current address, and frees a slug taken again", async () => {
    const course = await newCourse();
    const first = course.slug;
    expect((await courses.renameCourseSlug(course.id, "deuxieme-adresse")).success).toBe(true);
    expect((await courses.renameCourseSlug(course.id, "troisieme-adresse")).success).toBe(true);
    expect(await findRedirectedCourseSlug(first)).toBe("troisieme-adresse");
    expect(await findRedirectedCourseSlug("deuxieme-adresse")).toBe("troisieme-adresse");
    expect(await findRedirectedCourseSlug("jamais-utilisee")).toBeNull();

    // taking an old address back: it is no longer a redirect
    expect((await courses.renameCourseSlug(course.id, first)).success).toBe(true);
    expect(await findRedirectedCourseSlug(first)).toBeNull();
    expect(await findRedirectedCourseSlug("troisieme-adresse")).toBe(first);
  });
});

describe("questions asked from the lessons", () => {
  async function questionIn(courseId: string, lessonId: string, authorId: string) {
    const topic = await db.topic.create({ data: { name: `Topic ${courseId}`, slug: `topic-${courseId}`, description: "x", courseId } });
    return db.discussion.create({
      data: { title: "Pourquoi ?", slug: `q-${Date.now()}`, content: "Je ne comprends pas.", authorId, topicId: topic.id, courseId, lessonId },
    });
  }

  it("lists the questions of the instructor's courses, unanswered first, and an answer notifies the learner", async () => {
    const { course, lessons } = await liveCourse(1);
    const owner = await newUser("INSTRUCTOR");
    const other = await newUser("INSTRUCTOR");
    const learner = await newUser();
    await db.course.update({ where: { id: course.id }, data: { instructorId: owner.id } });
    const q = await questionIn(course.id, lessons[0], learner.id);

    const ownerView = await questions.listLessonQuestions({ id: owner.id, role: "INSTRUCTOR" });
    expect(ownerView).toMatchObject({ total: 1, todo: 1 });
    expect(ownerView.rows[0]).toMatchObject({ id: q.id, answeredByTeam: false, lesson: { slug: expect.any(String) } });
    expect((await questions.listLessonQuestions({ id: other.id, role: "INSTRUCTOR" })).total).toBe(0);

    signedInAs({ id: other.id, role: "INSTRUCTOR" });
    expect((await questionActions.answerQuestion(q.id, "Une réponse suffisamment longue.", true)).success).toBe(false);
    signedInAs({ id: owner.id, role: "INSTRUCTOR" });
    expect((await questionActions.answerQuestion(q.id, "court", false)).success).toBe(false);
    expect((await questionActions.answerQuestion(q.id, "Voici l'explication, pas à pas.", true)).success).toBe(true);

    const discussion = await db.discussion.findUniqueOrThrow({ where: { id: q.id }, include: { replies: true } });
    expect(discussion).toMatchObject({ isSolved: true, replyCount: 1 });
    expect(discussion.replies[0]).toMatchObject({ isModerator: true, authorId: owner.id });
    expect(await db.notification.count({ where: { recipientId: learner.id, type: "DISCUSSION_REPLY" } })).toBe(1);
    expect(await questions.countQuestionsToAnswer({ id: owner.id, role: "INSTRUCTOR" })).toBe(0);
    expect((await questions.listLessonQuestions({ id: owner.id, role: "INSTRUCTOR" }, { filter: "solved" })).total).toBe(1);

    expect((await questionActions.markQuestionSolved(q.id, false)).success).toBe(true);
    expect((await questions.listLessonQuestions({ id: owner.id, role: "INSTRUCTOR" }, { filter: "answered" })).total).toBe(1);
    await db.topic.deleteMany({ where: { courseId: course.id } });
  });
});
