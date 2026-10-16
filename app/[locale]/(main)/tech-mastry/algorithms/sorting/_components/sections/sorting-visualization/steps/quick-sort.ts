import type { SortingStep } from "../types";

// Générer les étapes pour le tri rapide
export function generateQuickSortSteps(array: number[]): SortingStep[] {
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
    message: "Début du tri rapide (Quick Sort).",
    sortedIndices: [],
  });

  // Fonction récursive pour le tri rapide
  const quickSort = (low: number, high: number): void => {
    if (low < high) {
      // Ajouter une étape pour montrer le sous-tableau à trier
      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Tri du sous-tableau [${low}..${high}].`,
        subArrays: [{ start: low, end: high, color: "blue" }],
      });

      // Choisir le pivot (dernier élément)
      const pivot = arr[high];

      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `Choix du pivot: ${pivot} (indice ${high}).`,
        subArrays: [{ start: low, end: high, color: "blue" }],
        pivotIndex: high,
      });

      // Partitionner le tableau
      let i = low - 1;

      for (let j = low; j < high; j++) {
        // Comparaison avec le pivot
        comparisons++;

        steps.push({
          array: [...arr],
          activeIndices: [j, high],
          comparisons,
          swaps,
          message: `Comparaison de ${arr[j]} avec le pivot ${pivot}.`,
          subArrays: [{ start: low, end: high, color: "blue" }],
          pivotIndex: high,
        });

        if (arr[j] <= pivot) {
          i++;

          // Échange si nécessaire
          if (i !== j) {
            swaps++;

            steps.push({
              array: [...arr],
              activeIndices: [i, j],
              comparisons,
              swaps,
              message: `Échange des éléments aux indices ${i} (${arr[i]}) et ${j} (${arr[j]}).`,
              subArrays: [{ start: low, end: high, color: "blue" }],
              pivotIndex: high,
            });

            [arr[i], arr[j]] = [arr[j], arr[i]];

            steps.push({
              array: [...arr],
              activeIndices: [i, j],
              comparisons,
              swaps,
              message: `Après échange: éléments aux indices ${i} (${arr[i]}) et ${j} (${arr[j]}).`,
              subArrays: [{ start: low, end: high, color: "blue" }],
              pivotIndex: high,
            });
          } else {
            steps.push({
              array: [...arr],
              activeIndices: [i],
              comparisons,
              swaps,
              message: `${arr[i]} est déjà à la bonne position.`,
              subArrays: [{ start: low, end: high, color: "blue" }],
              pivotIndex: high,
            });
          }
        }
      }

      // Placer le pivot à sa position finale
      const pivotPos = i + 1;

      if (pivotPos !== high) {
        swaps++;

        steps.push({
          array: [...arr],
          activeIndices: [pivotPos, high],
          comparisons,
          swaps,
          message: `Placement du pivot ${pivot} à sa position finale (indice ${pivotPos}).`,
          subArrays: [{ start: low, end: high, color: "blue" }],
          pivotIndex: high,
        });

        [arr[pivotPos], arr[high]] = [arr[high], arr[pivotPos]];

        steps.push({
          array: [...arr],
          activeIndices: [],
          comparisons,
          swaps,
          message: `Pivot ${pivot} placé à l'indice ${pivotPos}. Tous les éléments à gauche sont <= pivot, tous les éléments à droite sont > pivot.`,
          subArrays: [
            { start: low, end: pivotPos - 1, color: "green" },
            { start: pivotPos + 1, end: high, color: "purple" },
          ],
          pivotIndex: pivotPos,
        });
      }

      // Marquer le pivot comme trié
      const sortedIndices = steps[steps.length - 1].sortedIndices || [];
      sortedIndices.push(pivotPos);

      steps.push({
        array: [...arr],
        activeIndices: [],
        comparisons,
        swaps,
        message: `L'élément ${arr[pivotPos]} à l'indice ${pivotPos} est maintenant à sa position finale.`,
        sortedIndices: [...sortedIndices],
        pivotIndex: pivotPos,
      });

      // Trier récursivement les sous-tableaux
      quickSort(low, pivotPos - 1);
      quickSort(pivotPos + 1, high);
    } else if (low === high) {
      // Un seul élément est déjà trié
      const sortedIndices = steps[steps.length - 1].sortedIndices || [];
      if (!sortedIndices.includes(low)) {
        sortedIndices.push(low);

        steps.push({
          array: [...arr],
          activeIndices: [],
          comparisons,
          swaps,
          message: `L'élément unique ${arr[low]} à l'indice ${low} est déjà trié.`,
          sortedIndices: [...sortedIndices],
        });
      }
    }
  };

  // Lancer le tri rapide
  quickSort(0, arr.length - 1);

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
