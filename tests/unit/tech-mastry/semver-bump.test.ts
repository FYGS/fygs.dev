import { describe, expect, it } from "vitest";
import { bumpSemver } from "@/app/[locale]/(main)/tech-mastry/_utils/semver-bump";

describe("bumpSemver", () => {
  const v = { major: 1, minor: 4, patch: 2 };

  it("MAJOR remet MINOR et PATCH à 0", () => {
    expect(bumpSemver(v, "major")).toEqual({ major: 2, minor: 0, patch: 0 });
  });

  it("MINOR remet PATCH à 0 et conserve MAJOR", () => {
    expect(bumpSemver(v, "minor")).toEqual({ major: 1, minor: 5, patch: 0 });
  });

  it("PATCH n'incrémente que PATCH", () => {
    expect(bumpSemver(v, "patch")).toEqual({ major: 1, minor: 4, patch: 3 });
  });

  it("ne mute pas la version d'origine", () => {
    bumpSemver(v, "major");
    expect(v).toEqual({ major: 1, minor: 4, patch: 2 });
  });
});
