import { describe, expect, it } from "vitest";
import { slideContentToHtml } from "@/lib/visual-support-slide";

describe("slideContentToHtml", () => {
  it("keeps an HTML string as it is", () => {
    expect(slideContentToHtml("<p>Bonjour</p>")).toBe("<p>Bonjour</p>");
  });

  it("turns the structured sections of the seed into HTML, never into [object Object]", () => {
    const html = slideContentToHtml({
      sections: [
        { title: "Client-Side Rendering (CSR)", description: "Rendu côté client", pros: ["Interactivité riche"], cons: ["SEO difficile"] },
        { title: "Static Site Generation (SSG)" },
      ],
    });

    expect(html).not.toContain("[object Object]");
    expect(html).toContain("Client-Side Rendering (CSR)");
    expect(html).toContain("Interactivité riche");
    expect(html).toContain("SEO difficile");
    expect(html).toContain("Static Site Generation (SSG)");
  });

  it("escapes what the sections contain", () => {
    const html = slideContentToHtml({ sections: [{ title: "<img src=x onerror=alert(1)>", pros: ['"quoted" & <b>bold</b>'] }] });

    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&quot;quoted&quot; &amp; &lt;b&gt;bold&lt;/b&gt;");
  });

  it("gives an empty slide for anything it does not understand", () => {
    for (const value of [null, undefined, 42, {}, { sections: "nope" }, { sections: [] }, { sections: [null, 3] }]) {
      expect(slideContentToHtml(value), JSON.stringify(value)).toBe("");
    }
  });
});
