/**
 * WebContainer Executor — Real Node.js execution in the browser via WASM.
 *
 * Uses @webcontainer/api (StackBlitz) to provide:
 * - Real Node.js runtime
 * - Real npm install with actual package resolution
 * - Real filesystem API
 * - Process spawning & server preview
 * - Full isolation (sandboxed)
 */

import {
  WebContainer,
  type FileSystemTree,
  type WebContainerProcess,
} from "@webcontainer/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WebContainerExecutionResult {
  success: boolean;
  output: string;
  logs: string[];
  errors: string[];
  serverUrl?: string; // URL if a dev server was started
}

export type WebContainerStatus =
  | "idle"
  | "booting"
  | "ready"
  | "installing"
  | "running"
  | "error";

export type WebContainerListener = (event: WebContainerEvent) => void;

export interface WebContainerEvent {
  type: "status" | "log" | "error" | "server-ready" | "port";
  message?: string;
  status?: WebContainerStatus;
  url?: string;
  port?: number;
}

// ─── Singleton Manager ───────────────────────────────────────────────────────

let _instance: WebContainer | null = null;
let _bootPromise: Promise<WebContainer> | null = null;
let _status: WebContainerStatus = "idle";
let _currentProcess: WebContainerProcess | null = null;
let _serverUrl: string | null = null;
const _listeners: Set<WebContainerListener> = new Set();

/**
 * Strip ANSI escape codes and terminal control characters from text.
 * npm/node produce colored output, progress bars, and cursor movements
 * that appear as garbled characters in a plain text console.
 */
export function stripAnsi(text: string): string {
  // Remove ANSI CSI sequences (colors, cursor commands, etc.)
  // eslint-disable-next-line no-control-regex
  let clean = text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><~]/g,
    "",
  );
  // Remove OSC sequences (title setting, etc.)
  clean = clean.replace(/\x1b\][^\x07]*\x07/g, "");
  // Windows-style line endings are plain newlines, not overwrites. Programs in
  // the container write "\r\n"; treating the trailing "\r" as an overwrite kept
  // the (empty) text after it and erased every line of program output.
  clean = clean.replace(/\r\n/g, "\n");
  // A bare "\r" moves the cursor to the start of the line (npm progress bars):
  // the visible text is the last non-empty segment.
  clean = clean
    .split("\n")
    .map((line) => {
      if (line.includes("\r")) {
        const parts = line.split("\r").filter((part) => part.length > 0);
        return parts.length > 0 ? parts[parts.length - 1] : "";
      }
      return line;
    })
    .join("\n");
  // Remove remaining control characters (keep \n, \t)
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
  // Remove spinner characters that remain after stripping ANSI (npx progress)
  clean = clean.replace(/^[\\|/\-]\s*$/gm, "");
  // Remove "Ok to proceed?" prompts from npx
  clean = clean.replace(/Ok to proceed\?.*$/gm, "");
  // Collapse multiple blank lines
  clean = clean.replace(/\n{3,}/g, "\n\n");
  return clean.trim();
}

const NODE_INTERNAL_FRAME = /^\s+at\s.*(?:node:|internal\/)/;
const NODE_VERSION_FOOTER = /^Node\.js v\d+\.\d+\.\d+\s*$/;

/**
 * Make process output readable for a learner: drop Node's internal stack frames
 * and version footer, hide the container's home directory, and show the file the
 * user wrote (index.ts) instead of the file that was run (index.js).
 */
