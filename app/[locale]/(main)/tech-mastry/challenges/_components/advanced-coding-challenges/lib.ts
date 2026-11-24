import { functionNameOf, runInSandbox, type SandboxResult, type SandboxTest } from "@/app/_lib/code-sandbox";
import type { Challenge, SubmissionResult, TestCase } from "./types";

/** `function twoSum(nums, target) {…}` -> `twoSum`: the function the learner has to write */
export function entryPointOf(challenge: Pick<Challenge, "starterCode">): string {
  const name = functionNameOf(challenge.starterCode);
  if (!name) throw new Error("The starter code of the challenge has no function to complete");
  return name;
}

export function toSandboxTests(challenge: Challenge, only?: string[]): SandboxTest[] {
  return challenge.testCases
    .filter((testCase) => !only || only.includes(testCase.id))
    .map((testCase) => ({
      id: testCase.id,
      input: testCase.input,
      expected: testCase.expectedOutput,
      ...(challenge.adapter ? { adapter: challenge.adapter } : {}),
    }));
}

/** What the learner may see of a test: hidden tests keep their data to themselves. */
export function visibleTest(testCase: TestCase) {
  return testCase.isHidden
    ? { input: "Test masqué", expectedOutput: "Test masqué" }
    : { input: testCase.input, expectedOutput: testCase.expectedOutput };
}

export function toSubmissionResult(challenge: Challenge, outcome: SandboxResult): SubmissionResult {
  const detailedResults = outcome.results.map((result) => {
    const testCase = challenge.testCases.find((candidate) => candidate.id === result.id);
    // a hidden test never reveals the value the function returned either: it could be the expected one
    const hidden = testCase?.isHidden === true;
    return {
      testCaseId: result.id,
      passed: result.passed,
      actual: hidden ? (result.passed ? "Réussi" : "Échoué") : result.actual,
      ...(result.error && !hidden ? { error: result.error } : {}),
      executionTime: result.timeMs,
    };
  });
  return {
    passed: outcome.passed,
    compileError: outcome.compileError,
    timedOut: outcome.timedOut,
    logs: outcome.logs,
    executionTime: detailedResults.reduce((sum, result) => sum + result.executionTime, 0),
    testCasesPassed: detailedResults.filter((result) => result.passed).length,
    totalTestCases: challenge.testCases.length,
    detailedResults,
  };
}

/**
 * Runs the learner's code against the challenge's tests (all of them, or `only` those ids) in the
 * code sandbox. Rejects with a SandboxUnavailableError when the sandbox cannot be reached.
 */
export async function runChallenge(challenge: Challenge, code: string, only?: string[]): Promise<SubmissionResult> {
  const outcome = await runInSandbox({
    code,
    entry: entryPointOf(challenge),
    tests: toSandboxTests(challenge, only),
  });
  return toSubmissionResult(challenge, outcome);
}

export interface ChallengeStats {
  total: number;
  solved: number;
  attempted: number;
  attempts: number;
  byCategory: { category: string; solved: number; total: number }[];
}

/** The learner's own figures, from what they really submitted. */
export function challengeStats(
  challenges: Challenge[],
  progress: {
    challengesCompleted: string[];
    challengeAttempts: Record<string, { attempts: number }>;
  },
): ChallengeStats {
  const categories = new Map<string, { solved: number; total: number }>();
  for (const challenge of challenges) {
    const entry = categories.get(challenge.category) ?? { solved: 0, total: 0 };
    entry.total++;
    if (progress.challengesCompleted.includes(challenge.id)) entry.solved++;
    categories.set(challenge.category, entry);
  }
  const known = challenges.map((challenge) => challenge.id);
  return {
    total: challenges.length,
    solved: challenges.filter((challenge) => progress.challengesCompleted.includes(challenge.id)).length,
    attempted: known.filter((id) => progress.challengeAttempts[id]).length,
    attempts: known.reduce((sum, id) => sum + (progress.challengeAttempts[id]?.attempts ?? 0), 0),
    byCategory: [...categories].map(([category, counts]) => ({ category, ...counts })),
  };
}
