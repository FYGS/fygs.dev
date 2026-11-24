import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AiMarkdown, safeLinkTarget } from "@/components/ai/ai-markdown";

// The real `intlayer` package pulls esbuild, which cannot run in jsdom
vi.mock("intlayer", () => ({ t: (translation: unknown) => ({ nodeType: "translation", translation }) }));
vi.mock("next-intlayer", async () => {
  const { aiText } = await import("./test-utils");
  return { useIntlayer: () => aiText, useLocale: () => ({ locale: "en" }) };
});

describe("safeLinkTarget", () => {
  it("accepts web and mail addresses and tells where they lead", () => {
    expect(safeLinkTarget("https://developer.mozilla.org/fr/docs")).toMatchObject({ host: "developer.mozilla.org" });
    expect(safeLinkTarget("http://example.com")).toMatchObject({ host: "example.com" });
    expect(safeLinkTarget("mailto:a@b.co")).not.toBeNull();
  });

  it.each([
    "javascript:alert(1)",
    " JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>1</script>",
    "vbscript:x",
    "file:///etc/passwd",
    "blob:https://x/1",
    "//evil.test/x",
    "/relative",
    "#frag",
    "",
  ])("refuses %j", (href) => {
    expect(safeLinkTarget(href)).toBeNull();
  });

  it("refuses undefined", () => {
    expect(safeLinkTarget(undefined)).toBeNull();
  });
});

describe("AiMarkdown", () => {
  it("never loads an image: it shows the description instead", () => {
    const { container } = render(<AiMarkdown content={"![logo](https://evil.test/track.png?u=1)"} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("logo");
    expect(container.innerHTML).not.toContain("evil.test");
  });

  it("shows the destination next to a link and opens it safely", () => {
    const { container } = render(<AiMarkdown content={"[la doc](https://example.org/page)"} />);
    const anchor = container.querySelector("a")!;
    expect(anchor.getAttribute("href")).toBe("https://example.org/page");
    expect(anchor.getAttribute("rel")).toContain("noopener");
    expect(anchor.getAttribute("rel")).toContain("noreferrer");
    expect(container.textContent).toContain("example.org");
  });

  it("does not make a link out of a javascript: address", () => {
    const { container } = render(<AiMarkdown content={"[cliquez](javascript:alert(1))"} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("cliquez");
  });

  it("does not run raw HTML", () => {
    const { container } = render(<AiMarkdown content={'<img src=x onerror="window.__ai=1"><script>window.__ai=2</script>'} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect((window as unknown as { __ai?: number }).__ai).toBeUndefined();
  });
});
