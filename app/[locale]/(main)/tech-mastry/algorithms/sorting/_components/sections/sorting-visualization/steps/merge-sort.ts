import type { SortingStep } from "../types";

// Générer les étapes pour le tri fusion
export function generateMergeSortSteps(array: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Début du tri fusion (Merge Sort).",
    sortedIndices: [],
  });

  // Fonction récursive pour le tri fusion
  const mergeSort = (
    start: number,
    end: number,
    depth: number = 0
  ): number[] => {
    // Si le sous-tableau ne contient qu'un seul élément, il est déjà trié
    if (start >= end) {
      return [start];
    }

    // Diviser le tableau en deux moitiés
    const mid = Math.floor((start + end) / 2);

    // Ajouter une étape pour montrer la division
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Division du sous-tableau [${start}..${end}] en [${start}..${mid}] et [${
        mid + 1
      }..${end}].`,
      subArrays: [{ start, end, color: "blue" }],
    });

    // Trier récursivement les deux moitiés
    mergeSort(start, mid, depth + 1);
    mergeSort(mid + 1, end, depth + 1);

    // Fusionner les deux moitiés triées
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Fusion des sous-tableaux [${start}..${mid}] et [${
        mid + 1
      }..${end}].`,
      subArrays: [
        { start, end: mid, color: "green" },
        { start: mid + 1, end, color: "purple" },
      ],
    });

    // Créer des tableaux temporaires pour la fusion
    const leftArr = arr.slice(start, mid + 1);
    const rightArr = arr.slice(mid + 1, end + 1);

    let i = 0,
      j = 0,
      k = start;
    const sortedIndices: number[] = [];

    // Fusionner les deux moitiés
    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;

      steps.push({
        array: [...arr],
        activeIndices: [start + i, mid + 1 + j],
        comparisons,
        swaps,
        message: `Comparaison de ${leftArr[i]} et ${rightArr[j]}.`,
        subArrays: [
          { start, end: mid, color: "green" },
          { start: mid + 1, end, color: "purple" },
        ],
      });

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        sortedIndices.push(k);
        i++;
      } else {
        arr[k] = rightArr[j];
        sortedIndices.push(k);
        j++;
        swaps++; // Compter comme un échange car l'ordre est modifié
      }

      steps.push({
        array: [...arr],
        activeIndices: [k],
        comparisons,
        swaps,
        message: `Placement de ${arr[k]} à l'indice ${k}.`,
        subArrays: [
          { start, end: mid, color: "green" },
          { start: mid + 1, end, color: "purple" },
        ],
      });

      k++;
    }

    // Copier les éléments restants de leftArr
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      sortedIndices.push(k);

      steps.push({
        array: [...arr],
        activeIndices: [k],
        comparisons,
        swaps,
        message: `Copie de l'élément restant ${leftArr[i]} de la moitié gauche à l'indice ${k}.`,
        subArrays: [
          { start, end: mid, color: "green" },
          { start: mid + 1, end, color: "purple" },
        ],
      });

      i++;
      k++;
    }

    // Copier les éléments restants de rightArr
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      sortedIndices.push(k);

      steps.push({
        array: [...arr],
        activeIndices: [k],
        comparisons,
        swaps,
        message: `Copie de l'élément restant ${rightArr[j]} de la moitié droite à l'indice ${k}.`,
        subArrays: [
          { start, end: mid, color: "green" },
          { start: mid + 1, end, color: "purple" },
        ],
      });

      j++;
      k++;
    }

    // Ajouter une étape pour montrer le sous-tableau trié
    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Sous-tableau [${start}..${end}] maintenant trié.`,
      subArrays: [{ start, end, color: "blue" }],
    });

    // Retourner les indices du sous-tableau trié
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Lancer le tri fusion
  mergeSort(0, arr.length - 1);

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
