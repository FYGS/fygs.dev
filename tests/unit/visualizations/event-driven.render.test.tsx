import { describe, it, expect } from "vitest";
import { EventDrivenVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven-visualization";
import { renderWalkSim } from "./render-walk-sim";

describe("EventDrivenVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(EventDrivenVisualization);
    expect(states).toBeGreaterThanOrEqual(5);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "4769bf26",
        "0eb06e06",
        "fe62ab77",
        "9a98b3c5",
        "9a98b3c5",
        "5e28849e",
        "49d8372a",
        "358320b8",
        "358320b8",
        "08a98c81",
        "74cacc9d",
        "9b0170aa",
        "74cacc9d",
        "74cacc9d",
        "16210679",
        "43a1ae35",
        "4999f814",
        "970ec292",
        "358320b8",
        "08a98c81",
        "74cacc9d",
        "6f1a40fe",
        "e348e549",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(EventDrivenVisualization).hashes).toEqual(renderWalkSim(EventDrivenVisualization).hashes);
  });
});