export function cleanProcessOutput(
  text: string,
  displayNames: Record<string, string> = {},
): string {
  let out = text.replace(/\/home\/[A-Za-z0-9_-]+\//g, "");
  for (const [from, to] of Object.entries(displayNames)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(?<![\\w./-])${escaped}(?![\\w-])`, "g"), to);
  }
  return out
    .split("\n")
    .filter((line) => !NODE_INTERNAL_FRAME.test(line) && !NODE_VERSION_FOOTER.test(line))
    .join("\n");
}

// Files that were transpiled before running (index.js) mapped back to the
// name in the editor (index.ts), for error messages.
let _displayNames: Record<string, string> = {};

function normalizeChunk(value: string): string {
  return cleanProcessOutput(stripAnsi(value), _displayNames).trim();
}

function emit(event: WebContainerEvent) {
  if (event.status) _status = event.status;
  // Clean log/error messages: strip ANSI codes, skip empty remnants
  if (event.message && (event.type === "log" || event.type === "error")) {
    const cleaned = stripAnsi(event.message).trim();
    if (!cleaned) return; // Skip empty messages (progress bar remnants, etc.)
    event = { ...event, message: cleaned };
  }
  _listeners.forEach((fn) => {
    try {
      fn(event);
    } catch {
      // ignore listener errors
    }
  });
}

/** Subscribe to WebContainer events. Returns unsubscribe function. */
export function onWebContainerEvent(
  listener: WebContainerListener,
): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/** Get current WebContainer status. */
export function getWebContainerStatus(): WebContainerStatus {
  return _status;
}

/** Get current server URL if a dev server is running. */
export function getServerUrl(): string | null {
  return _serverUrl;
}

/**
 * Check if the browser supports WebContainers (requires cross-origin isolation).
 */
export function isWebContainerSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof SharedArrayBuffer !== "undefined";
}

/**
 * Boot or retrieve the singleton WebContainer instance.
 * WebContainers only allow one instance per page.
 */
export async function getWebContainer(): Promise<WebContainer> {
  if (_instance) return _instance;

  if (_bootPromise) return _bootPromise;

  if (!isWebContainerSupported()) {
    throw new Error(
      "WebContainers require Cross-Origin Isolation (SharedArrayBuffer). " +
        "Ensure the page is served with COOP/COEP headers.",
    );
  }

  emit({
    type: "status",
    status: "booting",
    message: "Booting WebContainer...",
  });

  _bootPromise = WebContainer.boot()
    .then((wc) => {
      _instance = wc;
      _bootPromise = null;

      // Listen for server-ready events (e.g., dev servers starting)
      wc.on("server-ready", (port: number, url: string) => {
        _serverUrl = url;
        emit({
          type: "server-ready",
          message: `Server ready on port ${port}`,
          url,
          port,
        });
      });

      wc.on("port", (port: number, type: "open" | "close", url: string) => {
        if (type === "open") {
          _serverUrl = url;
          emit({ type: "port", message: `Port ${port} opened`, url, port });
        } else if (type === "close") {
          if (_serverUrl === url) _serverUrl = null;
          emit({ type: "port", message: `Port ${port} closed`, port });
        }
      });

      emit({ type: "status", status: "ready", message: "WebContainer ready" });
      return wc;
    })
    .catch((err) => {
      _bootPromise = null;
      _instance = null;
      const msg = err instanceof Error ? err.message : String(err);
      emit({ type: "status", status: "error", message: msg });
      throw new Error(`WebContainer boot failed: ${msg}`);
    });

  return _bootPromise;
}

// ─── File System Helpers ─────────────────────────────────────────────────────

/**
 * Convert a flat file map (Record<string, string>) to WebContainer's FileSystemTree.
 * Handles nested directory structures automatically.
 */
export function filesToFileSystemTree(
  files: Record<string, string>,
): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const [filePath, content] of Object.entries(files)) {
    const parts = filePath.split("/");
    let current: FileSystemTree = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // Leaf file
        current[part] = { file: { contents: content } };
      } else {
        // Directory
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const node = current[part];
        if ("directory" in node) {
          current = node.directory;
        }
      }
    }
  }

  return tree;
}

// ─── Core Execution ──────────────────────────────────────────────────────────

/**
 * Mount files into the WebContainer filesystem.
 * This replaces the entire filesystem with the provided files.
 */
export async function mountFiles(files: Record<string, string>): Promise<void> {
  const wc = await getWebContainer();
  const tree = filesToFileSystemTree(files);
  await wc.mount(tree);
}

/**
 * Install npm dependencies using the WebContainer's built-in npm.
 * Requires a package.json to be mounted.
 */
export async function installDependencies(options?: {
  timeout?: number;
}): Promise<WebContainerExecutionResult> {
  const wc = await getWebContainer();
  const logs: string[] = [];
  const errors: string[] = [];
  const timeout = options?.timeout ?? 60000;

  emit({
    type: "status",
    status: "installing",
    message: "Installing dependencies...",
  });
  emit({ type: "log", message: "$ npm install" });

  try {
    const process = await wc.spawn("npm", ["install", "--prefer-offline"]);
    _currentProcess = process;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      process.kill();
    }, timeout);

    // Collect stdout with ANSI stripping
    const stdoutReader = process.output.getReader();
    const readStdout = async () => {
      while (true) {
        const { done, value } = await stdoutReader.read();
        if (done) break;
        const cleaned = normalizeChunk(value);
        if (cleaned) {
          logs.push(cleaned);
          emit({ type: "log", message: cleaned });
        }
      }
    };

    await readStdout();
    const exitCode = await process.exit;
    clearTimeout(timeoutId);
    _currentProcess = null;

    if (timedOut) {
      const errMsg = `npm install timed out after ${timeout / 1000}s`;
      errors.push(errMsg);
      emit({ type: "error", message: errMsg });
      emit({
        type: "status",
        status: "error",
      });
    } else if (exitCode !== 0) {
      const errMsg = `npm install failed with exit code ${exitCode}`;
      errors.push(errMsg);
      emit({ type: "error", message: errMsg });
      emit({ type: "status", status: "error" });
    } else {
      emit({
        type: "status",
        status: "ready",
        message: "Dependencies installed",
      });
    }

    return {
      success: exitCode === 0 && !timedOut,
      output: logs.join("\n"),
      logs,
      errors,
    };
  } catch (error) {
    _currentProcess = null;
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(msg);
    emit({ type: "status", status: "error", message: msg });
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Run a shell command inside the WebContainer.
 *
 * - A command that exits is awaited until it exits, or killed after `timeout`
 *   (a script stuck in an infinite loop must not hang the page).
 * - A dev server never exits: as soon as it reports a port, the run is complete
 *   and the process is left running (Stop kills it). It is NOT killed by the
 *   timeout, which used to switch every preview off after a minute.
 */
export async function runCommand(
  command: string,
  args: string[] = [],
  options?: { timeout?: number; detachOnServer?: boolean },
): Promise<WebContainerExecutionResult> {
  const wc = await getWebContainer();
  const logs: string[] = [];
  const errors: string[] = [];
  const timeout = options?.timeout ?? 30000;
  const detachOnServer = options?.detachOnServer ?? true;

  emit({
    type: "status",
    status: "running",
    message: `Running: ${command} ${args.join(" ")}`,
  });
  emit({ type: "log", message: `$ ${command} ${args.join(" ")}`.trim() });

  try {
    // Listen before spawning so a fast server cannot be missed
    let stopWatching: () => void = () => {};
    const serverReady = new Promise<"server">((resolve) => {
      if (!detachOnServer) return;
      stopWatching = onWebContainerEvent((event) => {
        if (event.type === "server-ready") resolve("server");
      });
    });

    const process = await wc.spawn(command, args);
    _currentProcess = process;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      process.kill();
    }, timeout);

    const reader = process.output.getReader();
    const drain = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const cleaned = normalizeChunk(value);
        if (cleaned) {
          logs.push(cleaned);
          emit({ type: "log", message: cleaned });
        }
      }
    })();

    const first = await Promise.race([drain.then(() => "ended" as const), serverReady]);
    stopWatching();

    if (first === "server") {
      clearTimeout(timeoutId);
      void process.exit.then((code) => {
        if (_currentProcess === process) {
          _currentProcess = null;
          _serverUrl = null;
          emit({ type: "log", message: `Server stopped (exit code ${code})` });
          emit({ type: "status", status: "ready" });
        }
      });
      return {
        success: true,
        output: logs.join("\n"),
        logs,
        errors,
        serverUrl: _serverUrl ?? undefined,
      };
    }

    const exitCode = await process.exit;
    clearTimeout(timeoutId);
    if (_currentProcess === process) _currentProcess = null;

    if (timedOut) {
      const errMsg = `Execution stopped after ${timeout / 1000}s: the program did not finish (infinite loop, or waiting for input?)`;
      errors.push(errMsg);
      emit({ type: "error", message: errMsg });
    } else if (exitCode !== 0) {
      const errMsg = `Process exited with code ${exitCode}`;
      errors.push(errMsg);
      emit({ type: "error", message: errMsg });
    }

    emit({
      type: "status",
      status: errors.length > 0 ? "error" : "ready",
    });

    return {
      success: exitCode === 0 && !timedOut,
      output: logs.join("\n"),
      logs,
      errors,
    };
  } catch (error) {
    _currentProcess = null;
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(msg);
    emit({ type: "status", status: "error", message: msg });
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Start a long-running dev server (e.g., `npm run dev`, `npx vite`).
 * Returns immediately after spawning. Listen for 'server-ready' events for the URL.
 */
export async function startDevServer(
  command: string,
  args: string[] = [],
): Promise<{ process: WebContainerProcess; logs: string[]; errors: string[] }> {
  const wc = await getWebContainer();
  const logs: string[] = [];
  const errors: string[] = [];

  emit({
    type: "status",
    status: "running",
    message: `Starting: ${command} ${args.join(" ")}`,
  });
  emit({ type: "log", message: `$ ${command} ${args.join(" ")}` });

  const process = await wc.spawn(command, args);
  _currentProcess = process;

  // Stream output asynchronously with ANSI stripping
  const reader = process.output.getReader();
  void (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const cleaned = normalizeChunk(value);
      if (cleaned) {
        logs.push(cleaned);
        emit({ type: "log", message: cleaned });
      }
    }
  })();

  // Track exit
  process.exit.then((code) => {
    _currentProcess = null;
    if (code !== 0) {
      errors.push(`Server exited with code ${code}`);
      emit({
        type: "status",
        status: "error",
        message: `Server exited (${code})`,
      });
    }
  });

  return { process, logs, errors };
}

/**
 * Kill the currently running process (if any).
 */
export function killCurrentProcess(): void {
  if (_currentProcess) {
    _currentProcess.kill();
    _currentProcess = null;
    _serverUrl = null;
    emit({ type: "status", status: "ready", message: "Process killed" });
  }
}

/**
 * Tear down the WebContainer instance completely.
 */
export async function teardown(): Promise<void> {
  killCurrentProcess();
  if (_instance) {
    _instance.teardown();
    _instance = null;
    _serverUrl = null;
    _status = "idle";
    emit({ type: "status", status: "idle", message: "WebContainer torn down" });
  }
}

// ─── High-Level Execution Functions ──────────────────────────────────────────

/**
 * Execute a Node.js file or script inside WebContainer.
 * Handles mounting files, installing deps if package.json exists, and running.
 */
export async function executeInWebContainer(
  files: Record<string, string>,
  entryPoint: string,
  options?: {
    installDeps?: boolean;
    /** Limit for running a file with node (default 30s). */
    timeout?: number;
    /** Limit for an npm script before a server is up (default 60s). */
    scriptTimeout?: number;
    runScript?: string;
    /** Executed file name -> name shown to the user (index.js -> index.ts). */
    displayNames?: Record<string, string>;
  },
): Promise<WebContainerExecutionResult> {
  const logs: string[] = [];
  const errors: string[] = [];

  // A previous run's server must not be reported as this run's preview
  _serverUrl = null;
  _displayNames = options?.displayNames ?? {};

  try {
    // 1. Mount files
    emit({ type: "log", message: "Mounting project files..." });
    await mountFiles(files);
    logs.push("Files mounted successfully");

    // 2. Install dependencies if package.json exists and requested
    const hasPackageJson = "package.json" in files;
    const shouldInstall = options?.installDeps !== false && hasPackageJson;

    if (shouldInstall) {
      const installResult = await installDependencies();
      logs.push(...installResult.logs);

      if (!installResult.success) {
        errors.push(...installResult.errors);
        return {
          success: false,
          output: logs.join("\n"),
          logs,
          errors,
        };
      }
    }

    // 3. Run the entry point or script
    if (options?.runScript && hasPackageJson) {
      // Run an npm script (e.g., "dev", "start", "build")
      const scriptResult = await runCommand("npm", ["run", options.runScript], {
        timeout: options?.scriptTimeout ?? 60000,
      });
      logs.push(...scriptResult.logs);
      errors.push(...scriptResult.errors);

      return {
        success: scriptResult.success,
        output: logs.join("\n"),
        logs,
        errors,
        serverUrl: _serverUrl ?? undefined,
      };
    }

    // Always run with node — TS/TSX should be pre-transpiled by the caller
    const result = await runCommand("node", [entryPoint], {
      timeout: options?.timeout ?? 30000,
    });
    logs.push(...result.logs);
    errors.push(...result.errors);

    return {
      success: result.success,
      output: logs.join("\n"),
      logs,
      errors,
      serverUrl: _serverUrl ?? undefined,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(msg);
    return { success: false, output: "", logs, errors };
  }
}

/**
 * Quick execution: Run a single JS file in WebContainer WITHOUT npm install.
 * The caller should transpile TS/JSX/TSX to JS before calling this.
 * This is the fastest path — just mount the file and run with node.
 */
export async function executeQuickRun(
  code: string,
  fileName: string = "index.js",
  options?: { timeout?: number; displayNames?: Record<string, string> },
): Promise<WebContainerExecutionResult> {
  _serverUrl = null;
  _displayNames = options?.displayNames ?? {};
  try {
    await mountFiles({ [fileName]: code });
    return await runCommand("node", [fileName], {
      timeout: options?.timeout ?? 15000,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, output: "", logs: [], errors: [msg] };
  }
}
