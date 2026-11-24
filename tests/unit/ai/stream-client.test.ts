import { describe, it, expect, vi } from "vitest";
import { AssistantClientError, streamAssistant } from "@/components/ai/stream-client";
import { buildHistory, nextHintLevel, type ChatMessage } from "@/components/ai/use-ai-chat";
import {
  CHAT_STORAGE_KEY,
  MAX_CONVERSATIONS,
  MAX_STORED_CONTENT,
  MAX_STORED_MESSAGES,
  clearConversation,
  loadConversation,
  saveConversation,
} from "@/components/ai/chat-storage";

class MemoryStorage implements Storage {
  data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

const request = { mode: "chat" as const, messages: [{ role: "user" as const, content: "hi" }] };

const stream = (chunks: string[], init: ResponseInit = {}) => {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        for (const ch of chunks) c.enqueue(enc.encode(ch));
        c.close();
      },
    }),
    { status: 200, headers: { "content-type": "text/event-stream" }, ...init },
  );
};

const ev = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

describe("streamAssistant", () => {
  it("delivers meta, deltas and done, whatever the chunking", async () => {
    const wire = ev("meta", { mode: "offline" }) + ev("delta", { text: "Hé" }) + ev("delta", { text: "llo" }) + ev("done", { truncated: true });
    const fetchImpl = vi.fn().mockResolvedValue(stream(wire.match(/[\s\S]{1,5}/g)!));
    const seen: string[] = [];
    await streamAssistant(
      request,
      {
        onMeta: (m) => seen.push(`meta:${m.mode}`),
        onDelta: (t) => seen.push(t),
        onDone: (d) => seen.push(`done:${d.truncated}`),
      },
      { fetchImpl },
    );
    expect(seen).toEqual(["meta:offline", "Hé", "llo", "done:true"]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/ai/assistant");
    expect(init).toMatchObject({ method: "POST", cache: "no-store" });
    expect(JSON.parse(init.body)).toEqual(request);
  });

  it.each([
    [429, { error: "Too many requests", code: "rate_limited", retryAfter: 42 }, "rate_limited", 42],
    [400, { error: "Invalid request", code: "invalid_request" }, "invalid_request", undefined],
    [503, { error: "busy", code: "busy" }, "busy", undefined],
    [500, { error: "x", code: "something_new" }, "internal", undefined],
  ])("maps HTTP %i JSON errors", async (status, body, code, retryAfter) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
    const err = await streamAssistant(request, { onDelta: () => {} }, { fetchImpl }).catch((e) => e);
    expect(err).toBeInstanceOf(AssistantClientError);
    expect(err).toMatchObject({ code, retryAfter });
  });

  it("falls back to the Retry-After header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("<html>gateway</html>", { status: 429, headers: { "retry-after": "17" } }));
    const err = await streamAssistant(request, { onDelta: () => {} }, { fetchImpl }).catch((e) => e);
    expect(err).toMatchObject({ code: "rate_limited", retryAfter: 17 });
  });

  it("maps a stream error event", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(stream([ev("meta", { mode: "online" }), ev("error", { code: "timeout", message: "x" })]));
    const err = await streamAssistant(request, { onDelta: () => {} }, { fetchImpl }).catch((e) => e);
    expect(err).toMatchObject({ code: "timeout" });
  });

  it("treats a stream that ends without done as interrupted", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(stream([ev("delta", { text: "a" })]));
    const err = await streamAssistant(request, { onDelta: () => {} }, { fetchImpl }).catch((e) => e);
    expect(err).toMatchObject({ code: "network" });
  });

  it("rejects a non-stream 200 (a proxy error page, for instance)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("<html/>", { status: 200, headers: { "content-type": "text/html" } }));
    const err = await streamAssistant(request, { onDelta: () => {} }, { fetchImpl }).catch((e) => e);
    expect(err).toMatchObject({ code: "internal" });
  });

  it("network failure", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await streamAssistant(request, { onDelta: () => {} }, { fetchImpl }).catch((e) => e)).toMatchObject({ code: "network" });
  });

  it("an abort mid-stream ends with an AbortError, not a network error", async () => {
    const enc = new TextEncoder();
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(enc.encode(ev("delta", { text: "a" })));
          },
        }),
        { status: 200, headers: { "content-type": "text/event-stream" } },
      ),
    );
    const ac = new AbortController();
    const got: string[] = [];
    const promise = streamAssistant(request, { onDelta: (t) => got.push(t) }, { fetchImpl, signal: ac.signal });
    await vi.waitFor(() => expect(got).toEqual(["a"]));
    ac.abort();
    const err = await promise.catch((e) => e);
    expect(err).not.toBeInstanceOf(AssistantClientError);
    expect((err as Error).name).toBe("AbortError");
  });
});

