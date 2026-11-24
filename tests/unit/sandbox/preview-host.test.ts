import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { describe, expect, it, vi } from "vitest";

const source = fs.readFileSync(path.resolve(__dirname, "../../../public/sandbox/preview.js"), "utf8");
const NONCE = "0123456789abcdef0123456789abcdef";

function load(hash: string) {
  const listeners: Array<(event: unknown) => void> = [];
  const parent = { postMessage: vi.fn() };
  const document = { open: vi.fn(), write: vi.fn(), close: vi.fn() };
  const window = {
    parent,
    addEventListener: (_: string, fn: (event: unknown) => void) => listeners.push(fn),
    removeEventListener: (_: string, fn: unknown) => {
      const index = listeners.indexOf(fn as never);
      if (index >= 0) listeners.splice(index, 1);
    },
  };
  vm.runInNewContext(source, { window, document, location: { hash } });
  const deliver = (data: unknown, from: unknown = parent) => listeners.slice().forEach((fn) => fn({ source: from, data }));
  return { parent, document, deliver, listeners };
}

describe("the preview host page", () => {
  it("announces itself to the playground with the nonce from its address", () => {
    const { parent } = load(`#${NONCE}`);
    expect(parent.postMessage).toHaveBeenCalledWith({ type: "preview-ready", nonce: NONCE }, "*");
  });

  it("does nothing without a well-formed nonce", () => {
    for (const hash of ["", "#", "#short", `#${NONCE}0`, "#ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ"]) {
      const { parent, listeners } = load(hash);
      expect(parent.postMessage).not.toHaveBeenCalled();
      expect(listeners).toHaveLength(0);
    }
  });

  it("writes the page it is given by its parent, once", () => {
    const { document, deliver } = load(`#${NONCE}`);
    deliver({ type: "render", nonce: NONCE, html: "<h1>hi</h1>" });
    expect(document.write).toHaveBeenCalledWith("<h1>hi</h1>");
    expect(document.open).toHaveBeenCalledTimes(1);
    expect(document.close).toHaveBeenCalledTimes(1);
    deliver({ type: "render", nonce: NONCE, html: "<h1>again</h1>" });
    expect(document.write).toHaveBeenCalledTimes(1);
  });

  it("ignores a message from another window, with another nonce, of another type, or too large", () => {
    const { document, deliver } = load(`#${NONCE}`);
    deliver({ type: "render", nonce: NONCE, html: "<b>x</b>" }, { postMessage: vi.fn() });
    deliver({ type: "render", nonce: "f".repeat(32), html: "<b>x</b>" });
    deliver({ type: "other", nonce: NONCE, html: "<b>x</b>" });
    deliver({ type: "render", nonce: NONCE, html: 42 });
    deliver({ type: "render", nonce: NONCE, html: "x".repeat(2_000_001) });
    deliver(null);
    expect(document.write).not.toHaveBeenCalled();
  });
});
