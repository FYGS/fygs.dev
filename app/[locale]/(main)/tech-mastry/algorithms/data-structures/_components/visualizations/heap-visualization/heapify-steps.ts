import type { HeapNode, HeapStep, HeapType } from "./types";

// Générer les étapes pour heapify
export function generateHeapifySteps(currentHeap: HeapNode[], type: HeapType): HeapStep[] {
  const steps: HeapStep[] = [];
  const newHeap = [...currentHeap];

  // Étape initiale
  steps.push({
    heap: [...newHeap],
    activeIndices: [],
    swappedIndices: null,
    message: `Début du processus de heapify pour un tas ${
          type === "max" ? "maximum" : "minimum"
        }`,
    operation: "heapify",
    heapType: type,
    operationCount: 0,
  });

  // Heapify de bas en haut
  for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
    steps.push({
      heap: [...newHeap],
      activeIndices: [i],
      swappedIndices: null,
      message: `Heapify à partir du nœud ${newHeap[i].value} (index ${i})`,
      operation: "heapify",
      heapType: type,
      operationCount: steps.length,
    });

    // Sift down à partir de l'index i
    let currentIndex = i;

    while (true) {
      const leftChildIndex = 2 * currentIndex + 1;
      const rightChildIndex = 2 * currentIndex + 2;
      let swapIndex = currentIndex;

      // Vérifier si le fils gauche existe et s'il doit être échangé
      if (leftChildIndex < newHeap.length) {
        const shouldSwapLeft =
          type === "max"
            ? newHeap[leftChildIndex].value > newHeap[swapIndex].value
            : newHeap[leftChildIndex].value < newHeap[swapIndex].value;

        if (shouldSwapLeft) {
          swapIndex = leftChildIndex;
        }

        steps.push({
          heap: [...newHeap],
          activeIndices: [currentIndex, leftChildIndex],
          swappedIndices: null,
          message: `Comparaison avec le fils gauche (${
                newHeap[leftChildIndex].value
              }): ${
                shouldSwapLeft
                  ? "échange nécessaire"
                  : "pas d'échange nécessaire"
              }`,
          operation: "heapify",
          heapType: type,
          operationCount: steps.length,
        });
      }

      // Vérifier si le fils droit existe et s'il doit être échangé
      if (rightChildIndex < newHeap.length) {
        const shouldSwapRight =
          type === "max"
            ? newHeap[rightChildIndex].value > newHeap[swapIndex].value
            : newHeap[rightChildIndex].value < newHeap[swapIndex].value;

        if (shouldSwapRight) {
          swapIndex = rightChildIndex;
        }

        steps.push({
          heap: [...newHeap],
          activeIndices: [currentIndex, rightChildIndex],
          swappedIndices: null,
          message: `Comparaison avec le fils droit (${
                newHeap[rightChildIndex].value
              }): ${
                shouldSwapRight
                  ? "échange nécessaire"
                  : "pas d'échange nécessaire"
              }`,
          operation: "heapify",
          heapType: type,
          operationCount: steps.length,
        });
      }

      // Si pas besoin d'échanger, on passe au nœud suivant
      if (swapIndex === currentIndex) {
        steps.push({
          heap: [...newHeap],
          activeIndices: [currentIndex],
          swappedIndices: null,
          message: `La valeur ${newHeap[currentIndex].value} est à sa position correcte`,
          operation: "heapify",
          heapType: type,
          operationCount: steps.length,
        });
        break;
      }

      // Échanger le nœud avec son fils
      [newHeap[currentIndex], newHeap[swapIndex]] = [
        newHeap[swapIndex],
        newHeap[currentIndex],
      ];

      steps.push({
        heap: [...newHeap],
        activeIndices: [swapIndex],
        swappedIndices: [currentIndex, swapIndex],
        message: `Échange avec le fils: ${newHeap[swapIndex].value} descend à la position ${swapIndex}`,
        operation: "heapify",
        heapType: type,
        operationCount: steps.length,
      });

      // Mettre à jour l'index courant
      currentIndex = swapIndex;
    }
  }

  // Étape finale
  steps.push({
    heap: [...newHeap],
    activeIndices: [],
    swappedIndices: null,
    message: `Heapify terminé, le tas ${
          type === "max" ? "maximum" : "minimum"
        } est maintenant valide`,
    operation: "heapify",
    heapType: type,
    operationCount: steps.length,
    completed: true,
  });

  return steps;
}
