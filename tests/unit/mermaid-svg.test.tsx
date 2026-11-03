import { describe, expect, it } from "vitest";

import { cleanMermaidSvg, cleanSvgCss } from "@/lib/mermaid-svg";

const wrap = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" id="d"><g>${inner}</g></svg>`;

describe("cleanMermaidSvg", () => {
  it("keeps an ordinary diagram", () => {
    const svg = wrap('<rect width="10" height="10" fill="#6366f1"></rect><text x="1" y="2">Start</text>');
    const out = cleanMermaidSvg(svg);
    expect(out).toContain("<rect");
    expect(out).toContain("Start");
  });

  it("removes scripts, event handlers and active elements", () => {
    const out = cleanMermaidSvg(
      wrap(
        '<script>window.__x=1</script><rect onclick="window.__x=2" onmouseover="1" width="1"></rect><iframe src="https://evil.test"></iframe>' +
          '<foreignObject><div onclick="1">label</div><img src="x" onerror="1"><form action="https://evil.test"><input></form></foreignObject>',
      ),
    );
    expect(out).not.toMatch(/<script|<iframe|<form|<input|<img/i);
    expect(out).not.toMatch(/\son[a-z]+=/i);
    expect(out).toContain("label");
  });

  it("removes links that leave the diagram, keeps references inside it", () => {
    const out = cleanMermaidSvg(
      wrap(
        '<a href="javascript:alert(1)"><text>x</text></a><a xlink:href="https://evil.test"><text>y</text></a>' +
          '<a href="#node"><text>z</text></a><path marker-end="url(#arrow)" d="M0 0"></path>',
      ),
    );
    expect(out).not.toMatch(/javascript:|evil\.test/i);
    expect(out).toContain('href="#node"');
    expect(out).toContain("url(#arrow)");
  });

  it("removes <use>, <image> and animation elements", () => {
    const out = cleanMermaidSvg(
      wrap('<use href="https://evil.test/x.svg#a"></use><image href="https://evil.test/p.png"></image><animate attributeName="href" values="javascript:1"></animate><set attributeName="href" to="javascript:1"></set>'),
    );
    expect(out).not.toMatch(/<use|<image|<animate|<set/i);
  });

  it("neutralises stylesheets that import or fetch from outside", () => {
    const out = cleanMermaidSvg(
      wrap('<style>@import url("https://evil.test/a.css"); .a{background:url(https://evil.test/p.png)} .b{fill:url(#g)}</style><rect style="fill:url(//evil.test/x)" width="1"></rect>'),
    );
    expect(out).not.toMatch(/evil\.test|@import/i);
    expect(out).toContain("url(#g)");
  });

  it("returns an empty string when there is no diagram or the input is empty", () => {
    expect(cleanMermaidSvg("")).toBe("");
    expect(cleanMermaidSvg("   ")).toBe("");
    expect(cleanMermaidSvg("<div>not a diagram</div>")).toBe("");
  });

  it("is stable: cleaning the result changes nothing", () => {
    const once = cleanMermaidSvg(wrap('<text>a &lt;b&gt; c</text>'));
    expect(cleanMermaidSvg(once)).toBe(once);
  });
});

describe("cleanSvgCss", () => {
  it("drops @import, external url() and expression()", () => {
    expect(cleanSvgCss('@import "x.css"; a{b:url(http://x/y)} c{d:expression(alert(1))}')).not.toMatch(/@import|http:|expression\s*\(/i);
  });
});
