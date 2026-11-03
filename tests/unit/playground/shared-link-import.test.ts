import { compressToEncodedURIComponent } from "lz-string";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ exec: vi.fn(), mount: vi.fn() }));

vi.mock("@/app/_lib/code-execution", () => ({ executeCode: (...a: unknown[]) => h.exec(...a) }));
vi.mock("@/app/_lib/webcontainer-executor", () => ({
  getWebContainer: vi.fn(),
  isWebContainerSupported: () => true,
  killCurrentProcess: vi.fn(),
  onWebContainerEvent: () => () => {},
  installDependencies: vi.fn(),
  mountFiles: (...a: unknown[]) => h.mount(...a),
}));

const encode = (value: unknown) => compressToEncodedURIComponent(JSON.stringify(value));

async function fresh() {
  vi.resetModules();
  const mod = await import("@/app/[locale]/(main)/tech-mastry/playground/_stores/playground-store");
  return mod.usePlaygroundStore;
}

beforeEach(() => {
  h.exec.mockReset();
  h.mount.mockReset();
});

describe("opening a playground link made by someone else", () => {
  it("fills the editor, marks the project as received by link and asks the learner to read it", async () => {
    const store = await fresh();
    store.getState().importFromUrl(encode([{ p: "index.js", c: "console.log(1)", e: true }]));
    const state = store.getState();
    expect(state.projectId).toBe("shared");
    expect(state.files).toHaveLength(1);
    expect(state.files[0]).toMatchObject({ path: "index.js", content: "console.log(1)" });
    expect(state.sharedNotice).toEqual({ kind: "review", files: 1 });
  });

  it("never runs anything by itself", async () => {
    const store = await fresh();
    store.getState().importFromUrl(encode([{ p: "index.js", c: "fetch('/api/me')", e: true }]));
    expect(h.exec).not.toHaveBeenCalled();
    expect(h.mount).not.toHaveBeenCalled();
    expect(store.getState().status).toBe("idle");
  });

  it("refuses a link with a path that leaves the project and keeps the learner's own work", async () => {
    const store = await fresh();
    const before = store.getState().files;
    store.getState().importFromUrl(encode([{ p: "../../x.js", c: "" }]));
    expect(store.getState().files).toBe(before);
    expect(store.getState().sharedNotice).toMatchObject({ kind: "invalid" });
  });

  it("lets the learner dismiss the notice, and loading a template clears it", async () => {
    const store = await fresh();
    store.getState().importFromUrl(encode([{ p: "a.js", c: "" }]));
    store.getState().dismissSharedNotice();
    expect(store.getState().sharedNotice).toBeNull();
    store.getState().importFromUrl(encode([{ p: "a.js", c: "" }]));
    expect(store.getState().sharedNotice).not.toBeNull();
    store.getState().resetPlayground();
    expect(store.getState().sharedNotice).toBeNull();
  });

  it("is not saved with the learner's persisted state", async () => {
    const store = await fresh();
    store.getState().importFromUrl(encode([{ p: "a.js", c: "" }]));
    const saved = JSON.stringify(store.persist?.getOptions().partialize?.(store.getState()) ?? {});
    expect(saved).not.toContain("sharedNotice");
  });
});
