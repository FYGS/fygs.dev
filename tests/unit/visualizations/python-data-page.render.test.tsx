import { describe, it, expect } from "vitest";
import PythonDataPage from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/page";
import { renderWalk } from "./render-walk";

describe("PythonDataPage rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(PythonDataPage, 2);
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "199bff6e",
        "199bff6e",
        "f7149f74",
        "ae6e0a84",
        "3b3510b7",
        "711e366d",
        "464b12c7",
        "26a5821a",
        "464b12c7",
        "ccf0f5a5",
        "ccf0f5a5",
        "614cd9d0",
        "82c35010",
        "7ebc0c00",
        "d930d09b",
        "7dfd29aa",
        "97cc1200",
        "84018dfc",
        "82c35010",
        "f0851c5b",
        "1750a238",
        "82c35010",
        "ccf0f5a5",
        "614cd9d0",
        "82c35010",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(PythonDataPage).hashes).toEqual(renderWalk(PythonDataPage).hashes);
  });
});
