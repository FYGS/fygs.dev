import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/redis", () => ({
  default: {
    eval: () => Promise.reject(new Error("redis unavailable")),
    get: () => Promise.reject(new Error("redis unavailable")),
    setNxEx: () => Promise.reject(new Error("redis unavailable")),
  },
}));

const m = vi.hoisted(() => ({ getSession: vi.fn(), emit: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("@/lib/analytics-helper", () => ({ AnalyticsHelper: { emit: m.emit } }));

import { POST } from "@/app/api/ai/assistant/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { __resetAiBudget, getBudgetUsage } from "@/lib/ai/budget";
import { SseParser } from "@/lib/ai/sse";

const SECRET_CODE = "const topSecretVariableName = 42;";
const QUESTION = "Why is my secretQuestionText failing?";
const KEY = "sk-ant-test-key-1234567890";

const payload = (locale = "en") => ({
  mode: "explain",
  locale,
  messages: [{ role: "user", content: QUESTION }],
  context: { surface: "playground", language: "javascript", activeFile: { name: "main.js", content: SECRET_CODE } },
});

let ip = 0;
const call = (body: unknown = payload(), headers: Record<string, string> = {}) =>
  POST(
    new NextRequest("http://localhost/api/ai/assistant", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${(++ip % 250) + 1}`, ...headers },
    }),
  );

const parse = async (res: Response) => {
  const p = new SseParser();
  const text = await res.text();
  return [...p.push(text), ...p.flush()];
};

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
const upstream = (chunks: string[]) =>
  new Response(
    new ReadableStream({
      start(c) {
        const enc = new TextEncoder();
        for (const ch of chunks) c.enqueue(enc.encode(ch));
        c.close();
      },
    }),
    { status: 200, headers: { "content-type": "text/event-stream" } },
  );
const okStream = (outTokens = 42) =>
  upstream([
    sse("message_start", {
      type: "message_start",
      message: { usage: { input_tokens: 120, output_tokens: 1, cache_read_input_tokens: 7 } },
    }),
    sse("content_block_delta", { type: "content_block_delta", delta: { type: "text_delta", text: "Answer text" } }),
    sse("message_delta", { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: outTokens } }),
    sse("message_stop", { type: "message_stop" }),
  ]);

const fetchMock = vi.fn();
let infoSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
const logged = () => JSON.stringify([infoSpy.mock.calls, errorSpy.mock.calls, warnSpy.mock.calls]);
// The structured logger prints ("[LOG]", { level, message, ...context })
const logCalls = (spy: { mock: { calls: unknown[][] } }, message: string) =>
  spy.mock.calls.filter((c) => (c[1] as { message?: string })?.message === message).map((c) => c[1] as Record<string, any>);

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-16T12:00:00Z"), toFake: ["Date"] });
  __resetRateLimitMemory();
  __resetAiBudget();
  vi.clearAllMocks();
  fetchMock.mockReset();
  infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  m.getSession.mockResolvedValue(null);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("ANTHROPIC_API_KEY", KEY);
  vi.stubEnv("ANTHROPIC_BASE_URL", "http://mock.test");
  vi.stubEnv("AI_MODEL", "mock-model");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("AI tutor - global daily budget", () => {
  it("degrades to offline mode with a clear message once the request budget is spent", async () => {
    vi.stubEnv("AI_DAILY_REQUEST_BUDGET", "2");
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    for (let i = 0; i < 2; i++) await (await call()).text();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const res = await call();
    expect(res.status).toBe(200);
    const evs = await parse(res);
    expect(JSON.parse(evs[0].data)).toEqual({ mode: "offline", reason: "budget" });
    const text = evs.filter((e) => e.event === "delta").map((e) => JSON.parse(e.data).text).join("");
    expect(text).toContain("daily capacity");
    expect(fetchMock).toHaveBeenCalledTimes(2); // no third upstream call
    expect(evs.at(-1)!.event).toBe("done");
  });

  it("writes the budget notice in the visitor language", async () => {
    vi.stubEnv("AI_DAILY_REQUEST_BUDGET", "1");
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    await (await call()).text();
    const evs = await parse(await call(payload("fr")));
    expect(evs.filter((e) => e.event === "delta").map((e) => JSON.parse(e.data).text).join("")).toContain(
      "capacité quotidienne",
    );
  });

  it("degrades once the output-token budget is spent, using the usage reported by the stream", async () => {
    vi.stubEnv("AI_DAILY_OUTPUT_TOKEN_BUDGET", "100");
    fetchMock.mockImplementation(() => Promise.resolve(okStream(150)));
    await (await call()).text();
    await vi.waitFor(async () => expect((await getBudgetUsage()).outputTokens).toBe(150));
    const evs = await parse(await call());
    expect(JSON.parse(evs[0].data)).toMatchObject({ mode: "offline", reason: "budget" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("logs budget exhaustion once a minute at error level", async () => {
    vi.stubEnv("AI_DAILY_REQUEST_BUDGET", "1");
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    await (await call()).text();
    for (let i = 0; i < 4; i++) await (await call()).text();
    expect(logCalls(errorSpy, "ai.assistant.budget_exhausted")).toHaveLength(1);
  });

  it("starts a fresh budget the next UTC day", async () => {
    vi.stubEnv("AI_DAILY_REQUEST_BUDGET", "1");
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    await (await call()).text();
    expect(JSON.parse((await parse(await call()))[0].data).mode).toBe("offline");
    vi.setSystemTime(new Date("2026-10-17T00:00:05Z"));
    expect(JSON.parse((await parse(await call()))[0].data).mode).toBe("online");
  });
});

describe("AI tutor - per-account and per-visitor daily caps", () => {
  it("caps a signed-in user per day, in addition to the hourly limit", async () => {
    vi.stubEnv("AI_USER_DAILY_REQUESTS", "3");
    m.getSession.mockResolvedValue({ user: { id: "user-1" } });
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await call(payload(), { "x-forwarded-for": "198.51.100.9" });
      statuses.push(res.status);
      await res.text();
      vi.setSystemTime(Date.now() + 11_000); // stay clear of the 10 s burst limiter
    }
    expect(statuses).toEqual([200, 200, 200, 429, 429]);
    expect(logCalls(warnSpy, "ai.assistant.daily_cap_reached").length).toBeGreaterThan(0);
  });

  it("does not affect another user", async () => {
    vi.stubEnv("AI_USER_DAILY_REQUESTS", "1");
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    m.getSession.mockResolvedValue({ user: { id: "user-a" } });
    await (await call()).text();
    expect((await call()).status).toBe(429);
    m.getSession.mockResolvedValue({ user: { id: "user-b" } });
    expect((await call()).status).toBe(200);
  });

  it("caps visitors per IP per day", async () => {
    vi.stubEnv("AI_GUEST_DAILY_REQUESTS", "2");
    fetchMock.mockImplementation(() => Promise.resolve(okStream()));
    const codes: number[] = [];
    for (let i = 0; i < 3; i++) {
      const res = await call(payload(), { "x-forwarded-for": "192.0.2.77" });
      codes.push(res.status);
      await res.text();
      vi.setSystemTime(Date.now() + 11_000);
    }
    expect(codes).toEqual([200, 200, 429]);
  });
});

describe("AI tutor - observability without content", () => {
  it("logs model, latency and token usage read from the stream", async () => {
    fetchMock.mockResolvedValue(okStream(42));
    await (await call()).text();
    await vi.waitFor(() => expect(logCalls(infoSpy, "ai.assistant.completed")).toHaveLength(1));
    const entry = logCalls(infoSpy, "ai.assistant.completed")[0];
    expect(entry.metadata).toMatchObject({
      outcome: "ok",
      model: "mock-model",
      inputTokens: 120,
      outputTokens: 42,
      cacheReadTokens: 7,
      stopReason: "end_turn",
      truncated: false,
      surface: "playground",
    });
    expect(typeof entry.duration).toBe("number");
  });

  it("never logs prompt, code, answer or API key, on success or failure", async () => {
    fetchMock.mockResolvedValueOnce(okStream());
    await (await call()).text();
    fetchMock.mockRejectedValueOnce(new Error(`socket hang up while sending ${KEY} ${SECRET_CODE}`));
    await (await call()).text();
    fetchMock.mockResolvedValueOnce(new Response("upstream says " + QUESTION, { status: 500 }));
    await (await call()).text();
    await vi.waitFor(() => expect(logged()).toContain("ai.assistant.completed"));
    const all = logged();
    for (const secret of [SECRET_CODE, QUESTION, KEY, "topSecretVariableName", "Answer text"]) {
      expect(all).not.toContain(secret);
    }
  });

  it("logs upstream failures with the provider status and a stable event name", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 529 }));
    const res = await call();
    expect(res.status).toBe(503);
    const entry = logCalls(errorSpy, "ai.assistant.upstream_error")[0];
    expect(entry.metadata).toMatchObject({ phase: "open", code: "busy", upstreamStatus: 529, model: "mock-model" });
  });

  it("logs a mid-stream failure as ai.assistant.stream_error and still accounts partial output", async () => {
    fetchMock.mockResolvedValue(
      upstream([
        sse("content_block_delta", { type: "content_block_delta", delta: { type: "text_delta", text: "partial answer" } }),
        sse("error", { type: "error", error: { type: "overloaded_error" } }),
      ]),
    );
    await (await call()).text();
    await vi.waitFor(() => expect(logCalls(errorSpy, "ai.assistant.stream_error")).toHaveLength(1));
    const entry = logCalls(errorSpy, "ai.assistant.stream_error")[0];
    expect(entry.metadata).toMatchObject({ outcome: "error", errorCode: "busy" });
    expect(entry.metadata.outputTokens).toBeGreaterThan(0);
  });
});
