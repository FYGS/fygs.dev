import { describe, it, expect } from "vitest";
import { applySearchStep } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-visualization/apply-step";
import {
  binarySearch,
  interpolationSearch,
  jumpSearch,
  linearSearch,
} from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-visualization/search-algorithms";
import type { ArrayElement } from "@/app/[locale]/(main)/tech-mastry/algorithms/searching/_components/sections/searching-visualization/types";

const sorted = [3, 8, 15, 21, 34, 42, 55, 67, 79, 91];
const toElements = (values: number[]): ArrayElement[] => values.map((value) => ({ value, state: "default" }));
const states = (elements: ArrayElement[]) => elements.map((e) => e.state);

describe("search algorithms", () => {
  it("linear search scans until the target", () => {
    const { steps, found, foundIndex } = linearSearch(toElements([5, 9, 2, 7]), 2);
    expect(steps.map((s) => s.index)).toEqual([0, 1, 2]);
    expect(steps.map((s) => s.state)).toEqual(["searching", "searching", "found"]);
    expect([found, foundIndex]).toEqual([true, 2]);
    const miss = linearSearch(toElements([5, 9]), 1);
    expect(miss.found).toBe(false);
    expect(miss.steps[miss.steps.length - 1]).toEqual({ index: -1, state: "not-found" });
  });

  it("binary search halves the range", () => {
    const hit = binarySearch(toElements(sorted), 67);
    expect(hit.steps.map((s) => s.mid)).toEqual([4, 7]);
    expect([hit.found, hit.foundIndex]).toEqual([true, 7]);
    const miss = binarySearch(toElements(sorted), 40);
    expect(miss.found).toBe(false);
    expect(miss.steps[miss.steps.length - 1]).toMatchObject({ mid: -1, state: "not-found" });
  });

  it("jump search jumps by blocks then scans the block", () => {
    const hit = jumpSearch(toElements(sorted), 55);
    expect([hit.found, hit.foundIndex]).toEqual([true, 6]);
    expect(hit.steps[0]).toMatchObject({ prev: 0, current: 2, blockSearch: true });
    expect(hit.steps.some((s) => "message" in s)).toBe(true);
    expect(jumpSearch(toElements(sorted), 40).found).toBe(false);
  });

  it("interpolation search estimates the position and reports its formula", () => {
    const hit = interpolationSearch(toElements(sorted), 42);
    expect(hit.found).toBe(true);
    expect(hit.steps[0].formula).toBe("pos = 0 + floor((9 - 0) * (42 - 3) / (91 - 3))");
    expect(interpolationSearch(toElements(sorted), 1000).steps).toEqual([{ state: "not-found" }]);
  });
});

describe("applySearchStep", () => {
  it("marks the visited prefix and the found element for linear steps", () => {
    const next = applySearchStep(toElements([1, 2, 3, 4]), { index: 2, state: "found" }, "linear", () => {});
    expect(states(next)).toEqual(["searching", "searching", "found", "default"]);
  });

  it("marks the search range around mid for binary steps and everything on not-found", () => {
    const next = applySearchStep(toElements([1, 2, 3, 4, 5]), { left: 1, right: 3, mid: 2, state: "searching" }, "binary", () => {});
    expect(states(next)).toEqual(["default", "current", "searching", "current", "default"]);
    const none = applySearchStep(toElements([1, 2]), { left: 0, right: 1, mid: -1, state: "not-found" }, "binary", () => {});
    expect(states(none)).toEqual(["not-found", "not-found"]);
  });

  it("highlights blocks for jump steps and publishes the formula for interpolation steps", () => {
    const jump = applySearchStep(toElements([1, 2, 3, 4, 5]), { prev: 2, current: 3, blockSearch: true, state: "searching" }, "jump", () => {});
    expect(states(jump)).toEqual(["searching", "searching", "current", "searching", "default"]);
    let published = "";
    const inter = applySearchStep(
      toElements([1, 2, 3, 4]),
      { low: 0, high: 3, pos: 1, state: "searching", formula: "f" },
      "interpolation",
      (text) => (published = text),
    );
    expect(states(inter)).toEqual(["current", "searching", "current", "current"]);
    expect(published).toBe("Formule: f");
  });

  it("does not mutate the previous array", () => {
    const prev = toElements([1, 2, 3]);
    applySearchStep(prev, { index: 1, state: "found" }, "linear", () => {});
    expect(states(prev)).toEqual(["default", "default", "default"]);
  });
});
