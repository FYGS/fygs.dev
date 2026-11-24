import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SANDBOX_URL,
  SandboxUnavailableError,
  functionNameOf,
  resetSandbox,
  runInSandbox,
  runScriptInSandbox,
} from "@/app/_lib/code-sandbox";

const request = {
  code: "function f(n) { return n; }",
  entry: "f",
  tests: [{ id: "1", input: "1", expected: "1" }],
};

const frame = () => document.querySelector("iframe") as HTMLIFrameElement | null;

/** What the sandbox page does: say it is ready, answer a run */
function say(message: unknown, source: Window | null = frame()!.contentWindow) {
  window.dispatchEvent(new MessageEvent("message", { data: message, source }));
}

/** Waits for the page to post `run` to the (jsdom) frame and returns that message. */
async function nextRun(spy: ReturnType<typeof vi.spyOn>) {
  await vi.waitFor(() => expect(spy).toHaveBeenCalled());
  return spy.mock.calls.at(-1)![0] as { type: string; id: string; nonce: string; code: string; entry: string; timeLimitMs: number };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  resetSandbox();
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("runInSandbox", () => {
  it("embeds the runner in a hidden iframe that can run scripts and nothing else", async () => {
    const run = runInSandbox(request);
    await vi.waitFor(() => expect(frame()).not.toBeNull());

    const iframe = frame()!;
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts"); // in particular: never allow-same-origin
    expect(iframe.getAttribute("src")).toBe(SANDBOX_URL);
    expect(iframe.style.display).toBe("none");
    expect(iframe.getAttribute("aria-hidden")).toBe("true");

    say({ type: "ready" });
    const spy = vi.spyOn(iframe.contentWindow!, "postMessage");
    say({ type: "ready" }); // a second ready changes nothing
    const message = await nextRun(spy);
    say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, results: [{ id: "1", passed: true, actual: "1", expected: "1", timeMs: 1 }], logs: [], totalMs: 3 });
    await run;
  });

  it("sends the code, the entry point, the tests and the time limit; answers with the verdict", async () => {
    const run = runInSandbox({ ...request, timeLimitMs: 2_000 });
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
    say({ type: "ready" });

    const message = await nextRun(spy);
    expect(message).toMatchObject({ type: "run", code: request.code, entry: "f", timeLimitMs: 2_000 });
    expect(spy.mock.calls[0][1]).toBe("*"); // the frame has an opaque origin

    say({
      type: "result",
      id: message.id, nonce: message.nonce,
      timedOut: false,
      results: [
        { id: "1", passed: true, actual: "1", expected: "1", timeMs: 1 },
        { id: "2", passed: true, actual: "2", expected: "2", timeMs: 1 },
      ],
      logs: ["hello"],
      totalMs: 5,
    });

    await expect(run).resolves.toMatchObject({ passed: true, timedOut: false, logs: ["hello"], totalMs: 5 });
  });

  it("is not passed when one test fails, when nothing ran, or when the code does not compile", async () => {
    const verdict = async (extra: Record<string, unknown>) => {
      const run = runInSandbox(request);
      await vi.waitFor(() => expect(frame()).not.toBeNull());
      const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
      say({ type: "ready" });
      const message = await nextRun(spy);
      say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, results: [], logs: [], totalMs: 1, ...extra });
      return run;
    };

    expect((await verdict({ results: [{ id: "1", passed: true }, { id: "2", passed: false }] })).passed).toBe(false);
    expect((await verdict({})).passed).toBe(false);
    const broken = await verdict({ compileError: "SyntaxError: x" });
    expect(broken).toMatchObject({ passed: false, compileError: "SyntaxError: x" });
    expect((await verdict({ timedOut: true, results: [{ id: "1", passed: true }] })).passed).toBe(false);
  });

  it("ignores messages that do not come from the sandbox frame", async () => {
    const run = runInSandbox(request);
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
    say({ type: "ready" });
    const message = await nextRun(spy);

    // another window (an extension, an embedded widget) forging an answer
    say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, results: [{ id: "1", passed: true }], logs: [], totalMs: 1 }, window);
    say({ type: "result", id: "run-999", timedOut: false, results: [], logs: [], totalMs: 1 }); // unknown run
    let settled = false;
    run.then(() => (settled = true), () => (settled = true));
    await Promise.resolve();
    expect(settled).toBe(false);

    say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, results: [{ id: "1", passed: true, actual: "1", expected: "1", timeMs: 1 }], logs: [], totalMs: 1 });
    await expect(run).resolves.toMatchObject({ passed: true });
  });

  it("gives every run its own unguessable nonce, and only accepts an answer that repeats it", async () => {
    const run = runInSandbox(request);
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
    say({ type: "ready" });
    const message = await nextRun(spy);
    expect(message.nonce).toMatch(/^[0-9a-f]{32}$/);

    let settled = false;
    run.then(() => (settled = true), () => (settled = true));
    const forged = { type: "result", id: message.id, timedOut: false, results: [{ id: "1", passed: true }], logs: [], totalMs: 1 };
    say({ ...forged }); // right frame, right run, no nonce
    say({ ...forged, nonce: "0".repeat(32) }); // wrong nonce
    say({ ...forged, nonce: 42 }); // not even a string
    await Promise.resolve();
    expect(settled).toBe(false);

    say({ ...forged, nonce: message.nonce });
    await expect(run).resolves.toMatchObject({ passed: true });
  });

  it("does not reuse a nonce from one run to the next", async () => {
    const nonces: string[] = [];
    for (let i = 0; i < 2; i++) {
      const run = runInSandbox(request);
      await vi.waitFor(() => expect(frame()).not.toBeNull());
      const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
      say({ type: "ready" });
      const message = await nextRun(spy);
      nonces.push(message.nonce);
      say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, results: [{ id: "1", passed: true }], logs: [], totalMs: 1 });
      await run;
      spy.mockRestore();
    }
    expect(new Set(nonces).size).toBe(2);
  });

  it("runs one request at a time, in order", async () => {
    const first = runInSandbox({ ...request, code: "first" });
    const second = runInSandbox({ ...request, code: "second" });
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
    say({ type: "ready" });

    const one = await nextRun(spy);
    expect(one.code).toBe("first");
    expect(spy).toHaveBeenCalledTimes(1); // the second waits

    say({ type: "result", id: one.id, nonce: one.nonce, timedOut: false, results: [{ id: "1", passed: true }], logs: [], totalMs: 1 });
    await first;
    await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    const two = spy.mock.calls[1][0] as { id: string; nonce: string; code: string };
    expect(two.code).toBe("second");
    say({ type: "result", id: two.id, nonce: two.nonce, timedOut: false, results: [{ id: "1", passed: true }], logs: [], totalMs: 1 });
    await second;
  });

  it("gives up on a sandbox that stays silent after its own time limit, and starts a fresh one next time", async () => {
    const run = runInSandbox({ ...request, timeLimitMs: 1_000 });
    const failure = run.catch((error) => error);
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const first = frame()!;
    say({ type: "ready" });

    await vi.advanceTimersByTimeAsync(1_000 + 3_000 + 10);

    const error = await failure;
    expect(error).toBeInstanceOf(SandboxUnavailableError);
    expect(document.body.contains(first)).toBe(false);

    const next = runInSandbox(request);
    next.catch(() => {});
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    expect(frame()).not.toBe(first);
  });

  it("fails when the sandbox page never says it is ready", async () => {
    const run = runInSandbox(request);
    const failure = run.catch((error) => error);
    await vi.waitFor(() => expect(frame()).not.toBeNull());

    await vi.advanceTimersByTimeAsync(10_100);

    expect(await failure).toBeInstanceOf(SandboxUnavailableError);
    expect(frame()).toBeNull();
  });

  it("a failed run does not block the ones queued after it", async () => {
    const failing = runInSandbox({ ...request, timeLimitMs: 500 });
    const failure = failing.catch((error) => error);
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    say({ type: "ready" });
    await vi.advanceTimersByTimeAsync(500 + 3_000 + 10);
    await failure;

    const after = runInSandbox(request);
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
    say({ type: "ready" });
    const message = await nextRun(spy);
    say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, results: [{ id: "1", passed: true }], logs: [], totalMs: 1 });
    await expect(after).resolves.toMatchObject({ passed: true });
  });
});

