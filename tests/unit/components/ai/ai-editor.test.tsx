import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/app/_lib/code-execution", () => ({ executeCode: vi.fn() }));
vi.mock("@/app/_lib/webcontainer-executor", () => ({
  getWebContainer: vi.fn(),
  isWebContainerSupported: () => false,
  killCurrentProcess: vi.fn(),
  onWebContainerEvent: vi.fn(),
  installDependencies: vi.fn(),
  mountFiles: vi.fn(),
}));

// The real module loads Monaco; the bridge only needs the shared editor reference
const ref = vi.hoisted(() => ({ globalEditorRef: { current: null as unknown } }));
vi.mock("@/app/[locale]/(main)/tech-mastry/playground/_components/pg-code-editor", () => ref);

import {
  getEditorSelection,
  insertAtCursor,
  replaceSelectionOrFile,
} from "@/app/[locale]/(main)/tech-mastry/playground/_utils/ai-editor";
import { buildPlaygroundContext, formatConsole } from "@/app/[locale]/(main)/tech-mastry/playground/_utils/ai-context";
import { usePlaygroundStore } from "@/app/[locale]/(main)/tech-mastry/playground/_stores/playground-store";

interface Sel {
  isEmpty: () => boolean;
  startLineNumber: number;
  endLineNumber: number;
  getEndPosition: () => { lineNumber: number; column: number };
}

function fakeEditor(opts: { selection?: Sel | null; position?: { lineNumber: number; column: number }; selected?: string } = {}) {
  const calls: string[] = [];
  const edits: unknown[] = [];
  const fullRange = { startLineNumber: 1, startColumn: 1, endLineNumber: 9, endColumn: 4 };
  const editor = {
    getModel: () => ({ getValueInRange: () => opts.selected ?? "", getFullModelRange: () => fullRange }),
    getSelection: () => opts.selection ?? null,
    getPosition: () => opts.position ?? { lineNumber: 2, column: 5 },
    pushUndoStop: vi.fn(() => calls.push("undo-stop")),
    executeEdits: vi.fn((source: string, e: unknown[]) => {
      calls.push("edit");
      edits.push(...e);
    }),
    focus: vi.fn(),
  };
  return { editor, calls, edits, fullRange };
}

const selection = (startLine: number, endLine: number): Sel => ({
  isEmpty: () => false,
  startLineNumber: startLine,
  endLineNumber: endLine,
  getEndPosition: () => ({ lineNumber: endLine, column: 10 }),
});

beforeEach(() => {
  ref.globalEditorRef.current = null;
  usePlaygroundStore.setState({
    files: [{ id: "f1", name: "a.js", path: "a.js", content: "old", language: "javascript" }],
    activeFileId: "f1",
    consoleEntries: [],
    status: "idle",
  });
});

describe("editor bridge", () => {
  it("replaces the selection between two undo stops, so one Ctrl+Z reverts it", () => {
    const { editor, calls, edits } = fakeEditor({ selection: selection(3, 4), selected: "x" });
    ref.globalEditorRef.current = editor;
    expect(replaceSelectionOrFile("new code")).toBe("replaced-selection");
    expect(calls).toEqual(["undo-stop", "edit", "undo-stop"]);
    expect(edits).toEqual([expect.objectContaining({ text: "new code", range: expect.objectContaining({ startLineNumber: 3, endLineNumber: 4 }) })]);
    expect(editor.focus).toHaveBeenCalled();
  });

  it("replaces the whole file when nothing is selected", () => {
    const { editor, edits, fullRange } = fakeEditor();
    ref.globalEditorRef.current = editor;
    expect(replaceSelectionOrFile("whole")).toBe("replaced-file");
    expect(edits).toEqual([expect.objectContaining({ range: fullRange, text: "whole" })]);
  });

  it("an empty selection counts as no selection", () => {
    const { editor } = fakeEditor({ selection: { ...selection(1, 1), isEmpty: () => true } });
    ref.globalEditorRef.current = editor;
    expect(replaceSelectionOrFile("x")).toBe("replaced-file");
  });

  it("inserts at the cursor, or after the selection", () => {
    const a = fakeEditor({ position: { lineNumber: 7, column: 2 } });
    ref.globalEditorRef.current = a.editor;
    expect(insertAtCursor("snippet")).toBe("inserted");
    expect(a.edits).toEqual([
      expect.objectContaining({
        text: "snippet",
        range: { startLineNumber: 7, startColumn: 2, endLineNumber: 7, endColumn: 2 },
      }),
    ]);

    const b = fakeEditor({ selection: selection(3, 5) });
    ref.globalEditorRef.current = b.editor;
    insertAtCursor("after");
    expect(b.edits).toEqual([
      expect.objectContaining({ range: { startLineNumber: 5, startColumn: 10, endLineNumber: 5, endColumn: 10 } }),
    ]);
  });

  it("without a mounted editor: insert reports failure, replace goes through the store", () => {
    expect(insertAtCursor("x")).toBeNull();
    expect(replaceSelectionOrFile("fresh")).toBe("replaced-file");
    expect(usePlaygroundStore.getState().files[0].content).toBe("fresh");
  });

  it("reads the selection with its line range, ignoring blank selections", () => {
    ref.globalEditorRef.current = fakeEditor({ selection: selection(2, 4), selected: "foo()" }).editor;
    expect(getEditorSelection()).toEqual({ text: "foo()", startLine: 2, endLine: 4 });
    ref.globalEditorRef.current = fakeEditor({ selection: selection(2, 4), selected: "  \n " }).editor;
    expect(getEditorSelection()).toBeNull();
    ref.globalEditorRef.current = null;
    expect(getEditorSelection()).toBeNull();
  });
});

describe("playground context", () => {
  it("collects the active file, the other files' heads and the console", () => {
    usePlaygroundStore.setState({
      files: [
        { id: "f1", name: "a.js", path: "src/a.js", content: "A".repeat(100), language: "javascript" },
        { id: "f2", name: "b.js", path: "src/b.js", content: "B".repeat(5000), language: "javascript" },
      ],
      activeFileId: "f1",
      status: "error",
      consoleEntries: [{ id: "1", type: "error", content: "ReferenceError: nope", timestamp: 1, count: 3 }],
    });
    const ctx = buildPlaygroundContext();
    expect(ctx.activeFile).toEqual({ name: "src/a.js", content: "A".repeat(100) });
    expect(ctx.otherFiles).toEqual([{ name: "src/b.js", content: "B".repeat(600) }]);
    expect(ctx.console).toEqual({ status: "error", output: "[error] ReferenceError: nope (x3)" });
    expect(ctx.language).toBe("javascript");
  });

  it("formatConsole drops noise and keeps the tail within the cap", () => {
    const entries = [
      { id: "i", type: "info" as const, content: "Running...", timestamp: 0 },
      ...Array.from({ length: 300 }, (_, i) => ({ id: String(i), type: "log" as const, content: `line ${i} ${"x".repeat(200)}`, timestamp: i })),
    ];
    const out = formatConsole(entries);
    expect(out).not.toContain("Running...");
    expect(out.length).toBeLessThanOrEqual(20_000);
    expect(out).toContain("line 299");
    expect(out).not.toContain("line 10 ");
  });
});
