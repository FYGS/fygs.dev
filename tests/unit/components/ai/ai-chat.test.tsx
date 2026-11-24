import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AssistantMode } from "@/lib/ai/schema";
import { jsonResponse, controlledSse, sseResponse } from "./test-utils";

// The real `intlayer` package pulls esbuild, which cannot run in jsdom
vi.mock("intlayer", () => ({ t: (translation: unknown) => ({ nodeType: "translation", translation }) }));
vi.mock("next-intlayer", async () => {
  const { aiText } = await import("./test-utils");
  return { useIntlayer: () => aiText, useLocale: () => ({ locale: "en" }) };
});

import { AiChat, formatWait, type Backend } from "@/components/ai/ai-chat";
import { useAiChat } from "@/components/ai/use-ai-chat";
import { CHAT_STORAGE_KEY } from "@/components/ai/chat-storage";

const fetchMock = vi.fn();
const getContext = () => ({
  surface: "playground" as const,
  language: "javascript",
  activeFile: { name: "main.js", content: "console.log(1)" },
});

const codeActions = {
  insert: vi.fn(),
  replace: vi.fn(),
  run: vi.fn(),
  canRun: () => true,
};

function Harness({
  backend = "online",
  scopeKey = "test:one",
  quickModes = ["explain", "debug", "hint"] as AssistantMode[],
  withCodeActions = true,
}: {
  backend?: Backend;
  scopeKey?: string;
  quickModes?: AssistantMode[];
  withCodeActions?: boolean;
}) {
  const chat = useAiChat({
    scopeKey,
    surface: "playground",
    locale: "en",
    getContext,
    fetchImpl: fetchMock as unknown as typeof fetch,
  });
  return (
    <AiChat
      chat={chat}
      variant="playground"
      backend={backend}
      quickModes={quickModes}
      codeActions={withCodeActions ? codeActions : undefined}
    />
  );
}