describe("runScriptInSandbox", () => {
  const answer = async (script: unknown, extra: Record<string, unknown> = {}) => {
    const run = runScriptInSandbox("console.log(1)", 2_000);
    await vi.waitFor(() => expect(frame()).not.toBeNull());
    const spy = vi.spyOn(frame()!.contentWindow!, "postMessage");
    say({ type: "ready" });
    const message = await nextRun(spy);
    expect(message).toMatchObject({ mode: "script", code: "console.log(1)", timeLimitMs: 2_000 });
    say({ type: "result", id: message.id, nonce: message.nonce, timedOut: false, logs: ["1"], totalMs: 2, script, ...extra });
    return run;
  };

  it("returns the logs and the value of a script that ran", async () => {
    expect(await answer({ ok: true, value: "3" })).toMatchObject({ ok: true, value: "3", logs: ["1"], timedOut: false });
  });

  it("returns the error of a script that threw", async () => {
    expect(await answer({ ok: false, error: "TypeError: x" })).toMatchObject({ ok: false, error: "TypeError: x" });
  });

  it("a script that ran out of time is not ok", async () => {
    const result = await answer({ ok: false, error: "Time limit exceeded (2000 ms)" }, { timedOut: true });

    expect(result).toMatchObject({ ok: false, timedOut: true });
    expect(result.error).toContain("Time limit exceeded");
  });
});

describe("functionNameOf", () => {
  it.each([
    ["function twoSum(nums, target) {\n}", "twoSum"],
    ["// note\nfunction  $weird_1 (a) {}", "$weird_1"],
    ["function first() {} function second() {}", "first"],
    ["const f = (a) => a", null],
    ["", null],
  ])("%j -> %s", (code, expected) => {
    expect(functionNameOf(code)).toBe(expected);
  });
});
