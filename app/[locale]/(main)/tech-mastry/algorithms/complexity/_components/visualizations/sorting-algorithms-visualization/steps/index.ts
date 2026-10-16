import type { SortingStep, SortingTab } from "../types";
import { generateBubbleSortSteps } from "./bubble-sort";
import { generateMergeSortSteps } from "./merge-sort";
import { generateQuickSortSteps } from "./quick-sort";

// Générer les étapes en fonction de l'onglet actif
export function generateSortingSteps(
  activeTab: SortingTab,
  array: number[]
): SortingStep[] {
  switch (activeTab) {
    case "bubble":
      return generateBubbleSortSteps(array);
    case "merge":
      return generateMergeSortSteps(array);
    case "quick":
      return generateQuickSortSteps(array);
    default:
      return [];
  }
}
