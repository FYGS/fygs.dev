import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "@/lib/jsonld";
import { generateJsonLdScript } from "@/app/_lib/jsonld-utils";

describe("serializeJsonLd", () => {
  it("cannot be ended early by the text it carries", () => {
    const out = serializeJsonLd({ name: `</script><script>alert(1)</script> & <!-- ` });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    expect(out).not.toContain("</script");
  });

  it("is the same JSON for a reader: parsing the output gives back the original", () => {
    const data = { name: `</script>"quoted" & 'single' <b>`, line: "a b c", n: 3, list: ["<", ">", "&"] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it("is used by the helper that builds a whole script element", () => {
    const html = generateJsonLdScript({ "@context": "https://schema.org", "@type": "WebSite", name: "</script><img src=x onerror=1>", url: "https://fygs.dev" } as never);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain("<img");
  });
});
