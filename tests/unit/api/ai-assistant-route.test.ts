import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Redis is unreachable: the limiter runs on its in-process fallback
vi.mock("@/lib/redis", () => ({
  default: {
    eval: () => Promise.reject(new Error("redis unavailable")),
    setNxEx: () => Promise.reject(new Error("redis unavailable")),
  },
}));

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  emit: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: m.getSession } } }));
vi.mock("@/lib/analytics-helper", () => ({ AnalyticsHelper: { emit: m.emit } }));

import { POST } from "@/app/api/ai/assistant/route";
import { __resetRateLimitMemory } from "@/lib/rate-limit";
import { SseParser, type SseEvent } from "@/lib/ai/sse";

const SECRET_CODE = "const topSecretVariableName = 42;";

const body = (over: Record<string, unknown> = {}) => ({
  mode: "explain",
  locale: "en",
  messages: [{ role: "user", content: "What does this do?" }],
  context: {
    surface: "playground",
    language: "javascript",
    activeFile: { name: "main.js", content: SECRET_CODE },
  },
  ...over,
});

let ipCounter = 0;
const call = (payload: unknown, opts: { ip?: string; signal?: AbortSignal; raw?: string; headers?: Record<string, string> } = {}) =>
  POST(
    new NextRequest("http://localhost/api/ai/assistant", {
      method: "POST",
      body: opts.raw ?? JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": opts.ip ?? `198.51.100.${++ipCounter % 250}`,
        ...opts.headers,
      },
      signal: opts.signal,
    }),
  );

async function events(res: Response): Promise<SseEvent[]> {
  const parser = new SseParser();
  const text = await res.text();
  return [...parser.push(text), ...parser.flush()];
}

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
const textDelta = (text: string) =>
  sse("content_block_delta", { type: "content_block_delta", delta: { type: "text_delta", text } });
const upstreamOk = (chunks: string[] = [textDelta("Hello "), textDelta("world"), sse("message_stop", { type: "message_stop" })]) =>
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

const fetchMock = vi.fn();

