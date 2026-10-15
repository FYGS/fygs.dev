import { describe, it, expect } from "vitest";
import { DistributedCaseStudies } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/case-studies";
import { renderWalk } from "./render-walk";

describe("DistributedCaseStudies rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(DistributedCaseStudies, 2);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "9f698975",
        "a5aa91e2",
        "ba343059",
        "2c80857d",
        "15d9cf02",
        "da0d56ef",
        "d59eb8e7",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(DistributedCaseStudies, 2).hashes).toEqual(
      renderWalk(DistributedCaseStudies, 2).hashes,
    );
  });
});
