import { describe, it, expect } from "vitest";
import { TreesGuide } from "@/app/[locale]/(main)/tech-mastry/data-structures/trees/_components/trees-guide";
import { renderWalkSim } from "./render-walk-sim";

describe("TreesGuide rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalkSim(TreesGuide, { passes: 1 });
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "5f4e00a1",
        "5f4e00a1",
        "8928cc5f",
        "d1dce717",
        "d947916a",
        "b37c3abe",
        "d947916a",
        "d947916a",
        "d947916a",
        "89d7424d",
        "89d7424d",
        "221c8ba7",
        "9104d535",
        "92698d71",
        "b646023b",
        "b646023b",
        "73aaf8a5",
        "336c94ca",
        "73aaf8a5",
        "73aaf8a5",
        "73aaf8a5",
        "47b9e9ef",
        "47b9e9ef",
        "64f39701",
        "a3099649",
        "c9df1eae",
        "ae43db1d",
        "d97796a2",
        "038bd1ab",
        "34f48405",
        "9d72088e",
        "0bdb19f4",
        "f5a635c4",
        "4dcc38f3",
        "88390757",
        "5d0afc4d",
        "a911b496",
        "24edc37c",
        "f4b91064",
        "4abcc08c",
        "e36f88d7",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalkSim(TreesGuide, { passes: 1 }).hashes).toEqual(renderWalkSim(TreesGuide, { passes: 1 }).hashes);
  });
});
