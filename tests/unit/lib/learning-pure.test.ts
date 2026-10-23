import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/access-service", () => ({ AccessService: {} }));

import { buildCurriculumView, curriculumStats, formatMinutes } from "@/lib/learning/curriculum-view";
import {
  examRetakeDecision,
  gradeExam,
  parseExamQuestions,
  withinTimeLimit,
} from "@/lib/learning/exam";
import { signExamStart, verifyExamStart } from "@/lib/learning/exam-token";
import { progressEtag } from "@/lib/learning/etag";
import { formatTime } from "@/lib/learning/format-time";
import { canOpenItem, outlineHasFlaggedPreview } from "@/lib/learning/access";
import { findCurrentItem } from "@/components/learning/use-current-item";
import { sampleOutline } from "../../support/learning-outline";

const outline = sampleOutline();

describe("curriculum view", () => {
  const view = (opts: Partial<Parameters<typeof buildCurriculumView>[2]> = {}) =>
    buildCurriculumView(outline, "react", { isDone: () => false, nextId: null, canOpen: () => true, ...opts });

  it("turns the outline into sections with the exam last", () => {
    const sections = view();
    expect(sections.map((s) => s.title)).toEqual(["Bases", "Avancé", "Examen final"]);
    expect(sections[0].items.map((i) => i.kind)).toEqual(["lesson", "lesson", "quiz"]);
  });

  it("gives a link only for what can be opened, and flags the next step and the previews", () => {
    const sections = view({ canOpen: (i) => i.id === "l1", nextId: "l2", isDone: (i) => i.id === "l1" });
    const [l1, l2] = sections[0].items;
    expect(l1).toMatchObject({ href: "/learn/react/lessons/variables", done: true, isPreview: true });
    expect(l2).toMatchObject({ href: null, isNext: true, done: false });
    expect(sections[0].items[2]).toMatchObject({ kind: "quiz", questionCount: 2, href: null });
  });

  it("counts what the course holds", () => {
    expect(curriculumStats(outline)).toEqual({ modules: 2, lessons: 3, quizzes: 1, hasExam: true, minutes: 30 });
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(125)).toBe("2 h 05");
  });
});

describe("who may open what", () => {
  const lesson2 = outline.items.find((i) => i.id === "l2")!;
  const lesson1 = outline.items.find((i) => i.id === "l1")!;
  const quiz = outline.items.find((i) => i.kind === "quiz")!;

  it("opens everything to an enrolled learner and to the author", () => {
    for (const mode of ["full", "staff"] as const) {
      expect(outline.items.every((i) => canOpenItem(mode, i, outline, true))).toBe(true);
    }
    expect(outline.items.some((i) => canOpenItem("none", i, outline, true))).toBe(false);
  });

  it("opens only the flagged lessons to a previewer, never a quiz or the exam", () => {
    expect(outlineHasFlaggedPreview(outline)).toBe(true);
    expect(canOpenItem("preview", lesson1, outline, true)).toBe(true);
    expect(canOpenItem("preview", lesson2, outline, true)).toBe(false);
    expect(canOpenItem("preview", quiz, outline, true)).toBe(false);
  });

  it("falls back to the first lesson when none is flagged", () => {
    expect(canOpenItem("preview", lesson1, outline, false)).toBe(true);
    expect(canOpenItem("preview", lesson2, outline, false)).toBe(false);
  });
});

describe("current item from the URL", () => {
  it("finds lessons by slug, quizzes by id and the exam", () => {
    expect(findCurrentItem("/fr/learn/react/lessons/fonctions", outline)?.id).toBe("l2");
    expect(findCurrentItem("/fr/learn/react/quizzes/q1", outline)?.id).toBe("q1");
    expect(findCurrentItem("/fr/learn/react/exam", outline)?.id).toBe("x1");
    expect(findCurrentItem("/fr/learn/react/completed", outline)).toBeNull();
    expect(findCurrentItem("/fr/learn/react/lessons/unknown", outline)).toBeNull();
  });
});

