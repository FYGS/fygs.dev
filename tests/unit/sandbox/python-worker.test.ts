import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const { pythonWorkerMain } = require(path.resolve(__dirname, "../../../public/sandbox/python-runner.js")) as {
  pythonWorkerMain: () => void;
};

type Port = { postMessage: (m: unknown) => void; onmessage?: (e: { data: unknown }) => void };

function boot(self: Record<string, unknown>) {
  const sent: Array<Record<string, any>> = [];
  const port: Port = { postMessage: (m) => sent.push(JSON.parse(JSON.stringify(m))) };
  vm.runInNewContext(`(${pythonWorkerMain.toString()})()`, { self, console: {}, Promise });
  (self.onmessage as (e: unknown) => void)({ data: { type: "init" }, ports: [port] });
  const run = async (code: string) => {
    sent.length = 0;
    port.onmessage!({ data: { code, assetBase: "/sandbox/pyodide/" } });
    await vi.waitFor(() => expect(sent.length).toBeGreaterThan(0));
    return sent[0];
  };
  return { run, port, sent };
}

function fakePyodide(options: { stdoutLines?: string[]; fail?: string } = {}) {
  const namespaces: object[] = [];
  const instance = {
    globals: {
      get: () => () => {
        const space = { destroy: vi.fn() };
        namespaces.push(space);
        return space;
      },
    },
    loadPackagesFromImports: () => Promise.resolve(),
    runPythonAsync: vi.fn(async (code: string) => {
      if (options.fail) throw new Error(options.fail);
      return code.length;
    }),
  };
  return { instance, namespaces };
}

describe("the Python worker", () => {
  it("answers `unavailable` when the self-hosted runtime is not there, and never reaches for a CDN", async () => {
    const importScripts = vi.fn(() => {
      throw new Error("404");
    });
    const { run } = boot({ importScripts, postMessage: () => {} });
    expect(await run("print(1)")).toEqual({ type: "unavailable" });
    expect(importScripts).toHaveBeenCalledTimes(1);
    expect(importScripts).toHaveBeenCalledWith("/sandbox/pyodide/pyodide.js");
    // the failure is remembered: no new attempt for every run
    expect(await run("print(2)")).toEqual({ type: "unavailable" });
    expect(importScripts).toHaveBeenCalledTimes(1);
  });

  it("runs the program in a fresh namespace each time and destroys it", async () => {
    const { instance, namespaces } = fakePyodide();
    const self: Record<string, unknown> = {
      importScripts: () => {},
      loadPyodide: vi.fn(async () => instance),
      postMessage: () => {},
    };
    const { run } = boot(self);
    expect(await run("x = 1")).toMatchObject({ type: "done", output: "5" });
    expect(await run("print(x)")).toMatchObject({ type: "done" });
    await vi.waitFor(() => expect(namespaces).toHaveLength(2));
    const calls = instance.runPythonAsync.mock.calls;
    expect(calls[0][1].globals).not.toBe(calls[1][1].globals);
    await vi.waitFor(() => expect((namespaces[1] as { destroy: () => void }).destroy).toHaveBeenCalled());
    expect((self.loadPyodide as ReturnType<typeof vi.fn>).mock.calls[0][0].indexURL).toBe("/sandbox/pyodide/");
  });

  it("reports a Python error as a failure with its message", async () => {
    const { instance } = fakePyodide({ fail: "ZeroDivisionError: division by zero" });
    const { run } = boot({ importScripts: () => {}, loadPyodide: async () => instance, postMessage: () => {} });
    expect(await run("1/0")).toMatchObject({ type: "failed", errors: ["ZeroDivisionError: division by zero"] });
  });

  it("caps what a program can print", async () => {
    let stdout: ((text: string) => void) | undefined;
    const { instance } = fakePyodide();
    instance.runPythonAsync = vi.fn(async () => {
      for (let i = 0; i < 1000; i++) stdout!("line " + i);
      stdout!("x".repeat(5000));
      return undefined;
    });
    const { run } = boot({
      importScripts: () => {},
      loadPyodide: async (options: { stdout: (text: string) => void }) => {
        stdout = options.stdout;
        return instance;
      },
      postMessage: () => {},
    });
    const answer = await run("spam()");
    expect(answer.logs.length).toBeLessThanOrEqual(300);
    expect(answer.logs.every((line: string) => line.length <= 2001)).toBe(true);
  });

  it("closes the worker's own messaging so the program cannot speak for the harness", async () => {
    const self: Record<string, any> = { importScripts: () => {}, postMessage: () => "original" };
    const { run } = boot(self);
    expect(self.onmessage).toBeNull();
    expect(() => self.postMessage({ type: "done" })).toThrow();
    // the harness still answers on its private port
    expect(await run("print(1)")).toEqual({ type: "unavailable" });
  });

  it("ignores an init without a port or of the wrong type", () => {
    const self: Record<string, any> = { importScripts: () => {}, postMessage: () => {} };
    vm.runInNewContext(`(${pythonWorkerMain.toString()})()`, { self, console: {} });
    self.onmessage({ data: { type: "init" }, ports: [] });
    self.onmessage({ data: { type: "other" }, ports: [{ postMessage() {} }] });
    expect(typeof self.onmessage).toBe("function");
  });
});
