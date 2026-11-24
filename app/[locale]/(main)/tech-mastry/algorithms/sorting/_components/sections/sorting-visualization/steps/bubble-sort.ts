import type { SortingStep } from "../types";

// Générer les étapes pour le tri à bulles
export function generateBubbleSortSteps(array: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices: number[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Début du tri à bulles.",
    sortedIndices: [...sortedIndices],
  });

  // Simuler le tri à bulles
  for (let i = 0; i < arr.length; i++) {
    let swapped = false;

    for (let j = 0; j < arr.length - i - 1; j++) {
      // Comparaison
      comparisons++;
      steps.push({
        array: [...arr],
        activeIndices: [j, j + 1],
        comparisons,
        swaps,
        message: `Comparaison des éléments aux indices ${j} (${arr[j]}) et ${
          j + 1
        } (${arr[j + 1]}).`,
        sortedIndices: [...sortedIndices],
      });

      if (arr[j] > arr[j + 1]) {
        // Échange
        swaps++;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        steps.push({
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
          message: `Échange des éléments aux indices ${j} (${arr[j]}) et ${
            j + 1
          } (${arr[j + 1]}).`,
          sortedIndices: [...sortedIndices],
        });
      }
    }

    // Marquer l'élément comme trié
    sortedIndices.push(arr.length - i - 1);

    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `L'élément à l'indice ${
        arr.length - i - 1
      } est maintenant à sa position finale.`,
      sortedIndices: [...sortedIndices],
    });

    // Si aucun échange n'a été fait dans cette passe, le tableau est trié
    if (!swapped) {
      // Marquer tous les éléments restants comme triés
      for (let k = 0; k < arr.length - i - 1; k++) {
        if (!sortedIndices.includes(k)) {
          sortedIndices.push(k);
        }
      }

      break;
    }
  }

  // Étape finale
  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
  });

  return steps;
}
