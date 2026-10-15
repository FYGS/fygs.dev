import { describe, it, expect } from "vitest";
import { SqlVsNoSqlVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql-visualization";
import { renderWalk } from "./render-walk";

describe("SqlVsNoSqlVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(SqlVsNoSqlVisualization);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "425b0080",
        "425b0080",
        "06743247",
        "06743247",
        "2584c510",
        "21c99b2e",
        "52772190",
        "425b0080",
        "52772190",
        "06743247",
        "2584c510",
        "21c99b2e",
        "52772190",
        "52772190",
        "1eb4e494",
        "8caaa600",
        "d375d21d",
        "7203207c",
        "d375d21d",
        "fb4eea01",
        "082b584a",
        "6ee6401a",
        "d375d21d",
        "52772190",
        "1eb4e494",
        "8caaa600",
        "d375d21d",
        "589cfe12",
        "4304f402",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(SqlVsNoSqlVisualization).hashes).toEqual(
      renderWalk(SqlVsNoSqlVisualization).hashes,
    );
  });
});
