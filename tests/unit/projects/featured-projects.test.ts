import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

import { FEATURED_PROJECTS } from "@/app/[locale]/(main)/projects/data";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

describe("FEATURED_PROJECTS (pinned)", () => {
  it("keeps count, ids order and whole-array hash", () => {
    expect(FEATURED_PROJECTS.map((p) => p.id)).toMatchSnapshot();
    expect(hash(FEATURED_PROJECTS)).toMatchSnapshot();
  });

  for (const p of FEATURED_PROJECTS) {
    it(`project ${p.id}`, () => {
      expect(hash(p)).toMatchSnapshot();
      expect(Object.keys(p)).toMatchSnapshot();
    });
  }
});
