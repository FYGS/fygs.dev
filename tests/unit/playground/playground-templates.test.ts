import { createHash } from "crypto";
import { describe, expect, it } from "vitest";

import {
  getTemplateById,
  getTemplatesByCategory,
  playgroundTemplates,
} from "@/app/[locale]/(main)/tech-mastry/playground/_config/playground-templates";

const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");

describe("playground-templates (pinned)", () => {
  it("keeps ids in order", () => {
    expect(playgroundTemplates.map((t) => t.id)).toMatchSnapshot();
  });

  it("keeps the whole array identical", () => {
    expect(hash(playgroundTemplates)).toMatchSnapshot();
  });

  for (const t of playgroundTemplates) {
    it(`template ${t.id}`, () => {
      expect(hash(t)).toMatchSnapshot();
      expect(t.files.map((f) => `${f.path}:${hash(f)}`)).toMatchSnapshot();
      expect(hash(Object.keys(t))).toMatchSnapshot();
    });
  }

  it("lookup helpers", () => {
    expect(getTemplateById("python")?.id).toBe("python");
    expect(getTemplateById("nope")).toBeUndefined();
    for (const c of new Set(playgroundTemplates.map((t) => t.category))) {
      expect(getTemplatesByCategory(c).map((t) => t.id)).toMatchSnapshot();
    }
    expect(getTemplatesByCategory("zzz")).toEqual([]);
  });
});
