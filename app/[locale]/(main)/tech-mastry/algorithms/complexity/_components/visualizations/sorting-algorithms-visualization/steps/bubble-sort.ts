import type { SortingStep } from "../types";

// Générer les étapes pour le tri à bulles
export function generateBubbleSortSteps(array: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  // Étape initiale
  steps.push({
    type: "bubble",
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Début du tri à bulles.",
  });

  // Simuler le tri à bulles
  for (let i = 0; i < arr.length; i++) {
    let swapped = false;

    for (let j = 0; j < arr.length - i - 1; j++) {
      // Comparaison
      comparisons++;
      steps.push({
        type: "bubble",
        array: [...arr],
        activeIndices: [j, j + 1],
        comparisons,
        swaps,
        message: `Comparaison des éléments aux indices ${j} (${arr[j]}) et ${
            j + 1
          } (${arr[j + 1]}).`,
      });

      if (arr[j] > arr[j + 1]) {
        // Échange
        swaps++;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        steps.push({
          type: "bubble",
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
          message: `Échange des éléments aux indices ${j} (${arr[j]}) et ${
              j + 1
            } (${arr[j + 1]}).`,
        });
      }
    }

    // Si aucun échange n'a été fait dans cette passe, le tableau est trié
    if (!swapped) {
      break;
    }
  }

  // Étape finale
  steps.push({
    type: "bubble",
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
  });

  return steps;
}
