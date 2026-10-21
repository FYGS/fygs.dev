import { describe, it, expect } from "vitest";
import { DistributedCaseStudies } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/case-studies";
import { renderWalk } from "./render-walk";

describe("DistributedCaseStudies rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(DistributedCaseStudies, 2);
    expect(states).toBeGreaterThanOrEqual(6);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "95de5513",
        "e8a2092c",
        "6dc0ae93",
        "c7d8bd03",
        "e68fec41",
        "827c429a",
        "ed976ff9",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(DistributedCaseStudies, 2).hashes).toEqual(
      renderWalk(DistributedCaseStudies, 2).hashes,
    );
  });
});
