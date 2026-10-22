import { describe, it, expect } from "vitest";
import { SqlVsNoSqlVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/sql-vs-nosql-visualization";
import { renderWalk } from "./render-walk";

describe("SqlVsNoSqlVisualization rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(SqlVsNoSqlVisualization);
    expect(states).toBeGreaterThanOrEqual(8);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "8959a6de",
        "8959a6de",
        "4c1ae3cc",
        "4c1ae3cc",
        "24fccf89",
        "cf6e9e9a",
        "7e9e1c45",
        "8959a6de",
        "7e9e1c45",
        "4c1ae3cc",
        "24fccf89",
        "cf6e9e9a",
        "7e9e1c45",
        "7e9e1c45",
        "ecdaf6ac",
        "7765a309",
        "c4202847",
        "b0ca4088",
        "c4202847",
        "5da408c8",
        "cda4ce69",
        "c800dd2e",
        "c4202847",
        "7e9e1c45",
        "ecdaf6ac",
        "7765a309",
        "c4202847",
        "31dc5ad3",
        "339af8cf",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(SqlVsNoSqlVisualization).hashes).toEqual(
      renderWalk(SqlVsNoSqlVisualization).hashes,
    );
  });
});
