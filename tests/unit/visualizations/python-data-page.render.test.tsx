import { describe, it, expect } from "vitest";
import PythonDataPage from "@/app/[locale]/(main)/tech-mastry/data-science/python-data/page";
import { renderWalk } from "./render-walk";

describe("PythonDataPage rendering", () => {
  it("renders the same markup in every state reachable by clicking", () => {
    const { hashes, states } = renderWalk(PythonDataPage, 2);
    expect(states).toBeGreaterThanOrEqual(10);
    expect(hashes).toMatchInlineSnapshot(`
      [
        "a1e941a1",
        "a1e941a1",
        "0d7c99ee",
        "88ef506f",
        "b1f48870",
        "5002830a",
        "8cc58685",
        "675b0b66",
        "8cc58685",
        "a4a50f15",
        "a4a50f15",
        "2238d0f6",
        "85fd5298",
        "e2094ebd",
        "01abfd7a",
        "1091e569",
        "e407ac29",
        "8b4765de",
        "85fd5298",
        "bca5928b",
        "2be4e4c5",
        "85fd5298",
        "a4a50f15",
        "2238d0f6",
        "85fd5298",
      ]
    `);
  });

  it("is deterministic", () => {
    expect(renderWalk(PythonDataPage).hashes).toEqual(renderWalk(PythonDataPage).hashes);
  });
});
