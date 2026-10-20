import { describe, it, expect } from "vitest";
import { DistributedCaseStudies } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/case-studies";
import { renderWalk } from "./render-walk";

describe("DistributedCaseStudies rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(DistributedCaseStudies, 2);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "156cfd7a",
        "dc604f0d",
        "d5e354bc",
        "b15abcb3",
        "e0a12dd2",
        "515834a6",
        "5b2c2c20",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(DistributedCaseStudies, 2).hashes).toEqual(
      renderWalk(DistributedCaseStudies, 2).hashes,
    );
  });
});