const input = () => screen.getByLabelText("Your message") as HTMLTextAreaElement;
async function ask(text: string) {
  fireEvent.change(input(), { target: { value: text } });
  fireEvent.keyDown(input(), { key: "Enter" });
}
const sentBody = (call = 0) => JSON.parse(fetchMock.mock.calls[call][1].body);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("AiChat - conversation", () => {
  it("shows an empty state with the quick actions", () => {
    render(<Harness />);
    expect(screen.getByTestId("ai-empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explain" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Debug" })).toBeInTheDocument();
    expect(screen.queryByTestId("ai-offline-badge")).not.toBeInTheDocument();
  });

  it("labels offline mode clearly", () => {
    render(<Harness backend="offline" />);
    const badges = screen.getAllByTestId("ai-offline-badge");
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0]).toHaveTextContent("Offline mode");
    expect(badges[0]).toHaveAttribute("title", expect.stringContaining("not configured"));
  });

  it("streams the answer as it arrives, with a busy state and a skeleton before the first token", async () => {
    const s = controlledSse();
    fetchMock.mockResolvedValue(s.response());
    render(<Harness />);

    await ask("What does this do?");
    expect(screen.getByText("What does this do?")).toBeInTheDocument();
    const log = screen.getByRole("log");
    await waitFor(() => expect(log).toHaveAttribute("aria-busy", "true"));
    expect(screen.getByTestId("ai-skeleton")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();

    act(() => s.meta());
    act(() => s.delta("It prints "));
    await waitFor(() => expect(screen.getByText(/It prints/)).toBeInTheDocument());
    expect(screen.queryByTestId("ai-skeleton")).not.toBeInTheDocument();

    act(() => s.delta("**one**."));
    await waitFor(() => expect(screen.getByText("one").tagName).toBe("STRONG"));

    act(() => s.done());
    await waitFor(() => expect(log).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    // start and end are announced once, not every token
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Answer complete"));
  });

  it("sends the mode, the locale, the current context and the history", async () => {
    fetchMock.mockImplementation(async () => sseResponse("ok"));
    render(<Harness />);

    await ask("first question");
    await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument());
    await ask("second question");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const body = sentBody(1);
    expect(body).toMatchObject({ mode: "chat", locale: "en" });
    expect(body.context.activeFile).toEqual({ name: "main.js", content: "console.log(1)" });
    expect(body.messages.map((m: { role: string }) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(body.messages.at(-1).content).toBe("second question");
  });

  it("quick-action chips send their mode with a localized prompt", async () => {
    fetchMock.mockImplementation(async () => sseResponse("answer"));
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Explain" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(sentBody()).toMatchObject({ mode: "explain" });
    expect(sentBody().messages[0].content).toBe("Explain this code step by step.");
  });

  it("escalates the hint level when hints are requested in a row", async () => {
    fetchMock.mockImplementation(async () => sseResponse("hint"));
    render(<Harness />);
    for (let i = 0; i < 4; i++) {
      await waitFor(() => expect(screen.getAllByRole("button", { name: "Hint" })[0]).toBeEnabled());
      fireEvent.click(screen.getAllByRole("button", { name: "Hint" })[0]);
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(i + 1));
      await waitFor(() => expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "false"));
    }
    expect([0, 1, 2, 3].map((i) => sentBody(i).hintLevel)).toEqual([1, 2, 3, 3]);
  });

  it("Shift+Enter does not send", async () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { value: "draft" } });
    fireEvent.keyDown(input(), { key: "Enter", shiftKey: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("offers follow-up suggestions after an answer and sends them in the same mode", async () => {
    fetchMock.mockImplementation(async () => sseResponse("answer"));
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Explain" }));
    const follow = await screen.findByTestId("ai-followups");
    fireEvent.click(within(follow).getByRole("button", { name: "Give me a simpler example" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(sentBody(1).mode).toBe("explain");
  });
});

describe("AiChat - code blocks", () => {
  const answer = "Try this:\n\n```ts\nconst answer: number = 42;\n```\n";

  it("renders highlighted code with Copy / Insert / Replace / Run", async () => {
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<Harness />);
    await ask("show me");
    await screen.findByText(/answer/);
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insert" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Replace" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Run" })).toBeEnabled();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("calls the host with the exact code of the block", async () => {
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<Harness />);
    await ask("show me");
    await screen.findByRole("button", { name: "Insert" });

    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(codeActions.insert).toHaveBeenCalledWith("const answer: number = 42;");
    expect(codeActions.replace).toHaveBeenCalledWith("const answer: number = 42;");
    expect(codeActions.run).toHaveBeenCalledWith("const answer: number = 42;");
  });

  it("disables the editor actions while the block is still streaming", async () => {
    const s = controlledSse();
    fetchMock.mockResolvedValue(s.response());
    render(<Harness />);
    await ask("show me");
    act(() => s.meta());
    act(() => s.delta("```js\nlet a = 1;\n```"));
    const insert = await screen.findByRole("button", { name: "Insert" });
    expect(insert).toBeDisabled();
    act(() => s.done());
    await waitFor(() => expect(screen.getByRole("button", { name: "Insert" })).toBeEnabled());
  });

  it("has no editor actions when there is no host (lesson)", async () => {
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<Harness withCodeActions={false} />);
    await ask("show me");
    await screen.findByRole("button", { name: "Copy" });
    expect(screen.queryByRole("button", { name: "Insert" })).not.toBeInTheDocument();
  });

  it("copies to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    fetchMock.mockImplementation(async () => sseResponse(answer));
    render(<Harness />);
    await ask("show me");
    fireEvent.click(await screen.findByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("const answer: number = 42;");
    await screen.findByRole("button", { name: "Copied" });
  });
});

describe("AiChat - safety of rendered output", () => {
  it("never turns model output into live HTML or javascript: links", async () => {
    const evil =
      '<img src=x onerror="window.__pwned=1"> <script>window.__pwned=2</script>\n\n[click](javascript:window.__pwned=3)\n\n[ok](https://example.com)';
    fetchMock.mockImplementation(async () => sseResponse(evil));
    const { container } = render(<Harness />);
    await ask("x");
    await screen.findByText("ok");

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    const links = [...container.querySelectorAll("a")];
    for (const a of links) expect(a.getAttribute("href") ?? "").not.toMatch(/^javascript:/i);
    const ok = screen.getByText("ok").closest("a")!;
    expect(ok).toHaveAttribute("href", "https://example.com/");
    // the destination is shown next to the link text, so a label cannot hide where it leads
    expect(ok.parentElement?.textContent).toContain("example.com");
    expect(ok).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined();
  });
});

describe("AiChat - errors", () => {
  it("shows a rate limit message with a countdown and re-enables retry afterwards", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(429, { error: "Too many requests", code: "rate_limited", retryAfter: 1 }, { "retry-after": "1" }),
    );
    fetchMock.mockImplementation(async () => sseResponse("back"));
    render(<Harness />);
    await ask("hello");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("You have asked a lot of questions");
    const retry = within(alert).getByRole("button");
    expect(retry).toBeDisabled();
    expect(retry).toHaveTextContent("Retry in 1s");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();

    await waitFor(() => expect(within(screen.getByRole("alert")).getByRole("button")).toBeEnabled(), { timeout: 3000 });
    fireEvent.click(within(screen.getByRole("alert")).getByRole("button"));
    await screen.findByText("back");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // the retry re-sent the same question, not a duplicate of it
    expect(screen.getAllByText("hello")).toHaveLength(1);
  });

  it.each([
    [503, "busy", "The AI service is busy"],
    [503, "unavailable", "The assistant is unavailable"],
    [504, "timeout", "took too long"],
    [502, "upstream_error", "returned an error"],
    [413, "too_large", "too large to send"],
  ])("maps HTTP %i (%s) to a friendly message", async (status, code, text) => {
    fetchMock.mockResolvedValue(jsonResponse(status, { error: "x", code }));
    render(<Harness />);
    await ask("q");
    expect(await screen.findByRole("alert")).toHaveTextContent(text);
  });

  it("explains a network failure", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<Harness />);
    await ask("q");
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not reach the server");
  });

  it("keeps the partial answer when the stream fails midway, and shows the error", async () => {
    const s = controlledSse();
    fetchMock.mockResolvedValue(s.response());
    render(<Harness />);
    await ask("q");
    act(() => s.meta());
    act(() => s.delta("Partial answer"));
    await screen.findByText(/Partial answer/);
    act(() => s.error("busy"));
    expect(await screen.findByRole("alert")).toHaveTextContent("busy");
    expect(screen.getByText(/Partial answer/)).toBeInTheDocument();
  });
});

