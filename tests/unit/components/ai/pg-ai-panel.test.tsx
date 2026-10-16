import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { jsonResponse, sseResponse } from "./test-utils";

vi.mock("intlayer", () => ({ t: (translation: unknown) => ({ nodeType: "translation", translation }) }));
vi.mock("next-intlayer", async () => {
  const { aiText } = await import("./test-utils");
  return { useIntlayer: () => aiText, useLocale: () => ({ locale: "fr" }) };
});

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

// The store imports the code runners; none of them is needed here
vi.mock("@/app/_lib/code-execution", () => ({ executeCode: vi.fn() }));
vi.mock("@/app/_lib/webcontainer-executor", () => ({
  getWebContainer: vi.fn(),
  isWebContainerSupported: () => false,
  killCurrentProcess: vi.fn(),
  onWebContainerEvent: vi.fn(),
  installDependencies: vi.fn(),
  mountFiles: vi.fn(),
}));

const editor = vi.hoisted(() => ({
  insertAtCursor: vi.fn(),
  replaceSelectionOrFile: vi.fn(),
  getEditorSelection: vi.fn(),
  focusEditor: vi.fn(),
}));
vi.mock("@/app/[locale]/(main)/tech-mastry/playground/_utils/ai-editor", () => editor);

import { PgAiPanel } from "@/app/[locale]/(main)/tech-mastry/playground/_components/pg-ai-panel";
import { usePlaygroundShortcuts } from "@/app/[locale]/(main)/tech-mastry/playground/_hooks/use-playground-shortcuts";
import { usePlaygroundStore } from "@/app/[locale]/(main)/tech-mastry/playground/_stores/playground-store";
import { __resetBackendCache } from "@/components/ai/use-backend-mode";

const fetchMock = vi.fn();
const answer = "Use this:\n\n```js\nconst total = 1 + 2;\nconsole.log(total);\n```\n";

const file = (over: Partial<{ id: string; path: string; content: string; language: string; isEntryPoint: boolean }> = {}) => ({
  id: "f1",
  name: "main.js",
  path: "main.js",
  content: "console.log('hello');",
  language: "javascript",
  ...over,
});

function setStore(over: Record<string, unknown> = {}) {
  const f = file();
  usePlaygroundStore.setState({
    files: [f],
    activeFileId: f.id,
    projectId: "default",
    theme: "vs-dark",
    status: "idle",
    consoleEntries: [],
    aiPanelOpen: true,
    aiAsk: null,
    executeCode: vi.fn().mockResolvedValue(undefined),
    ...over,
  });
}

const input = () => screen.getByLabelText("Your message") as HTMLTextAreaElement;
// The status probe (GET) shares the mock: look at the questions only
const posts = () => fetchMock.mock.calls.filter((c) => c[1]?.method === "POST");
const body = (call = 0) => JSON.parse(posts()[call][1].body);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  __resetBackendCache();
  editor.getEditorSelection.mockReturnValue(null);
  editor.insertAtCursor.mockReturnValue("inserted");
  editor.replaceSelectionOrFile.mockReturnValue("replaced-file");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async (url: string) =>
    url === "/api/ai/assistant" && fetchMock.mock.calls.length === 0 ? jsonResponse(200, { mode: "online" }) : sseResponse(answer),
  );
  setStore();
});

