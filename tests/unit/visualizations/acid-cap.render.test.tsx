import { describe, it, expect } from "vitest";
import { AcidCapVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/acid-cap-visualization";
import { renderWalk } from "./render-walk";

describe("AcidCapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(AcidCapVisualization, 4);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "ff753479",
        "ff753479",
        "e28ea390",
        "e28ea390",
        "8525ded8",
        "7a4f8075",
        "7a4f8075",
        "ff753479",
        "7a4f8075",
        "e28ea390",
        "8525ded8",
        "7a4f8075",
        "7a4f8075",
        "1d4b60d8",
        "86302346",
        "ff753479",
        "86302346",
        "d8646df5",
        "97707ede",
        "86302346",
        "7a4f8075",
        "1d4b60d8",
        "86302346",
        "ff753479",
        "86302346",
        "d8646df5",
        "97707ede",
        "86302346",
        "7a4f8075",
        "1d4b60d8",
        "86302346",
        "2bb9ba81",
        "910ab419",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(AcidCapVisualization, 4).hashes).toEqual(
      renderWalk(AcidCapVisualization, 4).hashes,
    );
  });
});
