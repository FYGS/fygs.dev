import { describe, it, expect } from "vitest";
import { SqlVsNoSqlVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql-visualization";
import { renderWalk } from "./render-walk";

describe("SqlVsNoSqlVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(SqlVsNoSqlVisualization);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8d218768",
        "8d218768",
        "534460e8",
        "534460e8",
        "5182d627",
        "9e5a3864",
        "3735b998",
        "8d218768",
        "3735b998",
        "534460e8",
        "5182d627",
        "9e5a3864",
        "3735b998",
        "3735b998",
        "86c6cfab",
        "9fe78811",
        "917a5e36",
        "5ec63989",
        "917a5e36",
        "dc9ced67",
        "a7abe1b1",
        "7ddfe980",
        "917a5e36",
        "3735b998",
        "86c6cfab",
        "9fe78811",
        "917a5e36",
        "0115eda2",
        "a56c4744",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(SqlVsNoSqlVisualization).hashes).toEqual(
      renderWalk(SqlVsNoSqlVisualization).hashes,
    );
  });
});
