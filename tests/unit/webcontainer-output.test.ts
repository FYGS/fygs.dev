import { describe, it, expect, vi } from "vitest";

vi.mock("@webcontainer/api", () => ({ WebContainer: { boot: vi.fn() } }));

import { stripAnsi } from "@/app/_lib/webcontainer-executor";

describe("stripAnsi (WebContainer console output)", () => {
  it("keeps program output that ends with CRLF (what node writes in the container)", () => {
    // Regression: the trailing \r of "\r\n" was read as a progress-bar overwrite,
    // which blanked every line of console.log output.
    expect(stripAnsi("Hello, Developer! You are 25 years old.\r\n")).toBe(
      "Hello, Developer! You are 25 years old.",
    );
  });

  it("keeps every line of multi-line CRLF output", () => {
    expect(stripAnsi("first\r\nsecond\r\nthird\r\n")).toBe("first\nsecond\nthird");
  });

  it("keeps output with LF only", () => {
    expect(stripAnsi("a\nb\n")).toBe("a\nb");
  });

  it("keeps blank lines between messages (one blank line, not three)", () => {
    expect(stripAnsi("a\r\n\r\n\r\n\r\nb\r\n")).toBe("a\n\nb");
  });

  it("collapses npm-style progress redraws to the final state", () => {
    expect(stripAnsi("[1/3] resolving\r[2/3] fetching\r[3/3] done")).toBe("[3/3] done");
  });

  it("handles a redraw followed by a CRLF line end", () => {
    expect(stripAnsi("progress 10%\rprogress 100%\r\n")).toBe("progress 100%");
  });

  it("removes ANSI colours and cursor codes", () => {
    expect(stripAnsi("\u001b[31mred\u001b[0m text")).toBe("red text");
    expect(stripAnsi("\u001b[2K\u001b[1Gdone")).toBe("done");
  });

  it("removes OSC title sequences", () => {
    expect(stripAnsi("\u001b]0;title\u0007output")).toBe("output");
  });

  it("returns an empty string for control-only input (callers skip it)", () => {
    expect(stripAnsi("\u001b[2K\r")).toBe("");
  });

  it("preserves tabs and indentation inside a line", () => {
    expect(stripAnsi("a\tb  c\r\n")).toBe("a\tb  c");
  });
});
