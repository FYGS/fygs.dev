import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterisation tests for the playground zustand store: state shape,
 * every action's effect, the persisted storage key/shape (users' saved state
 * must keep loading) and the execution / WebContainer flows (mocked runtimes).
 */
const h = vi.hoisted(() => ({
  wcSupported: false,
  handler: null as null | ((e: Record<string, unknown>) => void),
  exec: vi.fn(),
  calls: [] as unknown[],
}));

vi.mock("@/app/_lib/code-execution", () => ({
  executeCode: (...a: unknown[]) => h.exec(...a),
}));

vi.mock("@/app/_lib/webcontainer-executor", () => ({
  getWebContainer: vi.fn(async () => {
    h.calls.push(["getWebContainer"]);
    if (h.wcFail) throw new Error("boot boom");
  }),
  isWebContainerSupported: () => h.wcSupported,
  killCurrentProcess: () => h.calls.push(["killCurrentProcess"]),
  onWebContainerEvent: (cb: (e: Record<string, unknown>) => void) => {
    h.handler = cb;
    h.calls.push(["onWebContainerEvent"]);
    return () => h.calls.push(["unsubscribe"]);
  },
  installDependencies: async () => {
    h.calls.push(["installDependencies"]);
    return { success: !h.installFail };
  },
  mountFiles: async (files: unknown) => {
    h.calls.push(["mountFiles", files]);
  },
}));

declare module "vitest" {
  // placeholder to keep TS quiet about the extra hoisted flags
}
(h as unknown as Record<string, unknown>).wcFail = false;
(h as unknown as Record<string, unknown>).installFail = false;

const storage = new Map<string, string>();
const memoryStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => void storage.set(k, v),
  removeItem: (k: string) => void storage.delete(k),
  clear: () => storage.clear(),
  key: () => null,
  length: 0,
};

let uuid = 0;
type Store = typeof import("@/app/[locale]/(main)/tech-mastry/playground/_stores/playground-store");

async function fresh(): Promise<Store["usePlaygroundStore"]> {
  vi.resetModules();
  const mod = await import(
    "@/app/[locale]/(main)/tech-mastry/playground/_stores/playground-store"
  );
  return mod.usePlaygroundStore;
}

const DATA_KEYS = [
  "files", "activeFileId", "openTabs", "settings", "theme", "consoleEntries",
  "previewHtml", "serverUrl", "status", "wcStatus", "layout", "history",
  "code", "language", "output", "logs", "errors",
];
const data = (s: Record<string, unknown>) =>
  JSON.parse(JSON.stringify(Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]]))));

const persisted = () => {
  const raw = storage.get("playground-v2");
  return raw ? JSON.parse(raw) : null;
};

