import { describe, it, expect } from "vitest";
import { SqlVsNoSqlVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql-visualization";
import { renderWalk } from "./render-walk";

describe("SqlVsNoSqlVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(SqlVsNoSqlVisualization);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "728f422c",
        "728f422c",
        "fadaaca0",
        "fadaaca0",
        "823b342e",
        "283b0041",
        "bb2391cf",
        "728f422c",
        "bb2391cf",
        "fadaaca0",
        "823b342e",
        "283b0041",
        "bb2391cf",
        "bb2391cf",
        "9ba5407c",
        "67138f4e",
        "510c0d95",
        "29fe09b5",
        "510c0d95",
        "4d5f6c2f",
        "8139f701",
        "f7415116",
        "510c0d95",
        "bb2391cf",
        "9ba5407c",
        "67138f4e",
        "510c0d95",
        "4dfc1bc9",
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
