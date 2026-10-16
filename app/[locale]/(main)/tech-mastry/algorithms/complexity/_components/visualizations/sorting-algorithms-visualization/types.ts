export interface SortingStep {
  type: "bubble" | "merge" | "quick";
  array: number[];
  activeIndices: number[];
  comparisons: number;
  swaps: number;
  message: string;
  subArrays?: { start: number; end: number; color: string }[];
  pivotIndex?: number;
}

export type SortingTab = SortingStep["type"];
