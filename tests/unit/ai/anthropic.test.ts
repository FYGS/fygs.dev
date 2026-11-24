import { describe, it, expect, vi } from "vitest";
import {
  AiUpstreamError,
  DEFAULT_AI_MODEL,
  getAiConfig,
  mapUpstreamStatus,
  openCompletion,
  type AiConfig,
} from "@/lib/ai/anthropic";

const config: AiConfig = { apiKey: "sk-test", model: "m", baseUrl: "http://mock.test" };

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
const delta = (text: string) =>
  sse("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text } });
const stop = sse("message_stop", { type: "message_stop" });

function responseOf(chunks: string[], init: ResponseInit = { status: 200 }) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        for (const ch of chunks) c.enqueue(enc.encode(ch));
        c.close();
      },
    }),
    init,
  );
}

/** A response that sends `first` then stays open until the request is aborted. */
function hangingResponse(first: string, signal: AbortSignal) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(first));
        signal.addEventListener("abort", () => c.error(new DOMException("aborted", "AbortError")));
      },
    }),
  );
}

async function drain(gen: AsyncGenerator<string, void>) {
  let out = "";
  for await (const t of gen) out += t;
  return out;
}

const base = { config, system: "s", messages: [{ role: "user" as const, content: "hi" }], maxTokens: 100 };

describe("getAiConfig", () => {
  it("is null without a key (offline mode)", () => {
    expect(getAiConfig({} as NodeJS.ProcessEnv)).toBeNull();
    expect(getAiConfig({ ANTHROPIC_API_KEY: "  " } as NodeJS.ProcessEnv)).toBeNull();
  });
  it("applies defaults and trims the base url", () => {
    const config = getAiConfig({ ANTHROPIC_API_KEY: "k" } as NodeJS.ProcessEnv)!;
    // The key is readable but not enumerable, so it never serialises by accident
    expect(config.apiKey).toBe("k");
    expect({ ...config }).toEqual({ model: DEFAULT_AI_MODEL, baseUrl: "https://api.anthropic.com" });
    expect(
      getAiConfig({ ANTHROPIC_API_KEY: "k", AI_MODEL: "x", ANTHROPIC_BASE_URL: "http://h:1//" } as NodeJS.ProcessEnv),
    ).toMatchObject({ model: "x", baseUrl: "http://h:1" });
  });
});

describe("mapUpstreamStatus", () => {
  it.each([
    [429, "busy", 503],
    [529, "busy", 503],
    [401, "unavailable", 503],
    [403, "unavailable", 503],
    [504, "timeout", 504],
    [500, "upstream_error", 502],
    [400, "upstream_error", 502],
  ])("%i -> %s / %i", (status, code, http) => {
    const e = mapUpstreamStatus(status);
    expect(e).toBeInstanceOf(AiUpstreamError);
    expect(e.code).toBe(code);
    expect(e.httpStatus).toBe(http);
  });
  it("forwards a sane Retry-After", () => {
    expect(mapUpstreamStatus(429, "12").retryAfter).toBe(12);
    expect(mapUpstreamStatus(429, "abc").retryAfter).toBe(30);
  });
});

