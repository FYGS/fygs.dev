import { describe, it, expect } from "vitest";
import { DistributedCaseStudies } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/case-studies";
import { renderWalk } from "./render-walk";

describe("DistributedCaseStudies rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(DistributedCaseStudies, 2);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "aa60cfdf",
        "98777d18",
        "9ce51667",
        "2aca3d1f",
        "627ddb36",
        "0540cdcf",
        "52a277e9",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(DistributedCaseStudies, 2).hashes).toEqual(
      renderWalk(DistributedCaseStudies, 2).hashes,
    );
  });
});
