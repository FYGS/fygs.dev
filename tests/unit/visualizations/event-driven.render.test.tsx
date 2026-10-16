import { describe, it, expect } from "vitest";
import { EventDrivenVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("EventDrivenVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(EventDrivenVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "948f644a",
        "5addeea8",
        "26267531",
        "26267531",
        "26267531",
        "61711835",
        "3fbd48b8",
        "7bbbf1da",
        "7bbbf1da",
        "23a92a74",
        "bf6e1343",
        "e52e66a3",
        "32107180",
        "bf6e1343",
        "93f076a1",
        "b2c6c11a",
        "f249f3eb",
        "b44af824",
        "7bbbf1da",
        "23a92a74",
        "bf6e1343",
        "d4812601",
        "3c089d0f",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(EventDrivenVisualization).hashes).toEqual(renderWalkSim(EventDrivenVisualization).hashes);
  });
});
