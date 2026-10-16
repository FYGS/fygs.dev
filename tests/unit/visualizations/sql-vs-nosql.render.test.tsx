import { describe, it, expect } from "vitest";
import { SqlVsNoSqlVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql-visualization";
import { renderWalk } from "./render-walk";

describe("SqlVsNoSqlVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(SqlVsNoSqlVisualization);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "4fd075d4",
        "4fd075d4",
        "55c225ab",
        "55c225ab",
        "cd41320c",
        "b02f5c19",
        "38a7321f",
        "4fd075d4",
        "38a7321f",
        "55c225ab",
        "cd41320c",
        "b02f5c19",
        "38a7321f",
        "38a7321f",
        "c02ad41f",
        "5dfabf54",
        "aec93de0",
        "7b8636dd",
        "aec93de0",
        "7980cfbe",
        "7c9b5175",
        "edde64a1",
        "aec93de0",
        "38a7321f",
        "c02ad41f",
        "5dfabf54",
        "aec93de0",
        "c78c7d2b",
        "a537372a",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(SqlVsNoSqlVisualization).hashes).toEqual(
      renderWalk(SqlVsNoSqlVisualization).hashes,
    );
  });
});
