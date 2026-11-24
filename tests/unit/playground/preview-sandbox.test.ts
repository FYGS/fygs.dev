import { describe, expect, it } from "vitest";

import { previewSandbox } from "@/app/_lib/preview-sandbox";

const SITE = "https://fygs.dev";

describe("previewSandbox", () => {
  it("never grants allow-same-origin to a page built from the learner's own code", () => {
    expect(previewSandbox(null, SITE)).toBe("allow-scripts allow-modals allow-forms");
  });

  it("grants it to a dev server on another origin", () => {
    expect(previewSandbox("https://abc--3000--123.local-credentialless.webcontainer-api.io", SITE)).toContain("allow-same-origin");
  });

  it("refuses it for the origin of the site itself, whatever the path", () => {
    expect(previewSandbox("https://fygs.dev/anything", SITE)).not.toContain("allow-same-origin");
  });

  it("refuses it for http, for an address that does not parse and when the site origin is unknown", () => {
    expect(previewSandbox("http://abc.example", SITE)).not.toContain("allow-same-origin");
    expect(previewSandbox("not a url", SITE)).not.toContain("allow-same-origin");
    expect(previewSandbox("https://abc.example", "")).not.toContain("allow-same-origin");
  });
});