describe("history helpers", () => {
  const m = (role: "user" | "assistant", content: string, mode?: string): ChatMessage => ({
    id: Math.random().toString(),
    role,
    content,
    mode,
  });

  it("buildHistory keeps recent turns within the server caps and starts with the user", () => {
    const many = Array.from({ length: 30 }, (_, i) => m(i % 2 === 0 ? "user" : "assistant", `m${i}`));
    const h = buildHistory(many);
    expect(h.length).toBeLessThanOrEqual(12);
    expect(h[0].role).toBe("user");
    expect(h.at(-1)!.content).toBe("m29");

    const huge = [m("user", "a".repeat(20_000)), m("assistant", "b".repeat(20_000)), m("user", "c".repeat(20_000))];
    const capped = buildHistory(huge);
    expect(capped.every((x) => x.content.length <= 6000)).toBe(true);
    expect(capped.reduce((n, x) => n + x.content.length, 0)).toBeLessThanOrEqual(40_000);
    expect(capped.at(-1)!.role).toBe("user");
  });

  it("buildHistory drops empty (placeholder) messages", () => {
    expect(buildHistory([m("user", "q"), m("assistant", "")])).toEqual([{ role: "user", content: "q" }]);
  });

  it("nextHintLevel counts consecutive previous hints only", () => {
    expect(nextHintLevel([])).toBe(1);
    expect(nextHintLevel([m("user", "x", "hint"), m("assistant", "h")])).toBe(2);
    expect(nextHintLevel([m("user", "x", "hint"), m("assistant", "h"), m("user", "x", "hint"), m("assistant", "h")])).toBe(3);
    expect(nextHintLevel([m("user", "x", "hint"), m("user", "x", "hint"), m("user", "x", "hint"), m("user", "x", "hint")])).toBe(3);
    expect(nextHintLevel([m("user", "x", "hint"), m("assistant", "h"), m("user", "explain", "explain"), m("assistant", "e")])).toBe(1);
  });
});

describe("chat storage", () => {
  const msg = (i: number, content = `message ${i}`) => ({ id: `id${i}`, role: (i % 2 ? "assistant" : "user") as "user" | "assistant", content });

  it("round-trips a conversation per key", () => {
    const s = new MemoryStorage();
    saveConversation("a", [msg(0), msg(1)], s);
    saveConversation("b", [msg(2)], s);
    expect(loadConversation("a", s).map((m) => m.content)).toEqual(["message 0", "message 1"]);
    expect(loadConversation("b", s)).toHaveLength(1);
    expect(loadConversation("none", s)).toEqual([]);
  });

  it("bounds messages per conversation and content length", () => {
    const s = new MemoryStorage();
    saveConversation("a", Array.from({ length: 100 }, (_, i) => msg(i, "x".repeat(MAX_STORED_CONTENT + 500))), s);
    const loaded = loadConversation("a", s);
    expect(loaded).toHaveLength(MAX_STORED_MESSAGES);
    expect(loaded[0].content.length).toBe(MAX_STORED_CONTENT);
    expect(loaded.at(-1)!.id).toBe("id99");
  });

  it("keeps only the most recent conversations", () => {
    const s = new MemoryStorage();
    for (let i = 0; i < MAX_CONVERSATIONS + 5; i++) saveConversation(`k${i}`, [msg(i)], s, 1000 + i);
    const stored = JSON.parse(s.getItem(CHAT_STORAGE_KEY)!);
    expect(Object.keys(stored)).toHaveLength(MAX_CONVERSATIONS);
    expect(stored["k0"]).toBeUndefined();
    expect(stored[`k${MAX_CONVERSATIONS + 4}`]).toBeDefined();
  });

  it("removes a conversation when cleared or emptied", () => {
    const s = new MemoryStorage();
    saveConversation("a", [msg(0)], s);
    clearConversation("a", s);
    expect(loadConversation("a", s)).toEqual([]);
  });

  it("survives corrupt data, junk messages and a failing storage", () => {
    const s = new MemoryStorage();
    s.setItem(CHAT_STORAGE_KEY, "{not json");
    expect(loadConversation("a", s)).toEqual([]);
    s.setItem(CHAT_STORAGE_KEY, JSON.stringify({ a: { updatedAt: 1, messages: [{ nope: 1 }, msg(0), "x", null] } }));
    expect(loadConversation("a", s)).toHaveLength(1);

    const broken = new MemoryStorage();
    broken.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(() => saveConversation("a", [msg(0)], broken)).not.toThrow();
    expect(loadConversation("a", null)).toEqual([]);
    expect(() => saveConversation("a", [msg(0)], null)).not.toThrow();
  });
});
