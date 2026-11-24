import type { SortingAlgorithm, SortingStep } from "../types";
import { generateBubbleSortSteps } from "./bubble-sort";
import { generateHeapSortSteps } from "./heap-sort";
import { generateInsertionSortSteps } from "./insertion-sort";
import { generateMergeSortSteps } from "./merge-sort";
import { generateQuickSortSteps } from "./quick-sort";
import { generateSelectionSortSteps } from "./selection-sort";

// Générer les étapes en fonction de l'algorithme sélectionné
export function generateSortingSteps(
  algorithm: SortingAlgorithm,
  array: number[]
): SortingStep[] {
  switch (algorithm) {
    case "bubble":
      return generateBubbleSortSteps(array);
    case "selection":
      return generateSelectionSortSteps(array);
    case "insertion":
      return generateInsertionSortSteps(array);
    case "merge":
      return generateMergeSortSteps(array);
    case "quick":
      return generateQuickSortSteps(array);
    case "heap":
      return generateHeapSortSteps(array);
    default:
      return generateBubbleSortSteps(array);
  }
}
