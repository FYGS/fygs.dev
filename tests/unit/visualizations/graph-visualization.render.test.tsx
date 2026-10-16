import { describe, it, expect } from "vitest";
import { GraphVisualization } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("GraphVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(GraphVisualization, { passes: 4 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "3ec9b83f",
        "ac422ea3",
        "ac422ea3",
        "d7c22003",
        "453d70d0",
        "d7c22003",
        "d7c22003",
        "d7c22003",
        "f42d0f1f",
        "f42d0f1f",
        "66d2fa7b",
        "11f23f5e",
        "6088e01d",
        "6088e01d",
        "8acc6879",
        "6088e01d",
        "9ded3ceb",
        "6088e01d",
        "6088e01d",
        "6088e01d",
        "97307c88",
        "5c869571",
        "ec20758c",
        "6088e01d",
        "11f23f5e",
        "11f23f5e",
        "933a244d",
        "11f23f5e",
        "a41db297",
        "11f23f5e",
        "11f23f5e",
        "11f23f5e",
        "7f0a1b43",
        "7f0a1b43",
        "66d2fa7b",
        "11f23f5e",
        "6088e01d",
        "6088e01d",
        "8acc6879",
        "6088e01d",
        "9ded3ceb",
        "6088e01d",
        "6088e01d",
        "6088e01d",
        "97307c88",
        "5c869571",
        "ec20758c",
        "6088e01d",
        "11f23f5e",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(GraphVisualization).hashes).toEqual(renderWalkSim(GraphVisualization).hashes);
  });
});