beforeEach(() => {
  __resetRateLimitMemory();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  m.getSession.mockResolvedValue(null);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");
  vi.stubEnv("ANTHROPIC_BASE_URL", "http://mock.test");
  vi.stubEnv("AI_MODEL", "mock-model");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("POST /api/ai/assistant - streaming", () => {
  it("streams meta, deltas and done as server-sent events", async () => {
    fetchMock.mockResolvedValue(upstreamOk());
    const res = await call(body());
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("cache-control")).toContain("no-store");

    const evs = await events(res);
    expect(evs.map((e) => e.event)).toEqual(["meta", "delta", "delta", "done"]);
    expect(JSON.parse(evs[0].data)).toEqual({ mode: "online", model: "mock-model" });
    expect(evs.filter((e) => e.event === "delta").map((e) => JSON.parse(e.data).text).join("")).toBe("Hello world");
    expect(JSON.parse(evs.at(-1)!.data)).toEqual({ truncated: false });
  });

  it("calls the model API with the key server-side, the tutor prompt and the capped context", async () => {
    fetchMock.mockResolvedValue(upstreamOk());
    await (await call(body({ mode: "hint", hintLevel: 2 }))).text();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://mock.test/v1/messages");
    expect(init.headers["x-api-key"]).toBe("sk-test-key");
    const sent = JSON.parse(init.body);
    expect(sent).toMatchObject({ model: "mock-model", stream: true, max_tokens: 600 });
    expect(sent.system).toContain("FYGS AI Tutor");
    expect(sent.system).toContain("level 2 of 3");
    expect(sent.messages.at(-1).content).toContain(SECRET_CODE);
    expect(sent.messages.at(-1).content).toContain("untrusted_data");
  });

  it("never sends the API key back to the browser", async () => {
    fetchMock.mockResolvedValue(upstreamOk());
    const res = await call(body());
    const all = JSON.stringify([...res.headers.entries()]) + (await res.text());
    expect(all).not.toContain("sk-test-key");
  });

  it("reports truncation when the model stops on max_tokens", async () => {
    fetchMock.mockResolvedValue(
      upstreamOk([
        textDelta("cut"),
        sse("message_delta", { type: "message_delta", delta: { stop_reason: "max_tokens" } }),
        sse("message_stop", { type: "message_stop" }),
      ]),
    );
    const evs = await events(await call(body()));
    expect(JSON.parse(evs.at(-1)!.data)).toEqual({ truncated: true });
  });

  it("turns a mid-stream upstream failure into an error event", async () => {
    fetchMock.mockResolvedValue(
      upstreamOk([textDelta("partial"), sse("error", { type: "error", error: { type: "overloaded_error", message: "x" } })]),
    );
    const evs = await events(await call(body()));
    expect(evs.map((e) => e.event)).toEqual(["meta", "delta", "error"]);
    expect(JSON.parse(evs.at(-1)!.data)).toMatchObject({ code: "busy" });
  });
});

describe("POST /api/ai/assistant - validation", () => {
  it("rejects invalid JSON", async () => {
    const res = await call(null, { raw: "{nope" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "invalid_request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["unknown mode", { mode: "root" }],
    ["empty messages (must not crash)", { messages: [] }],
    ["last message from assistant", { messages: [{ role: "assistant", content: "x" }] }],
    ["system role", { messages: [{ role: "system", content: "x" }] }],
    ["file too big", { context: { activeFile: { name: "a", content: "x".repeat(60_001) } } }],
  ])("400 for %s, without calling the model", async (_n, over) => {
    const res = await call(body(over));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("invalid_request");
    expect(Array.isArray(json.issues)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("413 for an oversized body", async () => {
    const res = await call(null, { raw: JSON.stringify({ pad: "x".repeat(200_001) }) });
    expect(res.status).toBe(413);
    const declared = await call(null, { raw: "{}", headers: { "content-length": "9999999" } });
    expect(declared.status).toBe(413);
  });
});

describe("POST /api/ai/assistant - rate limits", () => {
  it("burst: more than 5 calls in 10 seconds get 429 with Retry-After", async () => {
    fetchMock.mockImplementation(async () => upstreamOk());
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await call(body(), { ip: "203.0.113.1" })).status);
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses.slice(5)).toEqual([429, 429]);
    const blocked = await call(body(), { ip: "203.0.113.1" });
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await blocked.json()).toMatchObject({ code: "rate_limited" });
  });

  it("guests get 8 requests per hour, then 429", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    fetchMock.mockImplementation(async () => upstreamOk());
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(new Date(2030, 0, 1, 10, 0, i * 15)); // stays clear of the burst window
      const res = await call(body(), { ip: "203.0.113.2" });
      statuses.push(res.status);
      if (res.status === 200) await res.text();
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 200, 200, 200, 429, 429]);

    vi.setSystemTime(new Date(2030, 0, 1, 10, 3, 0));
    const blocked = await call(body(), { ip: "203.0.113.2" });
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(60);
    expect(blocked.headers.get("x-ratelimit-limit")).toBe("8");
    // another visitor is not affected
    expect((await call(body(), { ip: "203.0.113.3" })).status).toBe(200);
  });

  it("signed-in users get a larger, per-account budget", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    m.getSession.mockResolvedValue({ user: { id: "user-1" } });
    fetchMock.mockImplementation(async () => upstreamOk());
    for (let i = 0; i < 12; i++) {
      vi.setSystemTime(new Date(2030, 0, 1, 10, 0, i * 15));
      const res = await call(body(), { ip: "203.0.113.4" });
      expect(res.status).toBe(200);
      await res.text();
    }
  });

  it("offline mode is not subject to the hourly quota", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.useFakeTimers({ toFake: ["Date"] });
    for (let i = 0; i < 12; i++) {
      vi.setSystemTime(new Date(2030, 0, 1, 10, 0, i * 15));
      const res = await call(body(), { ip: "203.0.113.5" });
      expect(res.status).toBe(200);
      await res.text();
    }
  });
});

