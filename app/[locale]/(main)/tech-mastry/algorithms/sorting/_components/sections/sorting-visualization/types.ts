// Types pour la visualisation
export type SortingAlgorithm =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap";

export interface SortingStep {
  array: number[];
  activeIndices: number[];
  comparisons: number;
  swaps: number;
  message: string;
  subArrays?: { start: number; end: number; color: string }[];
  pivotIndex?: number;
  sortedIndices?: number[];
}
