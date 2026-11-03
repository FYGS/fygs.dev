/**
 * The page's side of a code sandbox: a hidden `<iframe sandbox="allow-scripts">` (opaque origin: no cookies, storage or
 * DOM of the site) that runs a learner's code in a worker it can terminate. One channel per sandbox page
 * (/sandbox/runner.html for JavaScript, /sandbox/python.html for Python); both speak the same protocol.
 *
 *   frame  -> page   { type: "ready" }
 *   page   -> frame  { type: "run", id, nonce, timeLimitMs, ...payload }
 *   frame  -> page   { type: "result", id, nonce, ...answer }
 *
 * What makes a message count: it comes from THIS frame's window (`event.source`), it names a run that is waiting
 * (`id`), and it repeats that run's one-time `nonce` (128 random bits, never visible to the learner's code, which lives
 * in a worker two hops away). A forged "result" from any other window, or for any other run, is ignored.
 */

/** The sandbox could not be reached or stopped answering: not the learner's fault. */
export class SandboxUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxUnavailableError";
  }
}

/** How long after its own time limit the sandbox may stay silent before it is considered dead. */
export const WATCHDOG_GRACE_MS = 3_000;
const DEFAULT_READY_TIMEOUT_MS = 10_000;

/** 128 random bits as hex. */
export function newNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface Pending<Result> {
  nonce: string;
  resolve: (result: Result) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface SandboxChannelOptions {
  /** Address of the sandbox page. */
  url: string;
  /** Accessible name of the (hidden) frame. */
  title: string;
  /** How long the frame has to say "ready" (a runtime that downloads something needs longer). */
  readyTimeoutMs?: number;
  /** French message when the frame never became ready. */
  notReadyMessage?: string;
  /** French message when the frame stopped answering. */
  silentMessage?: string;
}

export interface SandboxChannel<Result extends { type?: string }> {
  /** Sends a run and resolves with the frame's answer. Runs are queued: the frame handles one at a time. */
  request(payload: Record<string, unknown>, timeLimitMs: number): Promise<Result>;
  /** Forget the frame and everything pending (used by tests, and after a failure). */
  reset(): void;
}

export function createSandboxChannel<Result extends { type?: string }>(options: SandboxChannelOptions): SandboxChannel<Result> {
  const readyTimeoutMs = options.readyTimeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
  const notReady = options.notReadyMessage ?? "Le moteur d'exécution n'a pas démarré";
  const silent = options.silentMessage ?? "Le moteur d'exécution ne répond plus";

  let frame: HTMLIFrameElement | null = null;
  let ready: Promise<void> | null = null;
  let listening = false;
  let counter = 0;
  let queue: Promise<unknown> = Promise.resolve();
  const pending = new Map<string, Pending<Result>>();

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
    const message = event.data as { type?: unknown; id?: unknown; nonce?: unknown } | null;
    if (!message || message.type !== "result" || typeof message.id !== "string" || typeof message.nonce !== "string") return;

    const entry = pending.get(message.id);
    // The run must be waiting AND the answer must carry its nonce
    if (!entry || entry.nonce !== message.nonce) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    entry.resolve(message as unknown as Result);
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
    element.setAttribute("title", options.title);
    element.setAttribute("aria-hidden", "true");
    element.tabIndex = -1;
    element.style.display = "none";
    element.src = options.url;
    frame = element;

    ready = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        window.removeEventListener("message", onReady);
        destroyFrame(notReady);
        reject(new SandboxUnavailableError(notReady));
      }, readyTimeoutMs);

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

  async function exchange(payload: Record<string, unknown>, limit: number): Promise<Result> {
    await ensureFrame();
    const target = frame;
    if (!target?.contentWindow) throw new SandboxUnavailableError("Le moteur d'exécution est indisponible");

    const id = `run-${++counter}`;
    const nonce = newNonce();

    return new Promise<Result>((resolve, reject) => {
      const timer = setTimeout(() => {
        // the sandbox itself enforces `limit`; silence beyond that means it is gone or frozen
        destroyFrame(silent);
      }, limit + WATCHDOG_GRACE_MS);
      pending.set(id, { nonce, resolve, reject, timer });

      target.contentWindow!.postMessage(
        { type: "run", id, nonce, ...payload, timeLimitMs: limit },
        "*", // the frame's origin is opaque: "*" is the only possible target, the reply is checked by `source`
      );
    });
  }

  return {
    request(payload, timeLimitMs) {
      const run = queue.then(() => exchange(payload, timeLimitMs));
      queue = run.catch(() => {});
      return run;
    },
    reset() {
      destroyFrame("reset");
      if (listening && typeof window !== "undefined") window.removeEventListener("message", onMessage);
      listening = false;
      counter = 0;
      queue = Promise.resolve();
    },
  };
}
