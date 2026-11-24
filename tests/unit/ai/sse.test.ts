import { describe, it, expect } from "vitest";
import { SseParser, formatSse, readSseStream } from "@/lib/ai/sse";

const stream = (chunks: (string | Uint8Array)[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      const enc = new TextEncoder();
      for (const ch of chunks) c.enqueue(typeof ch === "string" ? enc.encode(ch) : ch);
      c.close();
    },
  });

async function collect(body: ReadableStream<Uint8Array>) {
  const out = [];
  for await (const e of readSseStream(body)) out.push(e);
  return out;
}

describe("SseParser", () => {
  const text =
    'event: a\ndata: {"x":1}\n\n' + "data: line1\ndata: line2\n\n" + ": keep-alive\n\n" + "event: b\ndata: end\n\n";
  const expected = [
    { event: "a", data: '{"x":1}' },
    { event: "message", data: "line1\nline2" },
    { event: "b", data: "end" },
  ];

  it("parses a whole payload", () => {
    const p = new SseParser();
    expect(p.push(text)).toEqual(expected);
  });

  it("gives the same result whatever the chunk boundaries (every split point)", () => {
    for (let cut = 0; cut <= text.length; cut++) {
      const p = new SseParser();
      const got = [...p.push(text.slice(0, cut)), ...p.push(text.slice(cut)), ...p.flush()];
      expect(got).toEqual(expected);
    }
  });

  it("gives the same result when fed one character at a time", () => {
    const p = new SseParser();
    const got = [...text].flatMap((ch) => p.push(ch));
    expect(got).toEqual(expected);
  });

  it("handles CRLF and lone CR, including a CRLF split across chunks", () => {
    const p = new SseParser();
    const got = [
      ...p.push("event: x\r\ndata: 1\r"),
      ...p.push("\n\r"),
      ...p.push("\ndata: 2\r\r"),
      ...p.flush(), // a trailing CR stays pending until we know no LF follows
    ];
    expect(got).toEqual([
      { event: "x", data: "1" },
      { event: "message", data: "2" },
    ]);
  });

  it("strips one leading space only, ignores unknown fields, BOM and id/retry", () => {
    const p = new SseParser();
    expect(p.push("﻿id: 5\nretry: 10\nbogus: z\ndata:  two spaces\n\n")).toEqual([
      { event: "message", data: " two spaces" },
    ]);
  });

  it("drops an unterminated event at the end of input", () => {
    const p = new SseParser();
    expect(p.push("event: a\ndata: partial")).toEqual([]);
    expect(p.flush()).toEqual([]);
  });

  it("dispatches nothing for an empty data-less block", () => {
    expect(new SseParser().push("event: a\n\n")).toEqual([]);
  });
});

describe("readSseStream", () => {
  it("decodes multi-byte characters split across byte chunks", async () => {
    const bytes = new TextEncoder().encode('data: {"t":"é€😀"}\n\n');
    const chunks = Array.from(bytes, (b) => new Uint8Array([b]));
    expect(await collect(stream(chunks))).toEqual([{ event: "message", data: '{"t":"é€😀"}' }]);
  });
});

describe("formatSse", () => {
  it("round-trips through the parser and never emits a raw newline in data", () => {
    const wire = formatSse("delta", { text: "a\nb\r\nc" });
    expect(wire.split("\n").filter((l) => l.startsWith("data:")).length).toBe(1);
    const [event] = new SseParser().push(wire);
    expect(event.event).toBe("delta");
    expect(JSON.parse(event.data)).toEqual({ text: "a\nb\r\nc" });
  });
});