describe("AiChat - controls", () => {
  it("stop keeps what was received and marks the answer as stopped", async () => {
    const s = controlledSse();
    fetchMock.mockResolvedValue(s.response());
    render(<Harness />);
    await ask("q");
    act(() => s.meta());
    act(() => s.delta("Half an ans"));
    await screen.findByText(/Half an ans/);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    await screen.findByText("Stopped");
    expect(screen.getByText(/Half an ans/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    expect((fetchMock.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(true);
  });

  it("regenerate answers the same question again without duplicating it", async () => {
    fetchMock.mockImplementationOnce(async () => sseResponse("first take"));
    fetchMock.mockImplementationOnce(async () => sseResponse("second take"));
    render(<Harness />);
    await ask("same question");
    await screen.findByText("first take");
    fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    await screen.findByText("second take");
    expect(screen.queryByText("first take")).not.toBeInTheDocument();
    expect(screen.getAllByText("same question")).toHaveLength(1);
    expect(sentBody(1).messages).toHaveLength(1);
  });

  it("flags a cut answer and offers to continue", async () => {
    fetchMock.mockImplementationOnce(async () => sseResponse("long answer", "online", true));
    fetchMock.mockImplementationOnce(async () => sseResponse("the rest"));
    render(<Harness />);
    await ask("q");
    await screen.findByText(/reached the maximum length/);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText("the rest");
    expect(sentBody(1).messages.at(-1).content).toBe("Continue from where you stopped.");
  });

  it("marks answers produced by the offline analyzer", async () => {
    fetchMock.mockImplementation(async () => sseResponse("static answer", "offline"));
    render(<Harness backend="offline" />);
    await ask("q");
    await screen.findByText("static answer");
    const message = screen.getByTestId("ai-message");
    expect(within(message).getByTestId("ai-offline-badge")).toBeInTheDocument();
  });

  it("clear asks for confirmation, then wipes the conversation and its storage", async () => {
    fetchMock.mockImplementation(async () => sseResponse("answer"));
    render(<Harness />);
    await ask("q");
    await screen.findByText("answer");
    await waitFor(() => expect(localStorage.getItem(CHAT_STORAGE_KEY)).toContain("answer"));

    fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
    fireEvent.click(screen.getByRole("button", { name: /Confirm/ }));
    await waitFor(() => expect(screen.getByTestId("ai-empty")).toBeInTheDocument());
    expect(localStorage.getItem(CHAT_STORAGE_KEY) ?? "{}").not.toContain("test:one");
  });

  it("restores the conversation of a scope after a reload, per scope", async () => {
    fetchMock.mockImplementation(async () => sseResponse("remembered answer"));
    const first = render(<Harness scopeKey="project:a" />);
    await ask("remember me");
    await screen.findByText("remembered answer");
    await waitFor(() => expect(localStorage.getItem(CHAT_STORAGE_KEY)).toContain("remembered answer"));
    first.unmount();

    render(<Harness scopeKey="project:a" />);
    expect(await screen.findByText("remember me")).toBeInTheDocument();
    expect(screen.getByText("remembered answer")).toBeInTheDocument();
    cleanupAndRender("project:b");
    expect(await screen.findByTestId("ai-empty")).toBeInTheDocument();
  });
});

function cleanupAndRender(scopeKey: string) {
  document.body.innerHTML = "";
  return render(<Harness scopeKey={scopeKey} />);
}

describe("formatWait", () => {
  it("counts seconds up to two minutes, then minutes", () => {
    expect(formatWait(45, "s", "min")).toBe("45s");
    expect(formatWait(119, " s", "min")).toBe("119 s");
    expect(formatWait(120, "s", "min")).toBe("2 min");
    expect(formatWait(1171, "s", "min")).toBe("20 min");
  });
});

describe("AiChat - offline follow-ups", () => {
  it("does not suggest follow-ups the offline analyzer could not answer", async () => {
    fetchMock.mockImplementation(async () => sseResponse("static answer", "offline"));
    render(<Harness backend="offline" />);
    await ask("q");
    await screen.findByText("static answer");
    expect(screen.queryByTestId("ai-followups")).not.toBeInTheDocument();
  });
});