describe("openCompletion", () => {
  it("sends the right request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(responseOf([delta("a"), stop]));
    const c = await openCompletion({ ...base, fetchImpl });
    await drain(c.text);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://mock.test/v1/messages");
    expect(init.headers).toMatchObject({ "x-api-key": "sk-test", "anthropic-version": "2023-06-01" });
    expect(JSON.parse(init.body)).toMatchObject({ model: "m", max_tokens: 100, stream: true, system: "s" });
  });

  it("streams text deltas and ignores pings and other blocks", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      responseOf([
        sse("message_start", { type: "message_start", message: {} }),
        sse("ping", { type: "ping" }),
        delta("Hel"),
        sse("content_block_delta", { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: "{" } }),
        delta("lo"),
        stop,
      ]),
    );
    const c = await openCompletion({ ...base, fetchImpl });
    expect(await drain(c.text)).toBe("Hello");
    expect(c.truncated).toBe(false);
  });

  it("reassembles events cut in the middle of a chunk", async () => {
    const whole = delta("héllo wörld") + delta("!") + stop;
    const pieces = whole.match(/[\s\S]{1,7}/g)!;
    const fetchImpl = vi.fn().mockResolvedValue(responseOf(pieces));
    const c = await openCompletion({ ...base, fetchImpl });
    expect(await drain(c.text)).toBe("héllo wörld!");
  });

  it("reports truncation on max_tokens", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      responseOf([delta("x"), sse("message_delta", { type: "message_delta", delta: { stop_reason: "max_tokens" } }), stop]),
    );
    const c = await openCompletion({ ...base, fetchImpl });
    await drain(c.text);
    expect(c.truncated).toBe(true);
  });

  it.each([
    [401, "unavailable"],
    [429, "busy"],
    [500, "upstream_error"],
    [529, "busy"],
  ])("maps HTTP %i before streaming, without leaking the body", async (status, code) => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response('{"error":{"message":"secret detail sk-test"}}', { status, headers: { "retry-after": "7" } }));
    const err = await openCompletion({ ...base, fetchImpl }).catch((e) => e);
    expect(err).toBeInstanceOf(AiUpstreamError);
    expect(err.code).toBe(code);
    expect(err.message).not.toMatch(/secret|sk-test/);
  });

  it("maps an in-stream error event", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(responseOf([delta("a"), sse("error", { type: "error", error: { type: "overloaded_error", message: "x" } })]));
    const c = await openCompletion({ ...base, fetchImpl });
    const err = await drain(c.text).catch((e) => e);
    expect(err).toMatchObject({ code: "busy" });
  });

  it("fails when the stream ends without message_stop", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(responseOf([delta("a")]));
    const c = await openCompletion({ ...base, fetchImpl });
    expect(await drain(c.text).catch((e) => e)).toMatchObject({ code: "upstream_error" });
  });

  it("maps a network failure", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    expect(await openCompletion({ ...base, fetchImpl }).catch((e) => e)).toMatchObject({ code: "upstream_error" });
  });

  it("times out when the headers never arrive", async () => {
    const fetchImpl = vi.fn(
      (_u: string, init: RequestInit) =>
        new Promise<Response>((_res, rej) =>
          init.signal!.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))),
        ),
    );
    const err = await openCompletion({
      ...base,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      connectTimeoutMs: 20,
    }).catch((e) => e);
    expect(err).toMatchObject({ code: "timeout", httpStatus: 504 });
  });

  it("times out on a stalled stream", async () => {
    const fetchImpl = vi.fn().mockImplementation(async (_u: string, init: RequestInit) => hangingResponse(delta("a"), init.signal!));
    const c = await openCompletion({ ...base, fetchImpl, idleTimeoutMs: 30 });
    expect(await drain(c.text).catch((e) => e)).toMatchObject({ code: "timeout" });
  });

  it("propagates the caller's abort to the upstream request", async () => {
    let upstreamSignal: AbortSignal | undefined;
    const fetchImpl = vi.fn().mockImplementation(async (_u: string, init: RequestInit) => {
      upstreamSignal = init.signal!;
      return hangingResponse(delta("a"), init.signal!);
    });
    const ac = new AbortController();
    const c = await openCompletion({ ...base, fetchImpl, signal: ac.signal });
    const iterator = c.text[Symbol.asyncIterator]();
    expect((await iterator.next()).value).toBe("a");
    ac.abort();
    expect(upstreamSignal!.aborted).toBe(true);
    await expect(iterator.next()).rejects.toBeDefined();
  });

  it("does not stream when already aborted", async () => {
    const fetchImpl = vi.fn((_u: string, init: RequestInit) =>
      init.signal!.aborted ? Promise.reject(new DOMException("aborted", "AbortError")) : Promise.resolve(responseOf([stop])),
    );
    const ac = new AbortController();
    ac.abort();
    await expect(
      openCompletion({ ...base, fetchImpl: fetchImpl as unknown as typeof fetch, signal: ac.signal }),
    ).rejects.toBeDefined();
  });
});

describe("openCompletion - usage", () => {
  it("reads token usage from message_start and message_delta without content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      responseOf([
        sse("message_start", {
          type: "message_start",
          message: { usage: { input_tokens: 200, output_tokens: 1, cache_read_input_tokens: 50, cache_creation_input_tokens: 10 } },
        }),
        delta("Hello"),
        sse("message_delta", { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 33 } }),
        stop,
      ]),
    );
    const c = await openCompletion({ ...base, fetchImpl });
    expect(c.usage).toEqual({ inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 });
    await drain(c.text);
    expect(c.usage).toEqual({ inputTokens: 200, outputTokens: 33, cacheReadTokens: 50, cacheCreationTokens: 10 });
    expect(c.stopReason).toBe("end_turn");
    expect(c.outputChars).toBe(5);
  });

  it("tolerates a stream without usage", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(responseOf([delta("a"), stop]));
    const c = await openCompletion({ ...base, fetchImpl });
    await drain(c.text);
    expect(c.usage.outputTokens).toBe(0);
    expect(c.stopReason).toBeNull();
  });

  it("carries the provider status on upstream errors, for logs", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("x", { status: 529 }));
    await expect(openCompletion({ ...base, fetchImpl })).rejects.toMatchObject({ code: "busy", upstreamStatus: 529 });
  });
});
