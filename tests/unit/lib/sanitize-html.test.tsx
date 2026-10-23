/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LessonContentRenderer } from "@/components/learning/lesson-content-renderer";

const html = (content: string) => render(<LessonContentRenderer content={content} />).container;

describe("lesson HTML is reduced to a white list", () => {
  it("keeps what the editor produces: titles, lists, code, quotes, tables, links, images, video", () => {
    const c = html(`
<h2>Titre</h2><p>Texte <strong>fort</strong> et <em>penché</em> avec <a href="https://exemple.fr/page">un lien</a>.</p>
<ul><li>un</li><li>deux</li></ul><ol start="3"><li>trois</li></ol>
<blockquote>Citation</blockquote>
<table><thead><tr><th colspan="2">T</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table>
<video controls src="https://cdn.exemple.fr/v.mp4" poster="/p.png"></video>
<pre><code class="language-ts">const a = 1;</code></pre>`);
    expect(c.querySelector("h2")?.textContent).toBe("Titre");
    expect(c.querySelectorAll("li")).toHaveLength(3);
    expect(c.querySelector("ol")?.getAttribute("start")).toBe("3");
    expect(c.querySelector("blockquote")).toBeTruthy();
    expect(c.querySelector("th")?.getAttribute("colspan")).toBe("2");
    expect(c.querySelectorAll("td")).toHaveLength(2);
    expect(c.querySelector("video")?.getAttribute("src")).toBe("https://cdn.exemple.fr/v.mp4");
    expect(c.querySelector("a")?.getAttribute("href")).toBe("https://exemple.fr/page");
    expect(c.textContent).toContain("const a = 1;");
  });

  it("removes scripts, styles, forms, event handlers and inline styles", () => {
    const c = html(`<p onclick="steal()" style="position:fixed" data-x="1">ok</p><script>alert(1)</script><style>*{display:none}</style><form><input name="x"><button>go</button></form><img src="/a.png" alt="a" onerror="steal()">`);
    expect(c.querySelector("script, style, form, button")).toBeNull();
    const p = c.querySelector("p")!;
    expect(p.textContent).toBe("ok");
    expect(p.hasAttribute("onclick")).toBe(false);
    expect(p.hasAttribute("style")).toBe(false);
    expect(p.hasAttribute("data-x")).toBe(false);
    expect(c.querySelector("img")?.hasAttribute("onerror")).toBe(false);
    expect(c.innerHTML).not.toContain("steal");
    expect(c.innerHTML).not.toContain("alert(1)");
    expect(c.querySelector("input")).toBeNull(); // only task list check boxes are kept
  });

  it("drops dangerous addresses, however they are written", () => {
    const c = html(`<a href="javascript:alert(1)">a</a> <a href="  JaVa\nScRiPt:alert(2)">b</a> <a href="data:text/html;base64,AAAA">c</a> <img src="data:image/svg+xml;base64,AAAA" alt="d"> <video src="javascript:x"></video> <a href="/ok">e</a> <a href="#ancre">f</a> <a href="mailto:a@b.fr">g</a>`);
    const hrefs = [...c.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    // dangerous ones are replaced by "#"; the good ones stay
    expect(hrefs.some((h) => /javascript|data:/i.test(h ?? ""))).toBe(false);
    expect(hrefs).toEqual(expect.arrayContaining(["/ok", "#ancre", "mailto:a@b.fr"]));
    expect(c.querySelector("img")).toBeNull();
    expect(c.querySelector("video")?.hasAttribute("src")).toBe(false);
  });

  it("keeps the text of an unknown element but not the element, and no comment", () => {
    const c = html(`<blink>texte</blink><!-- secret --><marquee>défile</marquee>`);
    expect(c.querySelector("blink, marquee")).toBeNull();
    expect(c.textContent).toContain("texte");
    expect(c.textContent).toContain("défile");
    expect(c.innerHTML).not.toContain("secret");
  });

  it("allows an embed only from the known video hosts, over https", () => {
    const ok = html(`<iframe src="https://www.youtube-nocookie.com/embed/abc" allowfullscreen></iframe>`);
    expect(ok.querySelector("iframe")?.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/abc");
    const bad = html(`<iframe src="https://evil.example/x"></iframe><iframe src="http://www.youtube.com/embed/abc"></iframe><iframe srcdoc="<script>1</script>"></iframe>`);
    expect(bad.querySelector("iframe")).toBeNull();
  });

  it("makes links that open a new tab safe", () => {
    const c = html(`<a href="https://exemple.fr" target="_blank">x</a>`);
    expect(c.querySelector("a")?.getAttribute("rel")).toContain("noopener");
  });

  it("keeps task list check boxes of GitHub Markdown, disabled", () => {
    const c = html("- [x] fait\n- [ ] à faire");
    const boxes = [...c.querySelectorAll("input")];
    expect(boxes).toHaveLength(2);
    expect(boxes.every((b) => b.disabled && b.type === "checkbox")).toBe(true);
  });

  it("only lets known class names through", () => {
    const c = html(`<p class="fixed inset-0 z-50">x</p><pre><code class="language-ts hljs evil">y</code></pre>`);
    expect(c.querySelector("p")?.hasAttribute("class")).toBe(false);
    expect(c.querySelector("code")?.className ?? "").not.toContain("evil");
  });
});
