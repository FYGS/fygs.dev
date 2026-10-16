/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import { readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));

import { getBlogPost } from "@/lib/mdx";

const slugs = readdirSync("content/blog")
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.replace(/\.mdx$/, ""));

// Every blog post must still compile and render after a change to the MDX stack.
describe("blog posts render", () => {
  for (const slug of slugs) {
    it(slug, async () => {
      const post = await getBlogPost(slug);
      const html = renderToStaticMarkup(createElement("div", null, post.content));
      expect(html.length).toBeGreaterThan(200);
      expect(html).not.toMatch(/Expressions? (are|is) not allowed|Could not parse expression/);
    });
  }
});
