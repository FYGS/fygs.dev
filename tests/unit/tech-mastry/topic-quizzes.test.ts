import { describe, expect, it } from "vitest";

import { AREAS, PATH, getTopic, lessonsOf } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import { QUIZZES, questionsFor } from "@/app/[locale]/(main)/tech-mastry/_catalog/quizzes";

describe("the self-check of each lesson", () => {
  it("has questions for every lesson of the path, and only for lessons of the path", () => {
    const missing = PATH.filter((topic) => (QUIZZES[topic.route] ?? []).length === 0).map((topic) => topic.route);
    expect(missing, "lessons without a self-check").toEqual([]);
    const strangers = Object.keys(QUIZZES).filter((route) => !PATH.some((topic) => topic.route === route));
    expect(strangers, "quizzes for routes that are not lessons").toEqual([]);
  });

  it("asks 5 to 8 questions per lesson, with a mix of difficulties", () => {
    for (const topic of PATH) {
      const questions = QUIZZES[topic.route] ?? [];
      expect(questions.length, `${topic.route} question count`).toBeGreaterThanOrEqual(5);
      expect(questions.length, `${topic.route} question count`).toBeLessThanOrEqual(8);
      expect(questions.some((q) => q.difficulty === "easy"), `${topic.route} has an easy question`).toBe(true);
      expect(questions.some((q) => q.difficulty !== "easy"), `${topic.route} has a harder question`).toBe(true);
    }
  });

  it("is well formed: unique ids, four distinct options, a valid answer, an explanation", () => {
    const ids = new Set<string>();
    for (const [route, questions] of Object.entries(QUIZZES)) {
      for (const q of questions) {
        const where = `${route} / ${q.id}`;
        expect(ids.has(q.id), `${where} id is used twice`).toBe(false);
        ids.add(q.id);
        expect(q.question.trim().length, `${where} question`).toBeGreaterThan(15);
        expect(q.options, `${where} options`).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.trim().toLowerCase())).size, `${where} options are distinct`).toBe(4);
        for (const option of q.options) expect(option.trim().length, `${where} option`).toBeGreaterThan(0);
        expect(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, `${where} correctIndex`).toBe(true);
        expect(q.explanation.trim().length, `${where} explanation`).toBeGreaterThan(30);
        expect(["easy", "medium", "hard"]).toContain(q.difficulty);
      }
    }
  });

  it("does not give the answer away by position or by length", () => {
    for (const area of AREAS) {
      const questions = lessonsOf(area).flatMap((topic) => QUIZZES[topic.route] ?? []);
      if (questions.length < 20) continue;
      const share = (predicate: (q: (typeof questions)[number]) => boolean) => questions.filter(predicate).length / questions.length;
      for (let position = 0; position < 4; position++) {
        expect(share((q) => q.correctIndex === position), `${area.id}: answer at position ${position + 1}`).toBeLessThan(0.45);
      }
      const longest = share((q) => q.options[q.correctIndex].length === Math.max(...q.options.map((o) => o.length)));
      expect(longest, `${area.id}: the right answer is the longest one too often`).toBeLessThan(0.55);
    }
  });

  it("reads the questions of a topic from any form of its path", () => {
    const topic = PATH[0];
    expect(questionsFor(`/fr${topic.route}/`)).toBe(QUIZZES[topic.route]);
    expect(questionsFor("/tech-mastry/nope")).toEqual([]);
    expect(getTopic(topic.route)).toBeDefined();
  });
});
