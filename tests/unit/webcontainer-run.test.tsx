/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── A fake WebContainer ───────────────────────────────────────────────────────
interface FakeProcess {
  output: ReadableStream<string>;
  exit: Promise<number>;
  kill: ReturnType<typeof vi.fn>;
}

const fake = vi.hoisted(() => ({
  serverReadyHandlers: [] as ((port: number, url: string) => void)[],
  next: null as null | (() => FakeProcess),
  spawn: vi.fn(),
}));

function finishingProcess(chunks: string[], exitCode = 0): FakeProcess {
  return {
    output: new ReadableStream<string>({
      start(controller) {
        chunks.forEach((c) => controller.enqueue(c));
        controller.close();
      },
    }),
    exit: Promise.resolve(exitCode),
    kill: vi.fn(),
  };
}

/** A process that only ends when it is killed (infinite loop, or a server). */
function endlessProcess(chunks: string[] = []): FakeProcess {
  let stop: (code: number) => void = () => {};
  let close: () => void = () => {};
  const exit = new Promise<number>((resolve) => {
    stop = resolve;
  });
  const output = new ReadableStream<string>({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(c));
      close = () => controller.close();
    },
  });
  const kill = vi.fn(() => {
    close();
    stop(137);
  });
  return { output, exit, kill };
}

vi.mock("@webcontainer/api", () => ({
  WebContainer: {
    boot: vi.fn(async () => ({
      on: (event: string, handler: (port: number, url: string) => void) => {
        if (event === "server-ready") fake.serverReadyHandlers.push(handler);
      },
      spawn: fake.spawn,
      mount: vi.fn(),
    })),
  },
}));

type Executor = typeof import("@/app/_lib/webcontainer-executor");
let executor: Executor;

beforeEach(async () => {
  vi.resetModules();
  fake.serverReadyHandlers.length = 0;
  fake.spawn.mockReset();
  executor = await import("@/app/_lib/webcontainer-executor");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("runCommand", () => {
  it("returns the program's output (CRLF lines included)", async () => {
    fake.spawn.mockResolvedValue(finishingProcess(["Hello\r\n", "World\r\n"]));
    const result = await executor.runCommand("node", ["index.js"]);
    expect(result.success).toBe(true);
    expect(result.logs).toEqual(["Hello", "World"]);
    expect(result.errors).toEqual([]);
  });

  it("reports a non-zero exit code", async () => {
    fake.spawn.mockResolvedValue(finishingProcess(["oops\r\n"], 1));
    const result = await executor.runCommand("node", ["index.js"]);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(["Process exited with code 1"]);
  });

  it("kills a program that never finishes and says why", async () => {
    vi.useFakeTimers();
    const process = endlessProcess(["start\r\n"]);
    fake.spawn.mockResolvedValue(process);
    const pending = executor.runCommand("node", ["index.js"], { timeout: 5000 });
    await vi.advanceTimersByTimeAsync(5001);
    const result = await pending;
    expect(process.kill).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.logs).toEqual(["start"]);
    expect(result.errors[0]).toMatch(/stopped after 5s.*infinite loop/);
  });

  it("does not kill a dev server: the run completes when the server is ready", async () => {
    vi.useFakeTimers();
    const server = endlessProcess(["listening\r\n"]);
    fake.spawn.mockImplementation(async () => {
      // the server announces its port shortly after starting
      setTimeout(() => fake.serverReadyHandlers.forEach((h) => h(3111, "https://app--3111.example")), 1000);
      return server;
    });
    const pending = executor.runCommand("npm", ["run", "start"], { timeout: 5000 });
    await vi.advanceTimersByTimeAsync(1001);
    const result = await pending;
    expect(result.success).toBe(true);
    expect(result.serverUrl).toBe("https://app--3111.example");

    // well past the timeout, the server is still alive
    await vi.advanceTimersByTimeAsync(120_000);
    expect(server.kill).not.toHaveBeenCalled();
  });

  it("Stop still kills a running server", async () => {
    vi.useFakeTimers();
    const server = endlessProcess();
    fake.spawn.mockImplementation(async () => {
      setTimeout(() => fake.serverReadyHandlers.forEach((h) => h(3111, "https://app--3111.example")), 100);
      return server;
    });
    const pending = executor.runCommand("npm", ["run", "start"]);
    await vi.advanceTimersByTimeAsync(101);
    await pending;
    executor.killCurrentProcess();
    expect(server.kill).toHaveBeenCalledTimes(1);
  });

  it("shows the user's file name in traces and hides container internals", async () => {
    const trace = [
      "/home/abc123-xyz/index.js:2",
      "throw new Error('boom');",
      "Error: boom",
      "    at Object.eval (/home/abc123-xyz/index.js:2:7)",
      "    at Module._compile (node:internal/modules/cjs/loader:160:19302)",
      "    at internal/main/run_main_module (node:internal/main/run_main_module:155:484)",
      "",
      "Node.js v22.22.3",
    ].join("\r\n");
    fake.spawn.mockResolvedValue(finishingProcess([trace], 1));
    const result = await executor.executeInWebContainer({ "index.js": "x" }, "index.js", {
      displayNames: { "index.js": "index.ts" },
    });
    const shown = result.logs.join("\n");
    expect(shown).toContain("Error: boom");
    expect(shown).toContain("index.ts:2");
    expect(shown).not.toContain("/home/");
    expect(shown).not.toContain("node:internal");
    expect(shown).not.toContain("Node.js v22");
  });
});

describe("cleanProcessOutput", () => {
  it("keeps the user's own stack frames", () => {
    expect(
      executor.cleanProcessOutput("Error: x\n    at greet (/home/abc/app.js:3:9)\n    at node:internal/main:1:1"),
    ).toBe("Error: x\n    at greet (app.js:3:9)");
  });

  it("only renames whole file names", () => {
    const out = executor.cleanProcessOutput("see index.js and myindex.js and index.json", {
      "index.js": "index.ts",
    });
    expect(out).toBe("see index.ts and myindex.js and index.json");
  });

  it("leaves ordinary output untouched", () => {
    expect(executor.cleanProcessOutput("Hello, World!")).toBe("Hello, World!");
  });
});
