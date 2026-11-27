import { describe, it, expect } from "vitest";
import { GraphVisualization } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("GraphVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(GraphVisualization, { passes: 4 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "e9fcc4ec",
        "03f022e0",
        "03f022e0",
        "ae4288cc",
        "94abd442",
        "ae4288cc",
        "ae4288cc",
        "ae4288cc",
        "8cacb5de",
        "8cacb5de",
        "49f00491",
        "53520c99",
        "cdb7f5bb",
        "cdb7f5bb",
        "5b194c99",
        "cdb7f5bb",
        "19fc55b5",
        "cdb7f5bb",
        "cdb7f5bb",
        "cdb7f5bb",
        "eda9c906",
        "ac16d29f",
        "12c3b062",
        "cdb7f5bb",
        "53520c99",
        "53520c99",
        "0060b2eb",
        "53520c99",
        "1d0ff1f2",
        "53520c99",
        "53520c99",
        "53520c99",
        "ba802426",
        "ba802426",
        "49f00491",
        "53520c99",
        "cdb7f5bb",
        "cdb7f5bb",
        "5b194c99",
        "cdb7f5bb",
        "19fc55b5",
        "cdb7f5bb",
        "cdb7f5bb",
        "cdb7f5bb",
        "eda9c906",
        "ac16d29f",
        "12c3b062",
        "cdb7f5bb",
        "53520c99",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(GraphVisualization).hashes).toEqual(renderWalkSim(GraphVisualization).hashes);
  });
});
