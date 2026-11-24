import { describe, it, expect } from "vitest";
import { DistributedCaseStudies } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/case-studies";
import { renderWalk } from "./render-walk";

describe("DistributedCaseStudies rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(DistributedCaseStudies, 2);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "4e17fd55",
        "3c889398",
        "ff567475",
        "eb711b5e",
        "bd428ee2",
        "9fe594f4",
        "b60d6c6e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(DistributedCaseStudies, 2).hashes).toEqual(
      renderWalk(DistributedCaseStudies, 2).hashes,
    );
  });
});
