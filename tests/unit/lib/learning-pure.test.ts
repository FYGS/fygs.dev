import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/access-service", () => ({ AccessService: {} }));

import { buildCurriculumView, curriculumStats } from "@/lib/learning/curriculum-view";
import {
  examSittingDecision,
  examSittingWindowMs,
  projectReview,
  gradeExam,
  parseExamQuestions,
  withinTimeLimit,
} from "@/lib/learning/exam";
import { isPreviewAttempt, previewAttemptId, previewAttemptStart, signExamAttempt, verifyExamAttempt } from "@/lib/learning/exam-token";
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

  describe("sittings", () => {
    const now = new Date("2026-10-23T12:00:00Z");
    const minutesAgo = (n: number) => new Date(now.getTime() - n * 60_000);

    it("allows a first sitting", () => {
      expect(examSittingDecision({ passedBefore: false, recent: [] }, now)).toEqual({ allowed: true });
    });

    it("never allows another sitting after a pass", () => {
      expect(examSittingDecision({ passedBefore: true, recent: [] }, now)).toEqual({ allowed: false, reason: "PASSED" });
    });

    it("makes the learner wait 15 minutes after a sitting", () => {
      const soon = examSittingDecision({ passedBefore: false, recent: [minutesAgo(10)] }, now);
      expect(soon).toMatchObject({ allowed: false, reason: "COOLDOWN" });
      if (!soon.allowed && soon.reason === "COOLDOWN") expect(soon.retryAt.toISOString()).toBe("2026-10-23T12:05:00.000Z");
      expect(examSittingDecision({ passedBefore: false, recent: [minutesAgo(30)] }, now)).toEqual({ allowed: true });
    });

    it("allows three sittings in a day, then waits for the oldest to leave the window", () => {
      const three = [minutesAgo(600), minutesAgo(300), minutesAgo(120)];
      const blocked = examSittingDecision({ passedBefore: false, recent: three }, now);
      expect(blocked).toMatchObject({ allowed: false, reason: "DAILY_LIMIT" });
      if (!blocked.allowed && blocked.reason === "DAILY_LIMIT") {
        expect(blocked.retryAt.getTime()).toBe(minutesAgo(600).getTime() + 24 * 3_600_000);
      }
      expect(examSittingDecision({ passedBefore: false, recent: [minutesAgo(1500), minutesAgo(300), minutesAgo(120)] }, now)).toEqual({ allowed: true });
    });
  });

  it("shows a failed sitting only which questions were missed, and a passed one everything", () => {
    const questions = parseExamQuestions(stored);
    const failed = projectReview(gradeExam(questions, [0, 1], 70));
    expect(failed.revealed).toBe(false);
    expect(failed.items).toEqual([
      { index: 0, isCorrect: false, selected: 0 },
      { index: 1, isCorrect: false, selected: 1 },
    ]);
    const wire = JSON.stringify(failed);
    for (const secret of ["correctOption", "explanation"]) expect(wire).not.toContain(secret);

    const passed = projectReview(gradeExam(questions, [1, 0], 70));
    expect(passed.revealed).toBe(true);
    expect(JSON.stringify(passed)).toContain("correctOption");

    // the author trying their own exam sees the correction whatever the score
    expect(projectReview(gradeExam(questions, [0, 1], 70), true).revealed).toBe(true);
  });

  it("signs a sitting for one learner and one exam, with a key of its own", () => {
    const token = signExamAttempt("user-1", "exam-1", "attempt-1");
    expect(verifyExamAttempt(token, "user-1", "exam-1")).toBe("attempt-1");
    expect(verifyExamAttempt(token, "user-2", "exam-1")).toBeNull();
    expect(verifyExamAttempt(token, "user-1", "exam-2")).toBeNull();
    expect(verifyExamAttempt(token.replace("attempt-1", "attempt-2"), "user-1", "exam-1")).toBeNull();
    expect(verifyExamAttempt(`${token}x`, "user-1", "exam-1")).toBeNull();
    for (const bad of ["nonsense", ".", "a.", ".b", ""]) expect(verifyExamAttempt(bad, "user-1", "exam-1")).toBeNull();
  });

  it("recognises the throw-away sitting of an author", () => {
    const id = previewAttemptId(1_234_567);
    expect(isPreviewAttempt(id)).toBe(true);
    expect(previewAttemptStart(id)).toBe(1_234_567);
    expect(isPreviewAttempt("cmabc123")).toBe(false);
    expect(previewAttemptStart("preview-nope")).toBeNull();
  });

  it("keeps a sitting open for its limit plus a minute, or a day when there is no limit", () => {
    expect(examSittingWindowMs(60)).toBe(61 * 60_000);
    expect(examSittingWindowMs(null)).toBe(24 * 3_600_000);
    expect(withinTimeLimit(0, 24 * 3_600_000, null)).toBe(true);
    expect(withinTimeLimit(0, 24 * 3_600_000 + 1, null)).toBe(false);
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
});
