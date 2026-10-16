import type { SortingStep } from "../types";

// Générer les étapes pour le tri fusion
export function generateMergeSortSteps(array: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  // Étape initiale
  steps.push({
    type: "merge",
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Début du tri fusion.",
  });

  // Fonction pour fusionner deux sous-tableaux triés
  const merge = (arr: number[], left: number, mid: number, right: number) => {
    const leftSize = mid - left + 1;
    const rightSize = right - mid;

    // Créer des tableaux temporaires
    const leftArray = arr.slice(left, mid + 1);
    const rightArray = arr.slice(mid + 1, right + 1);

    // Ajouter une étape pour montrer la division
    steps.push({
      type: "merge",
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Division: sous-tableaux [${left}...${mid}] et [${
          mid + 1
        }...${right}].`,
      subArrays: [
        { start: left, end: mid, color: "bg-blue-500/20" },
        { start: mid + 1, end: right, color: "bg-green-500/20" },
      ],
    });

    // Fusionner les tableaux temporaires
    let i = 0,
      j = 0,
      k = left;

    while (i < leftSize && j < rightSize) {
      comparisons++;

      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
        swaps++;
      }

      steps.push({
        type: "merge",
        array: [...arr],
        activeIndices: [k],
        comparisons,
        swaps,
        message: `Fusion: placement de l'élément à l'indice ${k}.`,
        subArrays: [
          { start: left, end: mid, color: "bg-blue-500/20" },
          { start: mid + 1, end: right, color: "bg-green-500/20" },
        ],
      });

      k++;
    }

    // Copier les éléments restants de leftArray, s'il y en a
    while (i < leftSize) {
      arr[k] = leftArray[i];
      i++;
      k++;

      steps.push({
        type: "merge",
        array: [...arr],
        activeIndices: [k - 1],
        comparisons,
        swaps,
        message: `Fusion: copie des éléments restants du sous-tableau gauche.`,
        subArrays: [
          { start: left, end: mid, color: "bg-blue-500/20" },
          { start: mid + 1, end: right, color: "bg-green-500/20" },
        ],
      });
    }

    // Copier les éléments restants de rightArray, s'il y en a
    while (j < rightSize) {
      arr[k] = rightArray[j];
      j++;
      k++;

      steps.push({
        type: "merge",
        array: [...arr],
        activeIndices: [k - 1],
        comparisons,
        swaps,
        message: `Fusion: copie des éléments restants du sous-tableau droit.`,
        subArrays: [
          { start: left, end: mid, color: "bg-blue-500/20" },
          { start: mid + 1, end: right, color: "bg-green-500/20" },
        ],
      });
    }
  };

  // Fonction principale du tri fusion
  const mergeSort = (arr: number[], left: number, right: number) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      // Trier la première moitié
      mergeSort(arr, left, mid);

      // Trier la deuxième moitié
      mergeSort(arr, mid + 1, right);

      // Fusionner les deux moitiés triées
      merge(arr, left, mid, right);
    }
  };

  // Exécuter le tri fusion
  mergeSort(arr, 0, arr.length - 1);

  // Étape finale
  steps.push({
    type: "merge",
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: `Tri terminé en ${comparisons} comparaisons et ${swaps} échanges.`,
  });

  return steps;
}
