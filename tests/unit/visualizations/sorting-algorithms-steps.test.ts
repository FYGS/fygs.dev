import { createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { generateSortingSteps } from "@/app/[locale]/(main)/tech-mastry/algorithms/complexity/_components/visualizations/sorting-algorithms-visualization/steps";
import type { SortingTab } from "@/app/[locale]/(main)/tech-mastry/algorithms/complexity/_components/visualizations/sorting-algorithms-visualization/types";

const tabs: SortingTab[] = ["bubble", "merge", "quick"];
const input = [34, 7, 23, 32, 5, 62, 32, 7, 1];

describe("complexity sorting step generators", () => {
  it.each(tabs)("%s sort ends sorted, tagged with its own type", (tab) => {
    const steps = generateSortingSteps(tab, input);
    const last = steps[steps.length - 1];
    expect(last.array).toEqual([...input].sort((a, b) => a - b));
    expect(last.message).toMatch(/^Tri terminé en \d+ comparaisons et \d+ échanges\.$/);
    expect(steps.every((s) => s.type === tab)).toBe(true);
    expect(steps[0].array).toEqual(input);
  });

  it("does not mutate its input and handles an empty array", () => {
    const copy = [...input];
    tabs.forEach((tab) => generateSortingSteps(tab, copy));
    expect(copy).toEqual(input);
    tabs.forEach((tab) => {
      const steps = generateSortingSteps(tab, []);
      expect(steps[steps.length - 1].array).toEqual([]);
    });
  });

  it("quick sort marks the pivot and merge sort the sub arrays", () => {
    expect(generateSortingSteps("quick", input).some((s) => s.pivotIndex !== undefined)).toBe(true);
    expect(generateSortingSteps("merge", input).some((s) => s.subArrays?.length === 2)).toBe(true);
  });

  it.each(tabs)("%s sort produces a pinned step list", (tab) => {
    const steps = generateSortingSteps(tab, input);
    const digest = createHash("md5").update(JSON.stringify(steps)).digest("hex").slice(0, 8);
    expect({ count: steps.length, digest }).toMatchSnapshot();
  });
});
