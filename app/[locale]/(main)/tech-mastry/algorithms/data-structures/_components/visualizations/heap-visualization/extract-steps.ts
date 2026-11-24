import type { HeapNode, HeapStep, HeapType } from "./types";

// Générer les étapes pour l'extraction du maximum/minimum
export function generateExtractMaxSteps(currentHeap: HeapNode[], type: HeapType): HeapStep[] {
  const steps: HeapStep[] = [];

  if (currentHeap.length === 0) {
    steps.push({
      heap: [],
      activeIndices: [],
      swappedIndices: null,
      message: "Le tas est vide, impossible d'extraire un élément",
      operation: "extractMax",
      heapType: type,
      operationCount: 0,
      completed: true,
    });
    return steps;
  }

  const newHeap = [...currentHeap];
  const rootValue = newHeap[0].value;

  // Étape initiale
  steps.push({
    heap: [...newHeap],
    activeIndices: [0],
    swappedIndices: null,
    message: `Extraction de la ${
          type === "max" ? "valeur maximale" : "valeur minimale"
        } (${rootValue})`,
    operation: "extractMax",
    heapType: type,
    operationCount: 0,
  });

  if (newHeap.length === 1) {
    // Cas spécial: un seul élément dans le tas
    steps.push({
      heap: [],
      activeIndices: [],
      swappedIndices: null,
      message: `Suppression de la seule valeur du tas (${rootValue})`,
      operation: "extractMax",
      heapType: type,
      operationCount: 1,
      completed: true,
    });
    return steps;
  }

  // Échanger la racine avec le dernier élément
  const lastNode = newHeap[newHeap.length - 1];

  steps.push({
    heap: [...newHeap],
    activeIndices: [0, newHeap.length - 1],
    swappedIndices: null,
    message: `Échange de la racine (${rootValue}) avec le dernier élément (${lastNode.value})`,
    operation: "extractMax",
    heapType: type,
    operationCount: 1,
  });

  // Échanger la racine avec le dernier élément
  [newHeap[0], newHeap[newHeap.length - 1]] = [
    newHeap[newHeap.length - 1],
    newHeap[0],
  ];

  steps.push({
    heap: [...newHeap],
    activeIndices: [0],
    swappedIndices: [0, newHeap.length - 1],
    message: `Après échange: ${lastNode.value} est maintenant à la racine`,
    operation: "extractMax",
    heapType: type,
    operationCount: 2,
  });

  // Supprimer le dernier élément (qui est maintenant l'ancienne racine)
  newHeap.pop(); // Suppression de l'ancienne racine

  steps.push({
    heap: [...newHeap],
    activeIndices: [],
    swappedIndices: null,
    message: `Suppression de l'ancienne racine (${rootValue})`,
    operation: "extractMax",
    heapType: type,
    operationCount: 3,
  });

  // Faire descendre la nouvelle racine à sa position correcte
  let currentIndex = 0;
  let operationCount = 4;

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
              shouldSwapLeft ? "échange nécessaire" : "pas d'échange nécessaire"
            }`,
        operation: "extractMax",
        heapType: type,
        operationCount: operationCount++,
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
        operation: "extractMax",
        heapType: type,
        operationCount: operationCount++,
      });
    }

    // Si pas besoin d'échanger, on a terminé
    if (swapIndex === currentIndex) {
      steps.push({
        heap: [...newHeap],
        activeIndices: [currentIndex],
        swappedIndices: null,
        message: `La valeur ${newHeap[currentIndex].value} est à sa position correcte, l'extraction est terminée`,
        operation: "extractMax",
        heapType: type,
        operationCount: operationCount,
        completed: true,
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
      operation: "extractMax",
      heapType: type,
      operationCount: operationCount++,
    });

    // Mettre à jour l'index courant
    currentIndex = swapIndex;
  }

  return steps;
}
