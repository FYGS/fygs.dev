import type { SortingStep } from "../types";

// Générer les étapes pour le tri rapide
export function generateQuickSortSteps(array: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  // Étape initiale
  steps.push({
    type: "quick",
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Début du tri rapide.",
  });

  // Fonction de partition
  const partition = (arr: number[], low: number, high: number) => {
    // Choisir le pivot (dernier élément)
    const pivot = arr[high];

    steps.push({
      type: "quick",
      array: [...arr],
      activeIndices: [high],
      comparisons,
      swaps,
      message: `Choix du pivot: ${pivot} (indice ${high}).`,
      pivotIndex: high,
      subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
    });

    // Index du plus petit élément
    let i = low - 1;

    for (let j = low; j < high; j++) {
      // Comparer l'élément courant avec le pivot
      comparisons++;

      steps.push({
        type: "quick",
        array: [...arr],
        activeIndices: [j, high],
        comparisons,
        swaps,
        message: `Comparaison de l'élément ${arr[j]} (indice ${j}) avec le pivot ${pivot}.`,
        pivotIndex: high,
        subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
      });

      // Si l'élément courant est plus petit que le pivot
      if (arr[j] < pivot) {
        i++;

        // Échanger arr[i] et arr[j]
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;

        steps.push({
          type: "quick",
          array: [...arr],
          activeIndices: [i, j],
          comparisons,
          swaps,
          message: `Échange des éléments aux indices ${i} (${arr[i]}) et ${j} (${arr[j]}).`,
          pivotIndex: high,
          subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
        });
      }
    }

    // Échanger arr[i+1] et arr[high] (placer le pivot à sa position finale)
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;

    steps.push({
      type: "quick",
      array: [...arr],
      activeIndices: [i + 1, high],
      comparisons,
      swaps,
      message: `Placement du pivot à sa position finale (indice ${i + 1}).`,
      pivotIndex: i + 1,
      subArrays: [{ start: low, end: high, color: "bg-purple-500/20" }],
    });

    return i + 1;
  };

  // Fonction principale du tri rapide
  const quickSort = (arr: number[], low: number, high: number) => {
    if (low < high) {
      // Obtenir l'indice de partition
      const pi = partition(arr, low, high);

      // Trier les éléments avant et après la partition
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  };

  // Exécuter le tri rapide
  quickSort(arr, 0, arr.length - 1);

  // Étape finale
  steps.push({
    type: "quick",
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
  });

  return steps;
}
