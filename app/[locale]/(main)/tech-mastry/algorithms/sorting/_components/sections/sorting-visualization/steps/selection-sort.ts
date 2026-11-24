import type { SortingStep } from "../types";

// Générer les étapes pour le tri par sélection
export function generateSelectionSortSteps(array: number[]): SortingStep[] {
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
    message: "Début du tri par sélection.",
    sortedIndices: [...sortedIndices],
  });

  // Simuler le tri par sélection
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;

    // Trouver le minimum dans le reste du tableau
    steps.push({
      array: [...arr],
      activeIndices: [minIndex],
      comparisons,
      swaps,
      message: `Recherche du minimum à partir de l'indice ${i}.`,
      sortedIndices: [...sortedIndices],
    });

    for (let j = i + 1; j < arr.length; j++) {
      // Comparaison
      comparisons++;
      steps.push({
        array: [...arr],
        activeIndices: [minIndex, j],
        comparisons,
        swaps,
        message: `Comparaison des éléments aux indices ${minIndex} (${arr[minIndex]}) et ${j} (${arr[j]}).`,
        sortedIndices: [...sortedIndices],
      });

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
        steps.push({
          array: [...arr],
          activeIndices: [minIndex],
          comparisons,
          swaps,
          message: `Nouveau minimum trouvé à l'indice ${minIndex} (${arr[minIndex]}).`,
          sortedIndices: [...sortedIndices],
        });
      }
    }

    // Échanger le minimum avec le premier élément non trié
    if (minIndex !== i) {
      swaps++;
      steps.push({
        array: [...arr],
        activeIndices: [i, minIndex],
        comparisons,
        swaps,
        message: `Échange des éléments aux indices ${i} (${arr[i]}) et ${minIndex} (${arr[minIndex]}).`,
        sortedIndices: [...sortedIndices],
      });

      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

      steps.push({
        array: [...arr],
        activeIndices: [i, minIndex],
        comparisons,
        swaps,
        message: `Après échange: éléments aux indices ${i} (${arr[i]}) et ${minIndex} (${arr[minIndex]}).`,
        sortedIndices: [...sortedIndices],
      });
    }

    // Marquer l'élément comme trié
    sortedIndices.push(i);
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `L'élément à l'indice ${i} est maintenant à sa position finale.`,
      sortedIndices: [...sortedIndices],
    });
  }

  // Marquer le dernier élément comme trié
  sortedIndices.push(arr.length - 1);

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
