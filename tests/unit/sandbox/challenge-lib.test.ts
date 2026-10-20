import { describe, expect, it } from "vitest";
import { challenges } from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges/data";
import {
  challengeStats,
  entryPointOf,
  toSandboxTests,
  toSubmissionResult,
  visibleTest,
} from "@/app/[locale]/(main)/tech-mastry/challenges/_components/advanced-coding-challenges/lib";
import type { SandboxResult } from "@/app/_lib/code-sandbox";

const twoSum = challenges[0]; // tests 1,2 visible, 3,4 hidden
const tree = challenges[2];

describe("entryPointOf", () => {
  it("finds the function of every challenge", () => {
    expect(challenges.map(entryPointOf)).toEqual(["twoSum", "isValid", "levelOrder"]);
  });

  it("refuses a challenge with no function to complete", () => {
    expect(() => entryPointOf({ starterCode: "const x = 1" })).toThrow(/no function/);
  });
});

describe("toSandboxTests", () => {
  it("maps every test, and only the asked ones", () => {
    expect(toSandboxTests(twoSum)).toHaveLength(4);
    expect(toSandboxTests(twoSum, ["2"]).map((t) => t.id)).toEqual(["2"]);
    expect(toSandboxTests(twoSum, [])).toEqual([]);
  });

  it("carries the tree adapter of the challenge that needs it, and no other", () => {
    expect(toSandboxTests(tree).every((t) => "adapter" in t && t.adapter === "tree")).toBe(true);
    expect(toSandboxTests(twoSum).some((t) => "adapter" in t)).toBe(false);
  });
});

describe("visibleTest", () => {
  it("shows a visible test and hides a hidden one", () => {
    expect(visibleTest(twoSum.testCases[0])).toEqual({ input: "[2,7,11,15], 9", expectedOutput: "[0,1]" });
    expect(visibleTest(twoSum.testCases[2])).toEqual({ input: "Hidden test", expectedOutput: "Hidden test" });
  });
});

describe("toSubmissionResult", () => {
  const sandbox = (results: SandboxResult["results"], extra: Partial<SandboxResult> = {}): SandboxResult => ({
    passed: results.length > 0 && results.every((r) => r.passed),
    timedOut: false,
    logs: [],
    totalMs: 9,
    results,
    ...extra,
  });
  const r = (id: string, passed: boolean, actual = "[0,1]", error?: string) => ({ id, passed, actual, expected: "[0,1]", timeMs: 3, ...(error ? { error } : {}) });

  it("counts the tests passed out of all the tests of the challenge", () => {
    const result = toSubmissionResult(twoSum, sandbox([r("1", true), r("2", false, "[9]")]));

    expect(result).toMatchObject({ passed: false, testCasesPassed: 1, totalTestCases: 4, executionTime: 6 });
  });

  it("never reveals what a hidden test returned: it could be the expected value", () => {
    const result = toSubmissionResult(twoSum, sandbox([r("3", false, "[1,1]", "Error: boom"), r("4", true, "[2,4]")]));

    expect(result.detailedResults[0]).toMatchObject({ testCaseId: "3", passed: false, actual: "Failed" });
    expect(result.detailedResults[0].error).toBeUndefined();
    expect(result.detailedResults[1]).toMatchObject({ testCaseId: "4", passed: true, actual: "Passed" });
  });

  it("keeps what a visible test returned, and its error", () => {
    const result = toSubmissionResult(twoSum, sandbox([r("1", false, "TypeError: x is not a function", "TypeError: x is not a function")]));

    expect(result.detailedResults[0]).toMatchObject({ actual: "TypeError: x is not a function", error: "TypeError: x is not a function" });
  });

  it("passes the compile error, the timeout and the logs on", () => {
    const result = toSubmissionResult(twoSum, sandbox([], { compileError: "SyntaxError: x", timedOut: true, logs: ["a"] }));

    expect(result).toMatchObject({ passed: false, compileError: "SyntaxError: x", timedOut: true, logs: ["a"], testCasesPassed: 0 });
  });
});

describe("challengeStats", () => {
  it("is all zeros for a learner who did nothing, and lists every category", () => {
    const stats = challengeStats(challenges, { challengesCompleted: [], challengeAttempts: {} });

    expect(stats).toMatchObject({ total: 3, solved: 0, attempted: 0, attempts: 0 });
    expect(stats.byCategory).toEqual([
      { category: "Arrays", solved: 0, total: 1 },
      { category: "Stacks", solved: 0, total: 1 },
      { category: "Trees", solved: 0, total: 1 },
    ]);
  });

  it("counts solved, tried and submissions from the real progress", () => {
    const stats = challengeStats(challenges, {
      challengesCompleted: ["1"],
      challengeAttempts: { "1": { attempts: 2 }, "2": { attempts: 3 } },
    });

    expect(stats).toMatchObject({ solved: 1, attempted: 2, attempts: 5 });
    expect(stats.byCategory.find((c) => c.category === "Arrays")).toEqual({ category: "Arrays", solved: 1, total: 1 });
  });

  it("ignores progress about challenges that no longer exist", () => {
    const stats = challengeStats(challenges, {
      challengesCompleted: ["gone"],
      challengeAttempts: { gone: { attempts: 9 } },
    });

    expect(stats).toMatchObject({ solved: 0, attempted: 0, attempts: 0 });
  });
});
