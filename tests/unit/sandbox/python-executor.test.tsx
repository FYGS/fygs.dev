import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PYODIDE_LOADER_URL,
  PYTHON_SANDBOX_URL,
  PYTHON_UNAVAILABLE_NOTICE,
  executePython,
  isPythonAvailable,
  resetPythonSandbox,
} from "@/app/_lib/python-executor";

const frame = () => document.querySelector("iframe") as HTMLIFrameElement | null;
const say = (message: unknown) =>
  window.dispatchEvent(new MessageEvent("message", { data: message, source: frame()!.contentWindow }));

async function nextRun() {
  await vi.waitFor(() => expect(frame()).not.toBeNull());
  const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
  say({ type: "ready" });
  await vi.waitFor(() => expect(spy).toHaveBeenCalled());
  return spy.mock.calls.at(-1)![0] as { type: string; id: string; nonce: string; code: string };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  resetPythonSandbox();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("executePython", () => {
  it("runs the program in the sandbox page, never in the site's page", async () => {
    const run = executePython("print(1)");
    const message = await nextRun();
    const iframe = frame()!;
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts");
    expect(iframe.getAttribute("src")).toBe(PYTHON_SANDBOX_URL);
    expect(message).toMatchObject({ type: "run", code: "print(1)" });
    expect(message.nonce).toMatch(/^[0-9a-f]{32}$/);
    expect((window as unknown as { loadPyodide?: unknown }).loadPyodide).toBeUndefined();
    expect(document.querySelector("script[src*='pyodide']")).toBeNull();

    say({ type: "result", id: message.id, nonce: message.nonce, ok: true, output: "42", logs: ["1"], errors: [] });
    expect(await run).toEqual({ success: true, output: "42", logs: ["1"], errors: [] });
  });

  it("says plainly that Python is switched off while the runtime is not installed", async () => {
    const run = executePython("print(1)");
    const message = await nextRun();
    say({ type: "result", id: message.id, nonce: message.nonce, ok: false, unavailable: true });
    const result = await run;
    expect(result).toMatchObject({ success: false, output: "" });
    expect(result.errors).toEqual([PYTHON_UNAVAILABLE_NOTICE]);
  });

  it("ignores an answer that carries another nonce", async () => {
    const run = executePython("print(1)");
    const message = await nextRun();
    say({ type: "result", id: message.id, nonce: "0".repeat(32), ok: true, output: "forged", logs: [], errors: [] });
    say({ type: "result", id: message.id, nonce: message.nonce, ok: true, output: "real", logs: [], errors: [] });
    expect((await run).output).toBe("real");
  });

  it("bounds what comes back from the frame", async () => {
    const run = executePython("spam()");
    const message = await nextRun();
    say({
      type: "result",
      id: message.id,
      nonce: message.nonce,
      ok: true,
      output: "x".repeat(50_000),
      logs: Array.from({ length: 1000 }, () => "y".repeat(10_000)),
      errors: [],
    });
    const result = await run;
    expect(result.output.length).toBeLessThanOrEqual(10_000);
    expect(result.logs.length).toBeLessThanOrEqual(300);
    expect(result.logs[0].length).toBeLessThanOrEqual(2_000);
  });

  it("reports a timeout", async () => {
    const run = executePython("while True: pass");
    const message = await nextRun();
    say({ type: "result", id: message.id, nonce: message.nonce, ok: false, timedOut: true, logs: [], errors: [] });
    const result = await run;
    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toContain("timed out");
  });
});

describe("isPythonAvailable", () => {
  it("asks the site whether the runtime files are installed", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    expect(await isPythonAvailable(fetchImpl as unknown as typeof fetch)).toBe(true);
    expect(fetchImpl.mock.calls[0][0]).toBe(PYODIDE_LOADER_URL);
    expect(await isPythonAvailable(vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch)).toBe(false);
    expect(await isPythonAvailable(vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch)).toBe(false);
  });
});