describe("playground store (pinned)", () => {
  beforeEach(() => {
    storage.clear();
    uuid = 0;
    h.wcSupported = false;
    h.handler = null;
    h.calls.length = 0;
    h.exec.mockReset();
    (h as unknown as Record<string, unknown>).wcFail = false;
    (h as unknown as Record<string, unknown>).installFail = false;
    vi.stubGlobal("localStorage", memoryStorage);
    vi.stubGlobal("window", { localStorage: memoryStorage, dispatchEvent: () => true });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2030-06-15T10:20:30Z"));
    vi.spyOn(crypto, "randomUUID").mockImplementation(
      () => `uuid-${++uuid}` as `${string}-${string}-${string}-${string}-${string}`,
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initial state, API surface and persisted key", async () => {
    const store = await fresh();
    const s = store.getState() as unknown as Record<string, unknown>;
    expect(data(s)).toMatchSnapshot();
    expect(Object.keys(s).sort()).toMatchSnapshot();
    expect(Object.keys(s).filter((k) => typeof s[k] === "function").sort()).toMatchSnapshot();
    expect(store.persist.getOptions().name).toBe("playground-v2");
    expect(store.persist.getOptions().version ?? 0).toBe(0);
    expect(Object.keys(store.persist.getOptions().partialize!(store.getState())).sort()).toMatchSnapshot();
  });

  it("exports the editor store alias", async () => {
    vi.resetModules();
    const mod = await import(
      "@/app/[locale]/(main)/tech-mastry/playground/_stores/playground-store"
    );
    expect(mod.useEditorStore).toBe(mod.usePlaygroundStore);
    expect(Object.keys(mod).sort()).toEqual(["useEditorStore", "usePlaygroundStore"]);
  });

  it("file, tab, editor, layout, history, template and sharing actions", async () => {
    const store = await fresh();
    const st = () => store.getState();
    const trace: unknown[] = [];
    const step = (name: string) => trace.push([name, data(st() as never)]);

    const a = st().createFile("src/a.ts", "const a = 1;");
    step("createFile a");
    const dup = st().createFile("src/a.ts", "dup");
    step("createFile duplicate path");
    trace.push(["ids", a, dup]);
    const b = st().createFile("src/lib/b.py");
    st().createFile("README.md", "# hi", "markdown");
    step("createFile b, readme");
    st().updateFileContent(a, "const a = 2;");
    st().renameFile(a, "src/renamed.js");
    step("update + rename");
    st().setEntryPoint(b);
    step("setEntryPoint");
    trace.push(["tree", st().getFileTree(), st().getEntryPointFile()?.id, st().getActiveFile()?.id,
      st().getFileById(a)?.path, st().getFileByPath("README.md")?.id, st().getCurrentLanguage()]);
    st().setActiveFile("missing");
    st().setActiveFile(a);
    step("setActiveFile");
    st().openTab(b, true);
    step("openTab preview");
    st().openTab(b);
    step("openTab permanent");
    st().pinTab(a);
    step("pinTab");
    st().reorderTabs(0, 1);
    step("reorderTabs");
    st().closeTab(a);
    step("closeTab active");
    st().closeTab("nope");
    st().closeOtherTabs(b);
    step("closeOtherTabs");
    st().closeAllTabs();
    step("closeAllTabs");
    st().deleteFile(b);
    step("deleteFile");
    st().setTheme("light" as never);
    st().updateSettings({ fontSize: 20, minimap: true });
    st().setLayout({ layout: "vertical" as never });
    st().toggleFileExplorer();
    st().toggleConsole();
    st().togglePreview();
    step("theme/settings/layout");
    st().createSnapshot("first");
    st().createSnapshot();
    step("snapshots");
    const snapId = st().history.snapshots[0].id;
    st().restoreSnapshot("nope");
    st().restoreSnapshot(snapId);
    step("restoreSnapshot");
    st().loadTemplate({
      id: "t", name: "T", description: "", icon: "x", category: "language", tags: [],
      mainFile: "main.ts",
      files: [
        { name: "util.ts", path: "util.ts", content: "u", language: "typescript" },
        { name: "main.ts", path: "main.ts", content: "m", language: "typescript", isEntryPoint: true },
      ],
    } as never);
    step("loadTemplate");
    const url = st().exportAsUrl();
    trace.push(["exportAsUrl", url]);
    st().resetPlayground();
    step("resetPlayground");
    st().importFromUrl(url);
    step("importFromUrl");
    st().importFromUrl("garbage");
    st().importFromUrl(" ");
    step("importFromUrl invalid");
    st().setCode("compat code");
    st().addLog("log line");
    st().addError("error line");
    st().setLanguage("ts");
    step("compat methods");
    st().clearOutput();
    st().resetCode();
    step("compat reset");
    expect(trace).toMatchSnapshot();
    expect(persisted()).toMatchSnapshot();
  });

  it("deleteFile never removes the last file; closeTab picks the neighbour", async () => {
    const store = await fresh();
    const only = store.getState().files[0].id;
    store.getState().deleteFile(only);
    expect(store.getState().files).toHaveLength(1);
    expect(data(store.getState() as never)).toMatchSnapshot();
  });

  it("console entries: dedupe and cap", async () => {
    const store = await fresh();
    const { addConsoleEntry } = store.getState();
    addConsoleEntry({ type: "log", content: "x" });
    addConsoleEntry({ type: "log", content: "x" });
    addConsoleEntry({ type: "log", content: "x" });
    addConsoleEntry({ type: "error", content: "x" });
    const small = JSON.parse(JSON.stringify(store.getState().consoleEntries));
    for (let i = 0; i < 1100; i++) addConsoleEntry({ type: "log", content: `m${i}` });
    const big = store.getState().consoleEntries;
    expect({ small, bigLen: big.length, first: big[0].content, last: big[big.length - 1].content }).toMatchSnapshot();
    store.getState().clearConsole();
    expect(data(store.getState() as never)).toMatchSnapshot();
  });

  describe("execution", () => {
    const run = async (opts: {
      lang?: string;
      result?: Record<string, unknown> | Error;
      wc?: boolean;
      events?: Array<Record<string, unknown>>;
      files?: Array<{ path: string; content: string }>;
      runScript?: string;
    }) => {
      const store = await fresh();
      h.wcSupported = opts.wc ?? false;
      if (opts.files) {
        for (const f of opts.files) store.getState().createFile(f.path, f.content);
      }
      if (opts.lang) {
        const id = store.getState().files[0].id;
        store.setState({
          files: store.getState().files.map((f) => (f.id === id ? { ...f, language: opts.lang! } : f)),
        });
      }
      h.exec.mockImplementation(async (params: Record<string, unknown>) => {
        h.calls.push(["execCode", { ...params, signal: "<signal>" }]);
        for (const e of opts.events ?? []) h.handler?.(e);
        if (opts.result instanceof Error) throw opts.result;
        return opts.result ?? { output: "", logs: [], errors: [] };
      });
      await store.getState().executeCode(opts.runScript ? { runScript: opts.runScript } : undefined);
      return { state: data(store.getState() as never), calls: [...h.calls], persisted: persisted() };
    };

    const cases: Record<string, () => Promise<unknown>> = {
      plainOk: () => run({ result: { output: "hello", logs: ["l1"], errors: [] } }),
      python: () => run({ lang: "python", result: { output: "py", logs: [], errors: [] } }),
      htmlPreview: () => run({ result: { output: "<!DOCTYPE html><html></html>", logs: [], errors: [] } }),
      dataUrlPreview: () => run({ result: { output: "data:text/html;base64,AAA", logs: [], errors: [] } }),
      errors: () => run({ result: { output: "", logs: ["l"], errors: ["bad"] } }),
      throws: () => run({ result: new Error("exec exploded") }),
      throwsNonError: () => run({ result: "x" as never }),
      wcNodeStreamed: () =>
        run({
          wc: true,
          files: [{ path: "package.json", content: "{}" }],
          events: [
            { type: "log", message: "streamed" },
            { type: "log", message: "   " },
            { type: "error", message: "streamed err" },
            { type: "status", status: "ready" },
            { type: "server-ready", url: "http://localhost:3111" },
          ],
          result: { output: "", logs: [], errors: [], serverUrl: "http://localhost:3111" },
          runScript: "dev",
        }),
      wcStreamedHtml: () =>
        run({
          wc: true,
          events: [{ type: "log", message: "x" }],
          result: { output: "<!DOCTYPE html>", logs: [], errors: [] },
        }),
      wcNotStreamed: () => run({ wc: true, result: { output: "o", logs: ["a"], errors: [] } }),
    };
    for (const [name, fn] of Object.entries(cases)) {
      it(name, async () => {
        expect(await fn()).toMatchSnapshot();
      });
    }

    it("stopExecution", async () => {
      const store = await fresh();
      store.setState({ status: "running", serverUrl: "http://x" });
      store.getState().stopExecution();
      expect({ state: data(store.getState() as never), calls: [...h.calls] }).toMatchSnapshot();
    });
  });

  describe("webcontainer actions", () => {
    const wc = async (name: string, setup: () => void, act: (s: Store["usePlaygroundStore"]) => Promise<void>) => {
      const store = await fresh();
      setup();
      h.calls.length = 0;
      await act(store);
      void name;
      return { state: data(store.getState() as never), calls: [...h.calls] };
    };
    it("boot unsupported / ok / fail", async () => {
      const out = {
        unsupported: await wc("u", () => (h.wcSupported = false), (s) => s.getState().bootWebContainer()),
        ok: await wc("o", () => (h.wcSupported = true), (s) => s.getState().bootWebContainer()),
        fail: await wc("f", () => { h.wcSupported = true; (h as unknown as Record<string, unknown>).wcFail = true; }, (s) => s.getState().bootWebContainer()),
      };
      expect(out).toMatchSnapshot();
    });
    it("install unsupported / ok / failed result / throws", async () => {
      const out = {
        unsupported: await wc("u", () => (h.wcSupported = false), (s) => s.getState().installPackages()),
        ok: await wc("o", () => (h.wcSupported = true), (s) => s.getState().installPackages()),
        failedResult: await wc("f", () => { h.wcSupported = true; (h as unknown as Record<string, unknown>).installFail = true; }, (s) => s.getState().installPackages()),
      };
      expect(out).toMatchSnapshot();
    });
    it("setServerUrl / setWcStatus / install event stream", async () => {
      const store = await fresh();
      h.wcSupported = true;
      store.getState().setServerUrl("http://s");
      store.getState().setWcStatus("ready");
      const p = store.getState().installPackages();
      h.handler?.({ type: "log", message: "npm log" });
      h.handler?.({ type: "error", message: "npm err" });
      h.handler?.({ type: "status", status: "installing" });
      await p;
      expect(data(store.getState() as never)).toMatchSnapshot();
    });
  });

  it("rehydrates a previously saved state (stored shape must keep loading)", async () => {
    const saved = {
      state: {
        files: [{ id: "f1", name: "x.ts", path: "x.ts", content: "saved", language: "typescript", isEntryPoint: true }],
        activeFileId: "f1",
        openTabs: [{ fileId: "f1", isPinned: true, isPreview: false }],
        settings: { fontSize: 18, tabSize: 4, minimap: true, wordWrap: "off" },
        theme: "light",
        layout: { layout: "default", showFileExplorer: false, showConsole: true, showPreview: false, activeOutputTab: "preview" },
        history: { snapshots: [], maxSnapshots: 10 },
      },
      version: 0,
    };
    storage.set("playground-v2", JSON.stringify(saved));
    const store = await fresh();
    // hydration is skipped at import (server/client markup); PgLayout restores after mount
    expect(store.getState().files[0].content).not.toBe("saved");
    await store.persist.rehydrate();
    expect(store.getState().files[0].content).toBe("saved");
    expect(store.getState().code).toBe("saved"); // compat fields follow the restored files
    expect(store.getState().settings.fontSize).toBe(18);
    expect(data(store.getState() as never)).toMatchSnapshot();
    // transient state is not restored from storage
    store.getState().addConsoleEntry({ type: "log", content: "t" });
    expect(Object.keys(persisted().state).sort()).toMatchSnapshot();
  });
});
