import { describe, it, expect } from "vitest";
import { AcidCapVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/acid-cap-visualization";
import { renderWalk } from "./render-walk";

describe("AcidCapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(AcidCapVisualization, 4);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "50affade",
        "50affade",
        "d976e5d7",
        "d976e5d7",
        "a9ad9fd4",
        "dc523d29",
        "dc523d29",
        "50affade",
        "dc523d29",
        "d976e5d7",
        "a9ad9fd4",
        "dc523d29",
        "dc523d29",
        "237132b0",
        "07e3e61d",
        "50affade",
        "07e3e61d",
        "682d5757",
        "f94720e2",
        "07e3e61d",
        "dc523d29",
        "237132b0",
        "07e3e61d",
        "50affade",
        "07e3e61d",
        "682d5757",
        "f94720e2",
        "07e3e61d",
        "dc523d29",
        "237132b0",
        "07e3e61d",
        "aca0b4ef",
        "71e75d3e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(AcidCapVisualization, 4).hashes).toEqual(
      renderWalk(AcidCapVisualization, 4).hashes,
    );
  });
});
