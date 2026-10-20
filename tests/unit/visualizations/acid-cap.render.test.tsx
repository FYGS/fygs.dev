import { describe, it, expect } from "vitest";
import { AcidCapVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/acid-cap-visualization";
import { renderWalk } from "./render-walk";

describe("AcidCapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(AcidCapVisualization, 4);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "14ee6e81",
        "14ee6e81",
        "52eae517",
        "52eae517",
        "51c6bf6c",
        "94013b08",
        "94013b08",
        "14ee6e81",
        "94013b08",
        "52eae517",
        "51c6bf6c",
        "94013b08",
        "94013b08",
        "ecf91576",
        "304850fe",
        "14ee6e81",
        "304850fe",
        "a968df15",
        "10b2ec0c",
        "304850fe",
        "94013b08",
        "ecf91576",
        "304850fe",
        "14ee6e81",
        "304850fe",
        "a968df15",
        "10b2ec0c",
        "304850fe",
        "94013b08",
        "ecf91576",
        "304850fe",
        "b1fdff75",
        "ef82aa5d",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(AcidCapVisualization, 4).hashes).toEqual(
      renderWalk(AcidCapVisualization, 4).hashes,
    );
  });
});
