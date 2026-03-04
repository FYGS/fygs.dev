/**
 * Python Executor using Pyodide (WebAssembly Python)
 *
 * Loads Pyodide from CDN on first use and caches it.
 * Supports stdout/stderr capture, basic package imports, and async execution.
 */

// Pyodide types (minimal)
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  globals: { get: (key: string) => unknown };
}

declare global {
  interface Window {
    loadPyodide?: (config?: {
      indexURL?: string;
      stdout?: (msg: string) => void;
      stderr?: (msg: string) => void;
    }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

/**
 * Load the Pyodide script tag into the page (once).
 */
function ensurePyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Python execution requires a browser environment"));
      return;
    }

    if (window.loadPyodide) {
      resolve();
      return;
    }

    const existing = document.querySelector("script[data-pyodide]");
    if (existing) {
      // Script is loading — wait for it
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Pyodide")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `${PYODIDE_CDN}pyodide.js`;
    script.setAttribute("data-pyodide", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
    document.head.appendChild(script);
  });
}

/**
 * Get or initialize the Pyodide instance (cached singleton).
 */
async function getPyodide(
  onStdout: (msg: string) => void,
  onStderr: (msg: string) => void,
): Promise<PyodideInterface> {
  if (pyodideInstance) {
    // Re-bind stdout/stderr for this execution
    pyodideInstance.setStdout({ batched: onStdout });
    pyodideInstance.setStderr({ batched: onStderr });
    return pyodideInstance;
  }

  if (pyodideLoading) {
    const instance = await pyodideLoading;
    instance.setStdout({ batched: onStdout });
    instance.setStderr({ batched: onStderr });
    return instance;
  }

  pyodideLoading = (async () => {
    await ensurePyodideScript();

    if (!window.loadPyodide) {
      throw new Error("Pyodide not available after script load");
    }

    const instance = await window.loadPyodide({
      indexURL: PYODIDE_CDN,
      stdout: onStdout,
      stderr: onStderr,
    });

    pyodideInstance = instance;
    return instance;
  })();

  return pyodideLoading;
}

export interface PythonExecutorResult {
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
}

/**
 * Execute Python code using Pyodide (WebAssembly).
 */
export async function executePython(
  code: string,
  timeout = 30000,
): Promise<PythonExecutorResult> {
  const logs: string[] = [];
  const errors: string[] = [];

  try {
    const pyodide = await getPyodide(
      (msg) => logs.push(msg),
      (msg) => errors.push(msg),
    );

    // Auto-install packages referenced in imports
    try {
      await pyodide.loadPackagesFromImports(code);
    } catch {
      // Some packages may not be available — continue anyway
    }

    const result = await Promise.race([
      pyodide.runPythonAsync(code),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Python execution timed out after ${timeout}ms`));
        }, timeout);
      }),
    ]);

    const output =
      result !== undefined && result !== null ? String(result) : "";

    return { success: true, output, logs, errors };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(msg);
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Check if Pyodide is already loaded / cached.
 */
export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}
