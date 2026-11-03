/**
 * Python execution (Pyodide, i.e. CPython compiled to WebAssembly) for the playground.
 *
 * The program NEVER runs in the page of the site. It goes to /sandbox/python.html, an iframe with
 * `sandbox="allow-scripts"` (opaque origin: no cookies, storage, DOM or API session of the site) that runs it in a
 * worker it can terminate (public/sandbox/python-runner.js documents the protocol). The runtime is self-hosted under
 * /sandbox/pyodide/ (docs/playground-isolation.md says which files to put there); nothing is loaded from a CDN.
 *
 * Until that runtime is in place `executePython` answers with a clear notice instead of running anything anywhere
 * else: there is no in-page fallback.
 */

import { createSandboxChannel, SandboxUnavailableError } from "./sandbox-channel";

export const PYTHON_SANDBOX_URL = "/sandbox/python.html";
/** The runtime's loader: its presence tells whether the self-hosted runtime has been installed. */
export const PYODIDE_LOADER_URL = "/sandbox/pyodide/pyodide.js";

export const PYTHON_UNAVAILABLE_NOTICE =
  "L'exécution Python est désactivée le temps de l'isolation : le moteur Python n'est pas encore installé sur ce site.";

/** The first run downloads and starts the interpreter: that time is not the program's. */
const FIRST_LOAD_ALLOWANCE_MS = 60_000;
/** The page answers `ready` as soon as it loads (the interpreter is only started by the first run). */
const READY_TIMEOUT_MS = 15_000;

export interface PythonExecutorResult {
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}

interface RawPythonResult {
  type?: string;
  ok?: boolean;
  output?: string;
  logs?: string[];
  errors?: string[];
  timedOut?: boolean;
  unavailable?: boolean;
}

const channel = createSandboxChannel<RawPythonResult>({
  url: PYTHON_SANDBOX_URL,
  title: "Python runner",
  readyTimeoutMs: READY_TIMEOUT_MS,
  notReadyMessage: "Le moteur Python n'a pas démarré",
  silentMessage: "Le moteur Python ne répond plus",
});

/** The interpreter has already been started by an earlier run (so a run only pays for its own time). */
let warm = false;

/** Cap on what comes back from the frame: it is the program's output, i.e. untrusted text. */
function strings(value: unknown, maxItems = 300, maxChars = 2_000): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map((item) => String(item).slice(0, maxChars));
}

/** Execute Python code in the isolated sandbox. */
export async function executePython(code: string, timeout = 30_000): Promise<PythonExecutorResult> {
  try {
    const raw = await channel.request({ code }, timeout + (warm ? 0 : FIRST_LOAD_ALLOWANCE_MS));
    if (raw.unavailable === true) {
      return { success: false, output: "", logs: [], errors: [PYTHON_UNAVAILABLE_NOTICE] };
    }
    if (raw.timedOut === true) {
      warm = false; // the frame dropped its interpreter
      return {
        success: false,
        output: "",
        logs: strings(raw.logs),
        errors: [...strings(raw.errors), `Python execution timed out after ${timeout}ms`],
      };
    }
    warm = true;
    return {
      success: raw.ok === true,
      output: raw.ok === true ? String(raw.output ?? "").slice(0, 10_000) : "",
      logs: strings(raw.logs),
      errors: strings(raw.errors),
    };
  } catch (error) {
    warm = false;
    const message = error instanceof SandboxUnavailableError ? error.message : error instanceof Error ? error.message : String(error);
    return { success: false, output: "", logs: [], errors: [message] };
  }
}

/** Whether the self-hosted runtime is installed (a cheap request to the site itself). */
export async function isPythonAvailable(fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(PYODIDE_LOADER_URL, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

/** Test helper: forget the frame and everything pending. */
export function resetPythonSandbox() {
  channel.reset();
  warm = false;
}
