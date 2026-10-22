import { describe, it, expect } from "vitest";
import { AcidCapVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/acid-cap-visualization";
import { renderWalk } from "./render-walk";

describe("AcidCapVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(AcidCapVisualization, 4);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "7d055a14",
        "7d055a14",
        "72c19a1f",
        "72c19a1f",
        "188dfaa4",
        "56c5fa1a",
        "56c5fa1a",
        "7d055a14",
        "56c5fa1a",
        "72c19a1f",
        "188dfaa4",
        "56c5fa1a",
        "56c5fa1a",
        "2f0c323c",
        "0b918724",
        "7d055a14",
        "0b918724",
        "763b3938",
        "a14c9c95",
        "0b918724",
        "56c5fa1a",
        "2f0c323c",
        "0b918724",
        "7d055a14",
        "0b918724",
        "763b3938",
        "a14c9c95",
        "0b918724",
        "56c5fa1a",
        "2f0c323c",
        "0b918724",
        "50c3d414",
        "01533893",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(AcidCapVisualization, 4).hashes).toEqual(
      renderWalk(AcidCapVisualization, 4).hashes,
    );
  });
});