describe("final exam rules", () => {
  const stored = [
    { question: "Q1", options: ["a", "b", "c"], correct: 1, explanation: "e1" },
    { question: "Q2", options: ["a", "b"], correct: 0 },
    { question: "broken", options: ["only"], correct: 0 },
    { question: "out of range", options: ["a", "b"], correct: 5 },
    "garbage",
  ];

  it("keeps the valid questions only", () => {
    const questions = parseExamQuestions(stored);
    expect(questions.map((q) => q.question)).toEqual(["Q1", "Q2"]);
    expect(questions[1].explanation).toBe("");
    expect(parseExamQuestions(null)).toEqual([]);
  });

  it("grades, counting blank and out-of-range answers wrong", () => {
    const questions = parseExamQuestions(stored);
    expect(gradeExam(questions, [1, 0], 70)).toMatchObject({ score: 2, percentage: 100, passed: true });
    expect(gradeExam(questions, [1, null], 70)).toMatchObject({ score: 1, percentage: 50, passed: false });
    const blank = gradeExam(questions, [9, -1], 70);
    expect(blank.score).toBe(0);
    expect(blank.review.map((r) => r.selected)).toEqual([null, null]);
    expect(gradeExam([], [], 70).passed).toBe(false);
  });

  it("applies the passing score of the exam", () => {
    const questions = parseExamQuestions(stored);
    expect(gradeExam(questions, [1, null], 50).passed).toBe(true);
  });

  it("allows a retake only after the waiting time, never after a pass", () => {
    const now = new Date("2026-10-23T12:00:00Z");
    expect(examRetakeDecision(null, now)).toEqual({ allowed: true });
    expect(examRetakeDecision({ completedAt: new Date("2026-10-23T11:50:00Z"), passed: true }, now)).toEqual({
      allowed: false,
      reason: "PASSED",
    });
    const soon = examRetakeDecision({ completedAt: new Date("2026-10-23T11:50:00Z"), passed: false }, now);
    expect(soon).toMatchObject({ allowed: false, reason: "COOLDOWN" });
    expect(examRetakeDecision({ completedAt: new Date("2026-10-23T11:30:00Z"), passed: false }, now)).toEqual({ allowed: true });
  });

  it("signs the start of a sitting so the time limit cannot be dodged", () => {
    const token = signExamStart("user-1", "exam-1", 1_000_000);
    expect(verifyExamStart(token, "user-1", "exam-1")).toBe(1_000_000);
    expect(verifyExamStart(token, "user-2", "exam-1")).toBeNull();
    expect(verifyExamStart(token, "user-1", "exam-2")).toBeNull();
    expect(verifyExamStart(token.replace("1000000", "2000000"), "user-1", "exam-1")).toBeNull();
    expect(verifyExamStart("nonsense", "user-1", "exam-1")).toBeNull();
  });

  it("enforces the time limit with a small grace", () => {
    const start = 1_000_000;
    expect(withinTimeLimit(start, start + 59 * 60_000, 60)).toBe(true);
    expect(withinTimeLimit(start, start + 60 * 60_000 + 30_000, 60)).toBe(true);
    expect(withinTimeLimit(start, start + 62 * 60_000, 60)).toBe(false);
    expect(withinTimeLimit(start, start + 10 * 3600_000, null)).toBe(true);
  });
});

describe("small helpers", () => {
  it("formats times", () => {
    expect(formatTime(75)).toBe("1:15");
    expect(formatTime(3725)).toBe("1:02:05");
    expect(formatTime(Number.NaN)).toBe("0:00");
  });

  it("builds an ETag that changes with the progress", () => {
    const a = progressEtag([{ courseId: "c", percent: 10, hasCertificate: false }]);
    expect(progressEtag([{ courseId: "c", percent: 10, hasCertificate: false }])).toBe(a);
    expect(progressEtag([{ courseId: "c", percent: 20, hasCertificate: false }])).not.toBe(a);
  });
});
