import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { jsonResponse, sseResponse } from "./test-utils";

vi.mock("intlayer", () => ({ t: (translation: unknown) => ({ nodeType: "translation", translation }) }));
vi.mock("next-intlayer", async () => {
  const { aiText } = await import("./test-utils");
  return { useIntlayer: () => aiText, useLocale: () => ({ locale: "en-US" }) };
});

import { LessonAiTutor, buildLessonContext } from "@/components/ai/lesson-ai-tutor";
import { __resetBackendCache } from "@/components/ai/use-backend-mode";

const fetchMock = vi.fn();
const props = {
  lessonId: "lesson-1",
  title: "Closures in JavaScript",
  course: "JavaScript Mastery",
  description: "Understand lexical scope.",
  content: "# Closures\n\nA closure is a function with its environment.",
};
const posts = () => fetchMock.mock.calls.filter((c) => c[1]?.method === "POST");

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  __resetBackendCache();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation(async (_url: string, init?: RequestInit) =>
    init?.method === "POST" ? sseResponse("A closure remembers its scope.") : jsonResponse(200, { mode: "online" }),
  );
});

describe("buildLessonContext", () => {
  it("is built from the props only and stays within the schema caps", () => {
    const ctx = buildLessonContext({ ...props, content: "x".repeat(50_000), description: "d".repeat(500) });
    expect(ctx.surface).toBe("lesson");
    expect(ctx.lesson?.title).toBe("Closures in JavaScript");
    expect(ctx.lesson?.course).toBe("JavaScript Mastery");
    expect(ctx.lesson?.summary?.length).toBeLessThanOrEqual(3000);
    expect(ctx.activeFile).toBeUndefined();
  });
  it("copes with a lesson that has no content or description", () => {
    expect(buildLessonContext({ lessonId: "l", title: "T", content: null, description: null }).lesson).toEqual({
      title: "T",
      course: undefined,
      summary: undefined,
    });
  });
});

describe("LessonAiTutor", () => {
  it("shows the entry point without needing any network call", () => {
    render(<LessonAiTutor {...props} />);
    expect(screen.getByTestId("lesson-ai-trigger")).toHaveTextContent("Ask the AI tutor");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("opens a chat grounded on the lesson and answers in mode=chat", async () => {
    render(<LessonAiTutor {...props} />);
    fireEvent.click(screen.getByTestId("lesson-ai-trigger"));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByText("Closures in JavaScript").length).toBeGreaterThan(0);
    // lessons have no code to act on: starter prompts instead of code quick actions
    fireEvent.click(within(dialog).getByRole("button", { name: "Give me a concrete example" }));
    await screen.findByText("A closure remembers its scope.");

    expect(posts()).toHaveLength(1);
    const body = JSON.parse(posts()[0][1].body);
    expect(body).toMatchObject({ mode: "chat", locale: "en" });
    expect(body.context.surface).toBe("lesson");
    expect(body.context.lesson).toMatchObject({ title: "Closures in JavaScript", course: "JavaScript Mastery" });
    expect(body.context.lesson.summary).toContain("closure is a function");
    expect(body.context.activeFile).toBeUndefined();
    expect(body.messages[0].content).toBe("Give me a concrete example");
  });

  it("has no editor actions on code blocks (Copy only)", async () => {
    fetchMock.mockImplementation(async (_u: string, init?: RequestInit) =>
      init?.method === "POST" ? sseResponse("```js\nconst a = 1;\n```") : jsonResponse(200, { mode: "online" }),
    );
    render(<LessonAiTutor {...props} />);
    fireEvent.click(screen.getByTestId("lesson-ai-trigger"));
    fireEvent.click(await screen.findByRole("button", { name: "Summarize this lesson in 5 points" }));
    await screen.findByRole("button", { name: /Copy/ });
    expect(screen.queryByRole("button", { name: "Insert" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Run" })).not.toBeInTheDocument();
  });

  it("closes from the header", async () => {
    render(<LessonAiTutor {...props} />);
    fireEvent.click(screen.getByTestId("lesson-ai-trigger"));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Close the assistant" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("labels offline mode in the lesson chat too", async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, { mode: "offline" }));
    render(<LessonAiTutor {...props} />);
    fireEvent.click(screen.getByTestId("lesson-ai-trigger"));
    await waitFor(() => expect(screen.getAllByTestId("ai-offline-badge").length).toBeGreaterThan(0));
  });
});
