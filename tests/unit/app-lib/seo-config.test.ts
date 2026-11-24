import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

import * as seo from "@/app/_lib/seo-config";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

describe("seo-config (pinned)", () => {
  it("exports the same names", () => {
    expect(Object.keys(seo).sort()).toMatchSnapshot();
  });

  it("COMMON_KEYWORDS", () => {
    expect(seo.COMMON_KEYWORDS).toMatchSnapshot();
  });

  it("sectionSEO keeps its key order", () => {
    expect(Object.keys(seo.sectionSEO)).toMatchSnapshot();
  });

  for (const [key, value] of Object.entries(seo.sectionSEO)) {
    it(`sectionSEO.${key}`, () => {
      expect(hash(value)).toMatchSnapshot();
      expect(value).toMatchObject({ path: expect.any(String) });
    });
  }

  it("whole sectionSEO hash", () => {
    expect(hash(seo.sectionSEO)).toMatchSnapshot();
  });

  it("json-ld generators", () => {
    expect({
      org: seo.getOrganizationJsonLd(),
      site: seo.getWebSiteJsonLd(),
      courses: seo.getCourseListJsonLd(),
      person: seo.getPersonJsonLd(),
      blog: seo.getBlogJsonLd(),
      contact: seo.getContactJsonLd(),
      crumbs: seo.getBreadcrumbJsonLd([
        { name: "Home", url: "https://x.test/" },
        { name: "Blog", url: "https://x.test/blog" },
      ]),
    }).toMatchSnapshot();
  });
});
