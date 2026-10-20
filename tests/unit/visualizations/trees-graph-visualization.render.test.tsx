import { describe, it, expect } from "vitest";
import { GraphVisualization } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/graph-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("GraphVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(GraphVisualization, { passes: 4 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "010da756",
        "7b983f02",
        "7b983f02",
        "0699880d",
        "9b3a1b0a",
        "0699880d",
        "0699880d",
        "0699880d",
        "ac2816b8",
        "ac2816b8",
        "09287a55",
        "9a1546be",
        "dbef2b5f",
        "dbef2b5f",
        "41da10ed",
        "dbef2b5f",
        "1bab1571",
        "dbef2b5f",
        "dbef2b5f",
        "dbef2b5f",
        "a7ed91a9",
        "cb5ef475",
        "a7339ab6",
        "dbef2b5f",
        "9a1546be",
        "9a1546be",
        "5143ae87",
        "9a1546be",
        "486bffaf",
        "9a1546be",
        "9a1546be",
        "9a1546be",
        "75753420",
        "75753420",
        "09287a55",
        "9a1546be",
        "dbef2b5f",
        "dbef2b5f",
        "41da10ed",
        "dbef2b5f",
        "1bab1571",
        "dbef2b5f",
        "dbef2b5f",
        "dbef2b5f",
        "a7ed91a9",
        "cb5ef475",
        "a7339ab6",
        "dbef2b5f",
        "9a1546be",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(GraphVisualization).hashes).toEqual(renderWalkSim(GraphVisualization).hashes);
  });
});
