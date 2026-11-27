import { describe, it, expect } from "vitest";
import { AcidCapVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/acid-cap-visualization";
import { renderWalk } from "./render-walk";

describe("AcidCapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(AcidCapVisualization, 4);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "c21e1d9b",
        "c21e1d9b",
        "32b25025",
        "32b25025",
        "27cb6c2a",
        "d4e84bda",
        "d4e84bda",
        "c21e1d9b",
        "d4e84bda",
        "32b25025",
        "27cb6c2a",
        "d4e84bda",
        "d4e84bda",
        "c0264d14",
        "e49dff7c",
        "c21e1d9b",
        "e49dff7c",
        "d705a818",
        "345befae",
        "e49dff7c",
        "d4e84bda",
        "c0264d14",
        "e49dff7c",
        "c21e1d9b",
        "e49dff7c",
        "d705a818",
        "345befae",
        "e49dff7c",
        "d4e84bda",
        "c0264d14",
        "e49dff7c",
        "89712559",
        "5aea7858",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(AcidCapVisualization, 4).hashes).toEqual(
      renderWalk(AcidCapVisualization, 4).hashes,
    );
  });
});
