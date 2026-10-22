import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "35fcabdd",
        "35fcabdd",
        "ee08941a",
        "f333420d",
        "0c000a75",
        "a5d83a82",
        "0c000a75",
        "0c000a75",
        "0c000a75",
        "c4838548",
        "c4838548",
        "b6d5925b",
        "29c7d119",
        "54a384c1",
        "f565c547",
        "f565c547",
        "0c063e1b",
        "de5fa9e4",
        "0c063e1b",
        "0c063e1b",
        "0c063e1b",
        "7db0fd0c",
        "7db0fd0c",
        "8019ba25",
        "db218ebf",
        "6d132b04",
        "d9ddd4f6",
        "97ac5adb",
        "08c34fb3",
        "c7962789",
        "d6c5dd10",
        "8f459c8b",
        "86f09e4f",
        "a4d44ffa",
        "259a6b8d",
        "b741307d",
        "c942f0ea",
        "934f3b65",
        "6b57bdf9",
        "daa0ae17",
        "9d7587bf",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
