import { vi } from "vitest";
import content from "@/components/ai/ai-assistant.content";

/** Replace intlayer translation nodes by their English string (as `.value` objects). */
function resolve(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(resolve);
  if (node && typeof node === "object") {
    const n = node as { nodeType?: string; translation?: Record<string, string> };
    if (n.nodeType === "translation" && n.translation) {
      const value = n.translation.en;
      return { value, toString: () => value };
    }
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v)]));
  }
  return node;
}

export const aiText = resolve(content.content) as any;

/** A scriptable SSE response: push events one at a time, then finish or fail. */
export function controlledSse() {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  const format = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return {
    response: () =>
      new Response(body, { status: 200, headers: { "content-type": "text/event-stream; charset=utf-8" } }),
    meta: (mode: "online" | "offline" = "online") => controller.enqueue(encoder.encode(format("meta", { mode }))),
    delta: (text: string) => controller.enqueue(encoder.encode(format("delta", { text }))),
    done: (truncated = false) => {
      controller.enqueue(encoder.encode(format("done", { truncated })));
      controller.close();
    },
    error: (code: string, message = "boom") => {
      controller.enqueue(encoder.encode(format("error", { code, message })));
      controller.close();
    },
  };
}

/** A complete answer in one go. */
export function sseResponse(text: string, mode: "online" | "offline" = "online", truncated = false) {
  const s = controlledSse();
  const r = s.response();
  s.meta(mode);
  s.delta(text);
  s.done(truncated);
  return r;
}

export function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

export const noop = vi.fn();

/** A minimal in-memory Storage. */
export class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}
