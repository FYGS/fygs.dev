/**
 * Runs a learner's JavaScript against test cases in the code sandbox.
 *
 * The code never runs in the page: it goes to /sandbox/runner.html, an iframe with
 * `sandbox="allow-scripts"` (no cookies, storage or DOM of the site, no network) that
 * evaluates it in a worker it can terminate (public/sandbox/runner.js, which documents the
 * protocol). The site's CSP forbids eval, which is why `new Function` in a component does
 * not work in production.
 */

import { createSandboxChannel } from "./sandbox-channel";

export type SandboxTest = { id: string } & (
  | {
      /** The arguments of the call, as JavaScript source: `[2,7,11,15], 9` */
      input: string;
      /** The expected result, as JavaScript source: `[0,1]` */
      expected: string;
      /** `tree`: the first argument is a level-order array, hand over the tree it describes */
      adapter?: "tree";
    }
  | {
      /** The source of `(fn) => boolean` */
      check: string;
      expected?: string;
    }
);

export interface SandboxRequest {
  code: string;
  /** Name of the function the learner has to write */
  entry: string;
  tests: SandboxTest[];
  /** Whole run, default 5 s */
  timeLimitMs?: number;
}

export interface SandboxTestResult {
  id: string;
  passed: boolean;
  actual: string;
  expected: string;
  timeMs: number;
  error?: string;
}

export interface SandboxResult {
  /** Every test passed (false when the code does not compile or the time ran out) */
  passed: boolean;
  compileError?: string;
  timedOut: boolean;
  results: SandboxTestResult[];
  logs: string[];
  totalMs: number;
}

export interface SandboxScriptResult {
  /** The code ran to the end without throwing */
  ok: boolean;
  /** What the last expression returned (`return` at the top level), formatted */
  value?: string;
  error?: string;
  timedOut: boolean;
  logs: string[];
  totalMs: number;
}

/** `function twoSum(nums, target) {…}` -> `twoSum`: the first function a piece of code declares */
export function functionNameOf(code: string): string | null {
  return /function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(code)?.[1] ?? null;
}

export { SandboxUnavailableError } from "./sandbox-channel";

export const SANDBOX_URL = "/sandbox/runner.html";
const DEFAULT_TIME_LIMIT_MS = 5_000;

interface RawResult {
  type?: string;
  compileError?: string;
  timedOut?: boolean;
  results?: SandboxTestResult[];
  logs?: string[];
  totalMs?: number;
  script?: { ok: boolean; value?: string; error?: string };
}

const channel = createSandboxChannel<RawResult>({
  url: SANDBOX_URL,
  title: "Code runner",
});

/** Runs the learner's function against the tests. */
export async function runInSandbox(request: SandboxRequest): Promise<SandboxResult> {
  const raw = await channel.request(
    { code: request.code, entry: request.entry, tests: request.tests },
    request.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS,
  );
  const results = raw.results ?? [];
  return {
    compileError: raw.compileError,
    timedOut: raw.timedOut === true,
    results,
    logs: raw.logs ?? [],
    totalMs: raw.totalMs ?? 0,
    passed: !raw.compileError && raw.timedOut !== true && results.length > 0 && results.every((r) => r.passed),
  };
}

/** Runs a piece of code as it is (an editor's "Run" button) and returns what it logged. */
export async function runScriptInSandbox(code: string, timeLimitMs = DEFAULT_TIME_LIMIT_MS): Promise<SandboxScriptResult> {
  const raw = await channel.request({ mode: "script", code }, timeLimitMs);
  const timedOut = raw.timedOut === true;
  return {
    ok: !timedOut && raw.script?.ok === true,
    value: raw.script?.value,
    error: timedOut ? `Time limit exceeded (${timeLimitMs} ms)` : raw.script?.error,
    timedOut,
    logs: raw.logs ?? [],
    totalMs: raw.totalMs ?? 0,
  };
}

/** Test helper: forget the frame and everything pending. */
export function resetSandbox() {
  channel.reset();
}
