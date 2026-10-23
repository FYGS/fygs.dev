import { describe, expect, it } from "vitest";
import {
  buildOutline,
  computeProgress,
  itemHref,
  neighbours,
  type OutlineLessonInput,
  type OutlineModule,
} from "@/lib/learning/outline";
import { slugify, uniqueSlug } from "@/lib/text/slug";

const m = (id: string, order: number): OutlineModule => ({ id, title: `Module ${id}`, slug: id, order });
const lesson = (id: string, order: number, moduleId: string | null): OutlineLessonInput => ({
  id,
  slug: `s-${id}`,
  title: `Lesson ${id}`,
  order,
  duration: 5,
  moduleId,
});

describe("slugify", () => {
  it("folds accents instead of dropping the letters", () => {
    expect(slugify("Présentation")).toBe("presentation");
    expect(slugify("Œuvre à l'écoute")).toBe("oeuvre-a-l-ecoute");
  });
  it("collapses punctuation and trims dashes", () => {
    expect(slugify("  C++ & Rust: le guide!  ")).toBe("c-rust-le-guide");
  });
  it("falls back when nothing Latin is left", () => {
    expect(slugify("日本語", "lecon")).toBe("lecon");
  });
  it("finds a free slug", async () => {
    const taken = new Set(["intro", "intro-2"]);
    expect(await uniqueSlug("intro", async (s) => taken.has(s))).toBe("intro-3");
    expect(await uniqueSlug("autre", async (s) => taken.has(s))).toBe("autre");
  });
});

describe("buildOutline", () => {
  const outline = buildOutline({
    modules: [m("b", 2), m("a", 1), m("empty", 3)],
    lessons: [lesson("a2", 2, "a"), lesson("a1", 1, "a"), lesson("b1", 1, "b"), lesson("free", 1, null), lesson("lost", 2, "deleted")],
    quizzes: [
      { id: "qa", title: "Quiz A", moduleId: "a", questionCount: 3 },
      { id: "qb-empty", title: "Empty", moduleId: "b", questionCount: 0 },
    ],
    exam: { id: "x", title: "Exam", questionCount: 10 },
  });

  it("puts standalone lessons first, then modules by order, quiz after its lessons, exam last", () => {
    expect(outline.items.map((i) => i.id)).toEqual(["free", "lost", "a1", "a2", "qa", "b1", "x"]);
  });
  it("omits modules with nothing to show and quizzes without questions", () => {
    expect(outline.sections.map((s) => s.module?.id ?? null)).toEqual([null, "a", "b"]);
  });
  it("drops an exam without questions", () => {
    const none = buildOutline({ modules: [], lessons: [lesson("l", 1, null)], quizzes: [], exam: { id: "x", title: "E", questionCount: 0 } });
    expect(none.items.map((i) => i.id)).toEqual(["l"]);
  });
  it("gives routes and neighbours", () => {
    const quiz = outline.items.find((i) => i.id === "qa")!;
    expect(itemHref("react", quiz)).toBe("/learn/react/quizzes/qa");
    expect(itemHref("react", outline.items[0])).toBe("/learn/react/lessons/s-free");
    expect(itemHref("react", outline.items.at(-1)!)).toBe("/learn/react/exam");
    expect(neighbours(outline, "a2")).toMatchObject({ previous: { id: "a1" }, next: { id: "qa" } });
    expect(neighbours(outline, "free").previous).toBeNull();
    expect(neighbours(outline, "x").next).toBeNull();
    expect(neighbours(outline, "unknown")).toEqual({ previous: null, next: null });
  });
});

describe("computeProgress", () => {
  const outline = buildOutline({
    modules: [m("a", 1)],
    lessons: [lesson("l1", 1, "a"), lesson("l2", 2, "a")],
    quizzes: [{ id: "q", title: "Q", moduleId: "a", questionCount: 2 }],
    exam: { id: "x", title: "X", questionCount: 5 },
  });
  const state = (l: string[], q: string[], exam: boolean) => ({
    completedLessonIds: new Set(l),
    passedQuizIds: new Set(q),
    examPassed: exam,
  });

  it("starts at zero and points at the first item", () => {
    const p = computeProgress(outline, state([], [], false));
    expect(p).toMatchObject({ total: 4, done: 0, percent: 0, isComplete: false, next: { id: "l1" } });
  });
  it("counts lessons, quizzes and the exam alike", () => {
    const p = computeProgress(outline, state(["l1", "l2"], [], false));
    expect(p.percent).toBe(50);
    expect(p.next).toMatchObject({ id: "q" });
    expect(p.lessons).toEqual({ done: 2, total: 2 });
    expect(p.exam).toEqual({ required: true, passed: false });
  });
  it("is complete only when everything is done", () => {
    expect(computeProgress(outline, state(["l1", "l2"], ["q"], false)).isComplete).toBe(false);
    const done = computeProgress(outline, state(["l1", "l2"], ["q"], true));
    expect(done).toMatchObject({ percent: 100, isComplete: true, next: null });
  });
  it("never rounds up to 100 while an item is left", () => {
    const big = buildOutline({
      modules: [],
      lessons: Array.from({ length: 300 }, (_, i) => lesson(`l${i}`, i + 1, null)),
      quizzes: [],
    });
    const almost = computeProgress(big, state(big.items.slice(1).map((i) => i.id), [], false));
    expect(almost.percent).toBe(99);
  });
  it("an empty course is not complete", () => {
    const p = computeProgress(buildOutline({ modules: [], lessons: [], quizzes: [] }), state([], [], false));
    expect(p).toMatchObject({ total: 0, percent: 0, isComplete: false, next: null });
  });
});