describe("POST /api/ai/assistant - upstream errors", () => {
  it.each([
    [429, 503, "busy"],
    [529, 503, "busy"],
    [500, 502, "upstream_error"],
    [401, 503, "unavailable"],
  ])("upstream %i -> HTTP %i %s, with nothing leaked", async (up, http, code) => {
    fetchMock.mockResolvedValue(
      new Response('{"error":{"message":"invalid x-api-key sk-test-key"}}', { status: up, headers: { "retry-after": "9" } }),
    );
    const res = await call(body());
    expect(res.status).toBe(http);
    const text = await res.text();
    const json = JSON.parse(text);
    expect(json.code).toBe(code);
    expect(text).not.toMatch(/sk-test-key|x-api-key/);
    if (code === "busy") expect(res.headers.get("retry-after")).toBe("9");
  });

  it("a network failure is a 502, not a crash", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await call(body());
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ code: "upstream_error" });
  });
});

describe("POST /api/ai/assistant - disconnects", () => {
  it("aborts the upstream request when the client goes away mid-stream", async () => {
    let upstreamSignal: AbortSignal | undefined;
    fetchMock.mockImplementation(async (_u: string, init: RequestInit) => {
      upstreamSignal = init.signal!;
      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode(textDelta("first")));
            init.signal!.addEventListener("abort", () => c.error(new DOMException("aborted", "AbortError")));
          },
        }),
      );
    });
    const ac = new AbortController();
    const res = await call(body(), { signal: ac.signal });
    const reader = res.body!.getReader();
    await reader.read(); // meta
    await reader.read(); // first delta
    expect(upstreamSignal!.aborted).toBe(false);
    ac.abort();
    await vi.waitFor(() => expect(upstreamSignal!.aborted).toBe(true));
  });

  it("aborts the upstream request when the response stream is cancelled", async () => {
    let upstreamSignal: AbortSignal | undefined;
    fetchMock.mockImplementation(async (_u: string, init: RequestInit) => {
      upstreamSignal = init.signal!;
      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode(textDelta("first")));
            init.signal!.addEventListener("abort", () => c.error(new DOMException("aborted", "AbortError")));
          },
        }),
      );
    });
    const res = await call(body());
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();
    await vi.waitFor(() => expect(upstreamSignal!.aborted).toBe(true));
  });
});

describe("POST /api/ai/assistant - offline mode", () => {
  beforeEach(() => vi.stubEnv("ANTHROPIC_API_KEY", ""));

  it("answers from the local analyzer without calling any model", async () => {
    const res = await call(
      body({
        mode: "review",
        context: { surface: "playground", language: "javascript", activeFile: { name: "a.js", content: "var a = 1;\neval('x');" } },
      }),
    );
    expect(res.status).toBe(200);
    const evs = await events(res);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(evs[0].data)).toEqual({ mode: "offline" });
    const text = evs.filter((e) => e.event === "delta").map((e) => JSON.parse(e.data).text).join("");
    expect(text).toMatch(/Offline mode/);
    expect(text).toMatch(/line 1/);
    expect(text).toMatch(/line 2/);
    expect(evs.at(-1)!.event).toBe("done");
  });

  it("still validates the request", async () => {
    expect((await call(body({ mode: "nope" }))).status).toBe(400);
  });
});

describe("POST /api/ai/assistant - analytics", () => {
  it("records mode and surface for signed-in users, never the code or the question", async () => {
    m.getSession.mockResolvedValue({ user: { id: "user-9" } });
    fetchMock.mockResolvedValue(upstreamOk());
    await (await call(body())).text();
    expect(m.emit).toHaveBeenCalledTimes(1);
    const payload = m.emit.mock.calls[0][0];
    expect(payload).toMatchObject({ userId: "user-9", type: "AI_ASSISTANT_REQUEST", source: "api" });
    expect(payload.properties).toMatchObject({ mode: "explain", surface: "playground", backend: "online" });
    expect(JSON.stringify(payload)).not.toContain("topSecretVariableName");
    expect(JSON.stringify(payload)).not.toContain("What does this do");
  });

  it("records nothing for visitors", async () => {
    fetchMock.mockResolvedValue(upstreamOk());
    await (await call(body())).text();
    expect(m.emit).not.toHaveBeenCalled();
  });

  it("a failing session lookup degrades to a guest", async () => {
    m.getSession.mockRejectedValue(new Error("db down"));
    fetchMock.mockResolvedValue(upstreamOk());
    const res = await call(body());
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ratelimit-limit")).toBe("8");
  });
});
