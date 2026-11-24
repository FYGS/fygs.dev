/**
 * Minimal Server-Sent Events codec (WHATWG "event stream" format), written by
 * hand so that no dependency is needed. Used both to read the model API stream
 * on the server and our own stream in the browser.
 */

export interface SseEvent {
  event: string;
  data: string;
}

/** Incremental parser: feed it text chunks cut anywhere, get whole events back. */
export class SseParser {
  private buffer = "";
  private started = false;
  private eventName = "";
  private dataLines: string[] = [];

  push(chunk: string): SseEvent[] {
    if (!this.started && chunk.length > 0) {
      this.started = true;
      if (chunk.charCodeAt(0) === 0xfeff) chunk = chunk.slice(1);
    }
    this.buffer += chunk;
    const out: SseEvent[] = [];

    let start = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      const ch = this.buffer[i];
      if (ch !== "\n" && ch !== "\r") continue;
      // A trailing "\r" may be the first half of "\r\n": wait for the next chunk
      if (ch === "\r" && i === this.buffer.length - 1) break;
      const line = this.buffer.slice(start, i);
      if (ch === "\r" && this.buffer[i + 1] === "\n") i++;
      start = i + 1;
      const event = this.processLine(line);
      if (event) out.push(event);
    }
    this.buffer = this.buffer.slice(start);
    return out;
  }

  /** End of input: a last line without terminator is still a line, but an unterminated event is dropped. */
  flush(): SseEvent[] {
    const out: SseEvent[] = [];
    if (this.buffer.length > 0) {
      const line = this.buffer.endsWith("\r") ? this.buffer.slice(0, -1) : this.buffer;
      this.buffer = "";
      const event = this.processLine(line);
      if (event) out.push(event);
    }
    this.eventName = "";
    this.dataLines = [];
    return out;
  }

  private processLine(line: string): SseEvent | null {
    if (line === "") {
      if (this.dataLines.length === 0) {
        this.eventName = "";
        return null;
      }
      const event = { event: this.eventName || "message", data: this.dataLines.join("\n") };
      this.eventName = "";
      this.dataLines = [];
      return event;
    }
    if (line.startsWith(":")) return null; // comment / keep-alive

    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "event") this.eventName = value;
    else if (field === "data") this.dataLines.push(value);
    // "id" and "retry" are irrelevant here
    return null;
  }
}

/**
 * Decode a byte stream into SSE events. Releases the reader when done or
 * abandoned; aborting `signal` ends the iteration early.
 */
export async function* readSseStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const onAbort = () => void reader.cancel().catch(() => {});
  if (signal?.aborted) onAbort();
  else signal?.addEventListener("abort", onAbort, { once: true });
  const decoder = new TextDecoder();
  const parser = new SseParser();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const event of parser.push(decoder.decode(value, { stream: true }))) yield event;
    }
    for (const event of parser.push(decoder.decode())) yield event;
    for (const event of parser.flush()) yield event;
  } finally {
    signal?.removeEventListener("abort", onAbort);
    reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Serialise one event. `data` is JSON-encoded so it never contains a raw newline. */
export function formatSse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
