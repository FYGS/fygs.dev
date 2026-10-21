import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "989b0385",
        "989b0385",
        "72142dad",
        "9ff19c4d",
        "d9b7c4a1",
        "9b49c565",
        "d9b7c4a1",
        "d9b7c4a1",
        "d9b7c4a1",
        "41b0fa24",
        "41b0fa24",
        "e72e5215",
        "d613355a",
        "7d447b0f",
        "6543030a",
        "6543030a",
        "98991c37",
        "1e412f79",
        "98991c37",
        "98991c37",
        "98991c37",
        "6d2a207d",
        "6d2a207d",
        "e0bfff6b",
        "9d86df26",
        "799cfe60",
        "9c9581ca",
        "bd30fae8",
        "f4cec1ef",
        "9fea20e9",
        "a3751b18",
        "dc288ae7",
        "c41b890d",
        "966a6966",
        "2772d074",
        "2510a7f9",
        "9d9afb39",
        "b860e700",
        "364e974d",
        "da941dbc",
        "a745d25d",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
