import type { SortingStep } from "../types";

// Générer les étapes pour le tri par tas
export function generateHeapSortSteps(array: number[]): SortingStep[] {
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
    message: "Début du tri par tas (Heap Sort).",
    sortedIndices: [...sortedIndices],
  });

  // Fonction pour réorganiser le tas
  const heapify = (n: number, i: number): void => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    // Comparer avec le fils gauche
    if (left < n) {
      comparisons++;

      steps.push({
        array: [...arr],
        activeIndices: [i, left],
        comparisons,
        swaps,
        message: `Comparaison du nœud ${arr[i]} avec son fils gauche ${arr[left]}.`,
        sortedIndices: [...sortedIndices],
      });

      if (arr[left] > arr[largest]) {
        largest = left;

        steps.push({
          array: [...arr],
          activeIndices: [largest],
          comparisons,
          swaps,
          message: `Le fils gauche ${arr[largest]} est plus grand que le nœud actuel.`,
          sortedIndices: [...sortedIndices],
        });
      }
    }

    // Comparer avec le fils droit
    if (right < n) {
      comparisons++;

      steps.push({
        array: [...arr],
        activeIndices: [largest, right],
        comparisons,
        swaps,
        message: `Comparaison du plus grand élément actuel ${arr[largest]} avec le fils droit ${arr[right]}.`,
        sortedIndices: [...sortedIndices],
      });

      if (arr[right] > arr[largest]) {
        largest = right;

        steps.push({
          array: [...arr],
          activeIndices: [largest],
          comparisons,
          swaps,
          message: `Le fils droit ${arr[largest]} est le plus grand.`,
          sortedIndices: [...sortedIndices],
        });
      }
    }

    // Si le plus grand n'est pas la racine, échanger et continuer à réorganiser
    if (largest !== i) {
      swaps++;

      steps.push({
        array: [...arr],
        activeIndices: [i, largest],
        comparisons,
        swaps,
        message: `Échange du nœud ${arr[i]} avec ${arr[largest]}.`,
        sortedIndices: [...sortedIndices],
      });

      [arr[i], arr[largest]] = [arr[largest], arr[i]];

      steps.push({
        array: [...arr],
        activeIndices: [i, largest],
        comparisons,
        swaps,
        message: `Après échange: nœuds ${arr[i]} et ${arr[largest]}.`,
        sortedIndices: [...sortedIndices],
      });

      // Récursivement réorganiser le sous-arbre affecté
      heapify(n, largest);
    }
  };

  // Construire un max-heap
  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Construction du max-heap initial.",
    sortedIndices: [...sortedIndices],
  });

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    steps.push({
      array: [...arr],
      activeIndices: [i],
      comparisons,
      swaps,
      message: `Réorganisation du sous-arbre avec racine à l'indice ${i}.`,
      sortedIndices: [...sortedIndices],
    });

    heapify(arr.length, i);
  }

  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Max-heap construit. Extraction des éléments un par un.",
    sortedIndices: [...sortedIndices],
  });

  // Extraire les éléments un par un
  for (let i = arr.length - 1; i > 0; i--) {
    swaps++;

    steps.push({
      array: [...arr],
      activeIndices: [0, i],
      comparisons,
      swaps,
      message: `Extraction du plus grand élément ${arr[0]} et placement à la fin.`,
      sortedIndices: [...sortedIndices],
    });

    // Déplacer la racine (plus grand élément) à la fin
    [arr[0], arr[i]] = [arr[i], arr[0]];

    // Marquer l'élément comme trié
    sortedIndices.push(i);

    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Élément ${arr[i]} placé à sa position finale.`,
      sortedIndices: [...sortedIndices],
    });

    // Réorganiser le tas réduit
    steps.push({
      array: [...arr],
      activeIndices: [0],
      comparisons,
      swaps,
      message: `Réorganisation du tas réduit.`,
      sortedIndices: [...sortedIndices],
    });

    heapify(i, 0);
  }

  // Marquer le dernier élément comme trié
  sortedIndices.push(0);

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
