import { describe, it, expect } from "vitest";
import { CachingVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/caching-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("CachingVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(CachingVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "87ae3ea2",
        "87ae3ea2",
        "ecbc7572",
        "bd7f3d52",
        "91d09818",
        "066c3c4c",
        "91d09818",
        "590d4833",
        "f81cd31a",
        "91d09818",
        "bd7f3d52",
        "54644337",
        "bd7f3d52",
        "cf6857f7",
        "7a5c83c4",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(CachingVisualization).hashes).toEqual(renderWalkSim(CachingVisualization).hashes);
  });
});
