/**
 * Runs a learner's JavaScript against test cases in the code sandbox.
 *
 * The code never runs in the page: it goes to /sandbox/runner.html, an iframe with
 * `sandbox="allow-scripts"` (no cookies, storage or DOM of the site, no network) that
 * evaluates it in a worker it can terminate (public/sandbox/runner.js, which documents the
 * protocol). The site's CSP forbids eval, which is why `new Function` in a component does
 * not work in production.
 */

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

/** The sandbox could not be reached or stopped answering: not the learner's fault. */
export class SandboxUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxUnavailableError";
  }
}

export const SANDBOX_URL = "/sandbox/runner.html";
const DEFAULT_TIME_LIMIT_MS = 5_000;
/** How long after its own time limit the sandbox may stay silent before it is considered dead */
const WATCHDOG_GRACE_MS = 3_000;
const READY_TIMEOUT_MS = 10_000;

interface Pending {
  resolve: (result: RawResult) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

let frame: HTMLIFrameElement | null = null;
let ready: Promise<void> | null = null;
let listening = false;
let counter = 0;
let queue: Promise<unknown> = Promise.resolve();
const pending = new Map<string, Pending>();

function destroyFrame(reason: string) {
  frame?.remove();
  frame = null;
  ready = null;
  for (const [id, entry] of pending) {
    clearTimeout(entry.timer);
    entry.reject(new SandboxUnavailableError(reason));
    pending.delete(id);
  }
}

function onMessage(event: MessageEvent) {
  if (!frame || event.source !== frame.contentWindow) return;
  const message = event.data as { type?: string; id?: string } | null;
  if (!message || message.type !== "result" || typeof message.id !== "string") return;

  const entry = pending.get(message.id);
  if (!entry) return;
  pending.delete(message.id);
  clearTimeout(entry.timer);

  entry.resolve(message as unknown as RawResult);
}

function ensureFrame(): Promise<void> {
  if (ready) return ready;
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new SandboxUnavailableError("Le moteur d'exécution n'est disponible que dans le navigateur"));
  }

  if (!listening) {
    window.addEventListener("message", onMessage);
    listening = true;
  }

  const element = document.createElement("iframe");
  element.setAttribute("sandbox", "allow-scripts"); // never allow-same-origin: that would void the sandbox
  element.setAttribute("title", "Code runner");
  element.setAttribute("aria-hidden", "true");
  element.tabIndex = -1;
  element.style.display = "none";
  element.src = SANDBOX_URL;
  frame = element;

  ready = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", onReady);
      destroyFrame("Le moteur d'exécution n'a pas démarré");
      reject(new SandboxUnavailableError("Le moteur d'exécution n'a pas démarré"));
    }, READY_TIMEOUT_MS);

    function onReady(event: MessageEvent) {
      if (event.source !== element.contentWindow || event.data?.type !== "ready") return;
      clearTimeout(timer);
      window.removeEventListener("message", onReady);
      resolve();
    }
    window.addEventListener("message", onReady);
  });
  // a rejection nobody awaits yet must not be reported as unhandled
  ready.catch(() => {});

  document.body.appendChild(element);
  return ready;
}

interface RawResult {
  compileError?: string;
  timedOut?: boolean;
  results?: SandboxTestResult[];
  logs?: string[];
  totalMs?: number;
  script?: { ok: boolean; value?: string; error?: string };
}

async function exchange(
  payload: { mode?: "script"; code: string; entry?: string; tests?: SandboxTest[] },
  limit: number,
): Promise<RawResult> {
  await ensureFrame();
  const target = frame;
  if (!target?.contentWindow) throw new SandboxUnavailableError("Le moteur d'exécution est indisponible");

  const id = `run-${++counter}`;

  return new Promise<RawResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      // the sandbox itself enforces `limit`; silence beyond that means it is gone or frozen
      destroyFrame("Le moteur d'exécution ne répond plus");
    }, limit + WATCHDOG_GRACE_MS);
    pending.set(id, { resolve, reject, timer });

    target.contentWindow!.postMessage(
      { type: "run", id, ...payload, timeLimitMs: limit },
      "*", // the frame's origin is opaque: "*" is the only possible target, the reply is checked by `source`
    );
  });
}

/** Runs are queued: the sandbox handles one at a time. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
}

/** Runs the learner's function against the tests. */
export function runInSandbox(request: SandboxRequest): Promise<SandboxResult> {
  return enqueue(async () => {
    const raw = await exchange(
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
  });
}

/** Runs a piece of code as it is (an editor's "Run" button) and returns what it logged. */
export function runScriptInSandbox(code: string, timeLimitMs = DEFAULT_TIME_LIMIT_MS): Promise<SandboxScriptResult> {
  return enqueue(async () => {
    const raw = await exchange({ mode: "script", code }, timeLimitMs);
    const timedOut = raw.timedOut === true;
    return {
      ok: !timedOut && raw.script?.ok === true,
      value: raw.script?.value,
      error: timedOut ? `Time limit exceeded (${timeLimitMs} ms)` : raw.script?.error,
      timedOut,
      logs: raw.logs ?? [],
      totalMs: raw.totalMs ?? 0,
    };
  });
}

/** Test helper: forget the frame and everything pending. */
export function resetSandbox() {
  destroyFrame("reset");
  if (listening && typeof window !== "undefined") window.removeEventListener("message", onMessage);
  listening = false;
  counter = 0;
  queue = Promise.resolve();
}
