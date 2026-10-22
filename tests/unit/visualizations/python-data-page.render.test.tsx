import { describe, it, expect } from "vitest";
import PythonDataPage from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/page";
import { renderWalk } from "./render-walk";

describe("PythonDataPage rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(PythonDataPage, 2);
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "a0620a54",
        "a0620a54",
        "798e5597",
        "16660b59",
        "8f79c3ed",
        "872a15a5",
        "5d3a7441",
        "aaa59d37",
        "5d3a7441",
        "e091b58d",
        "e091b58d",
        "1d73c911",
        "14586ca4",
        "981454b8",
        "3fb7def9",
        "3fc8102c",
        "c0ecda39",
        "eb353088",
        "14586ca4",
        "07fc08b6",
        "1e9373d5",
        "14586ca4",
        "e091b58d",
        "1d73c911",
        "14586ca4",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(PythonDataPage).hashes).toEqual(renderWalk(PythonDataPage).hashes);
  });
});
