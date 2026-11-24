import { describe, expect, it } from "vitest";

import { PATH } from "@/app/[locale]/(main)/tech-mastry/_catalog";
import { EXERCISES, exercisesFor } from "@/app/[locale]/(main)/tech-mastry/_catalog/exercises";
import {
  allRight,
  checkClassify,
  checkFill,
  checkMatch,
  checkOrder,
  mixedOrder,
  splitCode,
} from "@/app/[locale]/(main)/tech-mastry/_utils/exercise-logic";

const distinct = (values: string[]) => new Set(values.map((value) => value.trim().toLowerCase())).size === values.length;

describe("the hands-on exercises of each lesson", () => {
  it("has exercises for every lesson of the path, and only for lessons of the path", () => {
    const missing = PATH.filter((topic) => (EXERCISES[topic.route] ?? []).length === 0).map((topic) => topic.route);
    expect(missing, "lessons without exercises").toEqual([]);
    const strangers = Object.keys(EXERCISES).filter((route) => !PATH.some((topic) => topic.route === route));
    expect(strangers, "exercises for routes that are not lessons").toEqual([]);
  });

  it("offers 2 or 3 exercises per lesson, of at least two different kinds", () => {
    for (const topic of PATH) {
      const list = EXERCISES[topic.route] ?? [];
      expect(list.length, `${topic.route} exercise count`).toBeGreaterThanOrEqual(2);
      expect(list.length, `${topic.route} exercise count`).toBeLessThanOrEqual(3);
      expect(new Set(list.map((exercise) => exercise.type)).size, `${topic.route} kinds`).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every exercise a unique id, a prompt and an explanation", () => {
    const ids = new Set<string>();
    for (const [route, list] of Object.entries(EXERCISES)) {
      for (const exercise of list) {
        const where = `${route} / ${exercise.id}`;
        expect(ids.has(exercise.id), `${where} id is used twice`).toBe(false);
        ids.add(exercise.id);
        expect(exercise.prompt.trim().length, `${where} prompt`).toBeGreaterThan(15);
        expect(exercise.explanation.trim().length, `${where} explanation`).toBeGreaterThan(30);
      }
    }
  });

  it("orders 3 to 7 distinct steps", () => {
    for (const list of Object.values(EXERCISES)) {
      for (const exercise of list) {
        if (exercise.type !== "order") continue;
        expect(exercise.steps.length, exercise.id).toBeGreaterThanOrEqual(3);
        expect(exercise.steps.length, exercise.id).toBeLessThanOrEqual(7);
        expect(distinct(exercise.steps), `${exercise.id} steps are distinct`).toBe(true);
      }
    }
  });

  it("matches 3 to 6 pairs whose terms and definitions are all distinct", () => {
    for (const list of Object.values(EXERCISES)) {
      for (const exercise of list) {
        if (exercise.type !== "match") continue;
        expect(exercise.pairs.length, exercise.id).toBeGreaterThanOrEqual(3);
        expect(exercise.pairs.length, exercise.id).toBeLessThanOrEqual(6);
        expect(distinct(exercise.pairs.map((pair) => pair.term)), `${exercise.id} terms`).toBe(true);
        expect(distinct(exercise.pairs.map((pair) => pair.definition)), `${exercise.id} definitions`).toBe(true);
      }
    }
  });

  it("fills 1 to 4 blanks, each marked {{n}} in order in the code, with 3 or 4 distinct options and a valid answer", () => {
    for (const list of Object.values(EXERCISES)) {
      for (const exercise of list) {
        if (exercise.type !== "fill") continue;
        const marked = splitCode(exercise.code).flatMap((part) => ("blank" in part ? [part.blank] : []));
        expect(marked, `${exercise.id} blanks appear as {{1}}, {{2}}... once each, in order`).toEqual(exercise.blanks.map((_, index) => index + 1));
        expect(exercise.blanks.length, exercise.id).toBeGreaterThanOrEqual(1);
        expect(exercise.blanks.length, exercise.id).toBeLessThanOrEqual(4);
        for (const [index, blank] of exercise.blanks.entries()) {
          const where = `${exercise.id} blank ${index + 1}`;
          expect(blank.options.length, where).toBeGreaterThanOrEqual(3);
          expect(blank.options.length, where).toBeLessThanOrEqual(4);
          expect(distinct(blank.options), `${where} options are distinct`).toBe(true);
          expect(Number.isInteger(blank.answer) && blank.answer >= 0 && blank.answer < blank.options.length, `${where} answer`).toBe(true);
        }
        // a blank that every option could fill would teach nothing: the answers must not all sit at the same position
        if (exercise.blanks.length >= 3) expect(new Set(exercise.blanks.map((blank) => blank.answer)).size, `${exercise.id} answer positions`).toBeGreaterThan(1);
      }
    }
  });

  it("classifies 4 to 8 items into 2 to 4 categories, each category used", () => {
    for (const list of Object.values(EXERCISES)) {
      for (const exercise of list) {
        if (exercise.type !== "classify") continue;
        expect(exercise.categories.length, exercise.id).toBeGreaterThanOrEqual(2);
        expect(exercise.categories.length, exercise.id).toBeLessThanOrEqual(4);
        expect(distinct(exercise.categories), `${exercise.id} categories`).toBe(true);
        expect(exercise.items.length, exercise.id).toBeGreaterThanOrEqual(4);
        expect(exercise.items.length, exercise.id).toBeLessThanOrEqual(8);
        expect(distinct(exercise.items.map((item) => item.text)), `${exercise.id} items`).toBe(true);
        const used = new Set(exercise.items.map((item) => item.category));
        for (let category = 0; category < exercise.categories.length; category++) expect(used.has(category), `${exercise.id} uses category ${category}`).toBe(true);
        for (const item of exercise.items) expect(Number.isInteger(item.category) && item.category >= 0 && item.category < exercise.categories.length, `${exercise.id} item category`).toBe(true);
      }
    }
  });

  it("reads the exercises of a topic from any form of its path", () => {
    const topic = PATH[0];
    expect(exercisesFor(`/fr${topic.route}/`)).toBe(EXERCISES[topic.route]);
    expect(exercisesFor("/tech-mastry/nope")).toEqual([]);
  });
});

describe("the rules of the exercises", () => {
  it("mixes the steps the same way for the same seed, never leaving them in the right order", () => {
    for (const n of [2, 3, 4, 5, 7]) {
      for (const seed of ["a", "git-workflows-order-1", "x".repeat(40)]) {
        const order = mixedOrder(n, seed);
        expect(order).toEqual(mixedOrder(n, seed));
        expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
        expect(order.every((value, index) => value === index), `${n}/${seed} left in order`).toBe(false);
      }
    }
    expect(mixedOrder(5, "one")).not.toEqual(mixedOrder(5, "another seed"));
  });

  it("checks an order, a matching, a fill and a classification line by line", () => {
    const order = { id: "o", type: "order", prompt: "", explanation: "", steps: ["a", "b", "c"] } as const;
    expect(checkOrder(order, [0, 1, 2])).toEqual([true, true, true]);
    expect(checkOrder(order, [1, 0, 2])).toEqual([false, false, true]);

    const match = { id: "m", type: "match", prompt: "", explanation: "", pairs: [{ term: "x", definition: "X" }, { term: "y", definition: "Y" }] } as const;
    expect(checkMatch(match, [0, 1])).toEqual([true, true]);
    expect(checkMatch(match, [1, null])).toEqual([false, false]);

    const fill = { id: "f", type: "fill", prompt: "", explanation: "", code: "{{1}} {{2}}", blanks: [{ options: ["a", "b", "c"], answer: 1 }, { options: ["d", "e", "f"], answer: 2 }] } as const;
    expect(checkFill(fill, [1, 2])).toEqual([true, true]);
    expect(checkFill(fill, [1, 0])).toEqual([true, false]);

    const classify = { id: "c", type: "classify", prompt: "", explanation: "", categories: ["p", "q"], items: [{ text: "i", category: 0 }, { text: "j", category: 1 }] } as const;
    expect(checkClassify(classify, [0, 1])).toEqual([true, true]);
    expect(checkClassify(classify, [1, 1])).toEqual([false, true]);

    expect(allRight([true, true])).toBe(true);
    expect(allRight([true, false])).toBe(false);
    expect(allRight([])).toBe(false);
  });

  it("splits a code sample at its blanks", () => {
    expect(splitCode("git {{1}} -m {{2}}!")).toEqual([{ text: "git " }, { blank: 1 }, { text: " -m " }, { blank: 2 }, { text: "!" }]);
    expect(splitCode("no blank")).toEqual([{ text: "no blank" }]);
    expect(splitCode("{{1}}")).toEqual([{ blank: 1 }]);
  });
});