describe("PgAiPanel", () => {
  it("renders docked next to the preview with the quick actions and the file it sees", () => {
    render(<PgAiPanel />);
    expect(screen.getByTestId("pg-ai-panel")).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Explain" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hint" })).toBeInTheDocument();
    expect(screen.getByText(/main\.js/)).toBeInTheDocument();
  });

  it("follows the editor theme", () => {
    setStore({ theme: "vs-light" });
    render(<PgAiPanel />);
    expect(screen.getByTestId("pg-ai-panel")).toHaveClass("light");
  });

  it("asks about the current file and selection, in the UI language, and streams the answer", async () => {
    editor.getEditorSelection.mockReturnValue({ text: "console.log('hello');", startLine: 3, endLine: 3 });
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<PgAiPanel />);

    fireEvent.change(input(), { target: { value: "why?" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    await screen.findByText(/Use this/);

    expect(body()).toMatchObject({ mode: "chat", locale: "fr" });
    expect(body().context).toMatchObject({
      surface: "playground",
      language: "javascript",
      activeFile: { name: "main.js", content: "console.log('hello');" },
      selection: { text: "console.log('hello');", startLine: 3, endLine: 3 },
    });
  });

  it("Insert and Replace call the editor bridge and confirm with an undo hint", async () => {
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "q" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    const insert = await screen.findByRole("button", { name: "Insert" });

    fireEvent.click(insert);
    expect(editor.insertAtCursor).toHaveBeenCalledWith("const total = 1 + 2;\nconsole.log(total);");
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Ctrl+Z"));

    editor.replaceSelectionOrFile.mockReturnValueOnce("replaced-selection");
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(editor.replaceSelectionOrFile).toHaveBeenCalledWith("const total = 1 + 2;\nconsole.log(total);");
    expect(toast.success).toHaveBeenLastCalledWith("Selection replaced. Ctrl+Z to undo.");

    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(toast.success).toHaveBeenLastCalledWith("File replaced. Ctrl+Z to undo.");
  });

  it("tells the learner when there is no editor to apply the code to", async () => {
    editor.insertAtCursor.mockReturnValue(null);
    editor.replaceSelectionOrFile.mockReturnValue(null);
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "q" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    fireEvent.click(await screen.findByRole("button", { name: "Insert" }));
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it("Run executes the snippet through the store without touching the file", async () => {
    const executeCode = vi.fn().mockResolvedValue(undefined);
    const clearConsole = vi.fn();
    setStore({ executeCode, clearConsole });
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "q" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    fireEvent.click(await screen.findByRole("button", { name: "Run" }));

    expect(clearConsole).toHaveBeenCalled();
    expect(executeCode).toHaveBeenCalledWith({ snippet: "const total = 1 + 2;\nconsole.log(total);" });
    expect(usePlaygroundStore.getState().files[0].content).toBe("console.log('hello');");
  });

  it("hides Run for code that is not what the active file runs", async () => {
    setStore({ files: [file({ language: "python", path: "main.py" })] });
    fetchMock.mockImplementation(async () => sseResponse(answer)); // a js block
    const { unmount } = render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "q" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    await screen.findByRole("button", { name: "Insert" });
    expect(screen.queryByRole("button", { name: "Run" })).not.toBeInTheDocument();
    unmount();

    // entry point is another file
    localStorage.clear();
    setStore({ files: [file(), file({ id: "f2", path: "other.js", name: "other.js", isEntryPoint: true })] });
    render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "q" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    await screen.findByRole("button", { name: "Insert" });
    expect(screen.queryByRole("button", { name: "Run" })).not.toBeInTheDocument();
  });

  it("sends the failing run's console output and emphasises Debug", async () => {
    setStore({
      status: "error",
      consoleEntries: [
        { id: "1", type: "info", content: "Running...", timestamp: 1 },
        { id: "2", type: "log", content: "before", timestamp: 2 },
        { id: "3", type: "error", content: "TypeError: x is not a function", timestamp: 3 },
      ],
    });
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<PgAiPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Debug" }));
    await screen.findByText(/Use this/);

    expect(body().mode).toBe("debug");
    expect(body().context.console).toEqual({
      status: "error",
      output: "before\n[error] TypeError: x is not a function",
    });
  });

  it("answers a queued 'Explain this error' request from the console", async () => {
    setStore({ aiPanelOpen: false, status: "error" });
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<PgAiPanel />);
    act(() => usePlaygroundStore.getState().askAi("debug", "Explain this error and help me fix it."));
    await screen.findByText(/Use this/);
    expect(body()).toMatchObject({ mode: "debug" });
    expect(body().messages[0].content).toBe("Explain this error and help me fix it.");
    expect(usePlaygroundStore.getState().aiAsk).toBeNull();
    expect(posts()).toHaveLength(1);
  });

  it("keeps a separate conversation per project", async () => {
    fetchMock.mockImplementation(async () => sseResponse("project A answer"));
    setStore({ projectId: "template-a" });
    const first = render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "question A" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    await screen.findByText("project A answer");
    await waitFor(() => expect(localStorage.getItem("fygs:ai-chats:v1")).toContain("playground:template-a"));
    first.unmount();

    setStore({ projectId: "template-b" });
    render(<PgAiPanel />);
    expect(screen.queryByText("question A")).not.toBeInTheDocument();
    expect(screen.getByTestId("ai-empty")).toBeInTheDocument();
  });

  it("shows the offline badge when the server has no model configured", async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, { mode: "offline" }));
    render(<PgAiPanel />);
    await waitFor(() => expect(screen.getAllByTestId("ai-offline-badge").length).toBeGreaterThan(0));
    expect(fetchMock).toHaveBeenCalledWith("/api/ai/assistant", expect.objectContaining({ cache: "no-store" }));
  });

  it("closes from the header and Escape returns the focus to the editor", () => {
    render(<PgAiPanel />);
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(editor.focusEditor).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Close the assistant" }));
    expect(usePlaygroundStore.getState().aiPanelOpen).toBe(false);
  });

  it("shows a rate-limit error from the server", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse(429, { error: "Too many requests", code: "rate_limited", retryAfter: 30 }, { "retry-after": "30" }),
    );
    render(<PgAiPanel />);
    fireEvent.change(input(), { target: { value: "q" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Please wait before trying again");
    expect(alert).toHaveTextContent("Retry in 30s");
  });
});

describe("Ctrl/Cmd+I shortcut", () => {
  it("asks the playground to open the assistant and does not trigger the browser default", () => {
    renderHook(() => usePlaygroundShortcuts());
    const listener = vi.fn();
    window.addEventListener("pg-open-ai-assistant", listener);

    const ctrl = new KeyboardEvent("keydown", { key: "i", ctrlKey: true, cancelable: true });
    window.dispatchEvent(ctrl);
    const meta = new KeyboardEvent("keydown", { key: "I", metaKey: true, cancelable: true });
    window.dispatchEvent(meta);
    const plain = new KeyboardEvent("keydown", { key: "i", cancelable: true });
    window.dispatchEvent(plain);
    const shift = new KeyboardEvent("keydown", { key: "I", ctrlKey: true, shiftKey: true, cancelable: true });
    window.dispatchEvent(shift);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(ctrl.defaultPrevented).toBe(true);
    expect(meta.defaultPrevented).toBe(true);
    expect(plain.defaultPrevented).toBe(false);
    window.removeEventListener("pg-open-ai-assistant", listener);
  });
});
