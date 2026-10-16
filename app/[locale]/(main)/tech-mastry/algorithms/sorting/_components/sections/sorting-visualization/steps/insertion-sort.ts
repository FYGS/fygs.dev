import type { SortingStep } from "../types";

// Générer les étapes pour le tri par insertion
export function generateInsertionSortSteps(array: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices: number[] = [0]; // Le premier élément est déjà trié

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: "Début du tri par insertion. Le premier élément est déjà trié.",
    sortedIndices: [...sortedIndices],
  });

  // Simuler le tri par insertion
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    // Marquer l'élément à insérer
    steps.push({
      array: [...arr],
      activeIndices: [i],
      comparisons,
      swaps,
      message: `Sélection de l'élément à l'indice ${i} (${key}) pour insertion.`,
      sortedIndices: [...sortedIndices],
    });

    // Déplacer les éléments plus grands que key vers la droite
    while (j >= 0) {
      comparisons++;
      steps.push({
        array: [...arr],
        activeIndices: [j, j + 1],
        comparisons,
        swaps,
        message: `Comparaison de ${key} avec l'élément à l'indice ${j} (${arr[j]}).`,
        sortedIndices: [...sortedIndices],
      });

      if (arr[j] > key) {
        swaps++;
        arr[j + 1] = arr[j];

        steps.push({
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
          message: `Déplacement de l'élément ${arr[j]} vers la droite.`,
          sortedIndices: [...sortedIndices],
        });

        j--;
      } else {
        break;
      }
    }

    // Placer key à sa position correcte
    if (arr[j + 1] !== key) {
      arr[j + 1] = key;

      steps.push({
        array: [...arr],
        activeIndices: [j + 1],
        comparisons,
        swaps,
        message: `Insertion de ${key} à l'indice ${j + 1}.`,
        sortedIndices: [...sortedIndices],
      });
    }

    // Mettre à jour les indices triés
    sortedIndices.push(i);

    steps.push({
      array: [...arr],
      activeIndices: [],
      comparisons,
      swaps,
      message: `Sous-tableau [0..${i}] maintenant trié.`,
      sortedIndices: [...sortedIndices],
    });
  }

  // Étape finale
  steps.push({
    array: [...arr],
    activeIndices: [],
    comparisons,
    swaps,
    message: `Tri terminé en ${comparisons} comparaisons et ${swaps} déplacements.`,
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
  });

  return steps;
}
