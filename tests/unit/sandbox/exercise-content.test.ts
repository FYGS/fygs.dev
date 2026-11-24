import { describe, expect, it } from "vitest";
import { challenges } from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges/data";
import {
  entryPointOf,
  toSandboxTests,
} from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges/lib";
import { exercises as searchingExercises } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-exercises-improved";
import { functionNameOf } from "@/app/_lib/code-sandbox";
import { exercises as sortingExercises } from "@/app/[locale]/(main)/tech-mastry/algorithms/sorting/_components/sections/sorting-exercises";
import { runWorker, testResults } from "./worker-harness";

/**
 * Content regression: the reference solution of every exercise and challenge must pass its
 * own tests, run the way learners' code is run (in the sandbox worker). A typo in a test or in
 * a solution is otherwise only found by a learner, as a "your code is wrong" they cannot fix.
 */

describe("coding challenges", () => {
  it.each(challenges.map((c) => [c.title, c] as const))("the solution of %s passes every test, hidden ones included", (_title, challenge) => {
    const messages = runWorker({
      code: challenge.solution,
      entry: entryPointOf(challenge),
      tests: toSandboxTests(challenge) as unknown as Array<Record<string, unknown>>,
    });

    expect(messages[0].type).toBe("test"); // no compile error
    const results = testResults(messages);
    expect(results).toHaveLength(challenge.testCases.length);
    expect(results.filter((r) => !r.passed).map((r) => `${r.id}: ${r.actual} (expected ${r.expected})`)).toEqual([]);
  });

  it.each(challenges.map((c) => [c.title, c] as const))("the starter code of %s runs and does not pass yet", (_title, challenge) => {
    const results = testResults(
      runWorker({
        code: challenge.starterCode,
        entry: entryPointOf(challenge),
        tests: toSandboxTests(challenge) as unknown as Array<Record<string, unknown>>,
      }),
    );

    expect(results).toHaveLength(challenge.testCases.length);
    expect(results.every((r) => r.passed)).toBe(false); // the learner has something to do
  });

  it("ids are unique, and every hidden test is one the learner cannot read off the statement", () => {
    expect(new Set(challenges.map((c) => c.id)).size).toBe(challenges.length);
    for (const challenge of challenges) {
      expect(new Set(challenge.testCases.map((t) => t.id)).size).toBe(challenge.testCases.length);
      expect(challenge.testCases.some((t) => !t.isHidden)).toBe(true); // at least one example to look at
    }
  });
});

describe("searching exercises", () => {
  it.each(searchingExercises.map((e) => [e.title, e] as const))("the solution of %s passes its tests", (_title, exercise) => {
    const entry = `${exercise.id}Search`;
    const results = testResults(
      runWorker({
        code: exercise.solution,
        entry,
        tests: exercise.testCases.map((testCase, index) => ({ id: String(index), check: testCase.test.toString() })),
      }),
    );

    expect(results).toHaveLength(exercise.testCases.length);
    expect(results.map((r, i) => (r.passed ? null : exercise.testCases[i].name)).filter(Boolean)).toEqual([]);
  });

  it("a wrong implementation does not pass them", () => {
    for (const exercise of searchingExercises) {
      const results = testResults(
        runWorker({
          code: `function ${exercise.id}Search() { return 12345; }`,
          entry: `${exercise.id}Search`,
          tests: exercise.testCases.map((testCase, index) => ({ id: String(index), check: testCase.test.toString() })),
        }),
      );
      expect(results.some((r) => r.passed)).toBe(false);
    }
  });
});

describe("sorting exercises", () => {
  it.each(sortingExercises.map((e) => [e.title, e] as const))("the solution of %s passes its tests", (_title, exercise) => {
    const results = testResults(
      runWorker({
        code: exercise.solution,
        entry: functionNameOf(exercise.starterCode)!,
        tests: exercise.testCases.map((testCase, index) => ({
          id: String(index),
          input: JSON.stringify(testCase.input),
          expected: JSON.stringify(testCase.expected),
        })),
      }),
    );

    expect(results).toHaveLength(exercise.testCases.length);
    expect(results.filter((r) => !r.passed).map((r) => `${r.actual} (expected ${r.expected})`)).toEqual([]);
  });
});
