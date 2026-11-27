import { describe, it, expect } from "vitest";
import { SqlVsNoSqlVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql-visualization";
import { renderWalk } from "./render-walk";

describe("SqlVsNoSqlVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(SqlVsNoSqlVisualization);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "f0d4061e",
        "f0d4061e",
        "64eb5746",
        "64eb5746",
        "5fcbb697",
        "630340c9",
        "c1fd3a35",
        "f0d4061e",
        "c1fd3a35",
        "64eb5746",
        "5fcbb697",
        "630340c9",
        "c1fd3a35",
        "c1fd3a35",
        "18494657",
        "a76499fb",
        "6e9f2b2c",
        "5191ce4a",
        "6e9f2b2c",
        "84198c1c",
        "42c46e26",
        "0d8a6082",
        "6e9f2b2c",
        "c1fd3a35",
        "18494657",
        "a76499fb",
        "6e9f2b2c",
        "e44cc8cf",
        "9e39cd5f",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(SqlVsNoSqlVisualization).hashes).toEqual(
      renderWalk(SqlVsNoSqlVisualization).hashes,
    );
  });
});
