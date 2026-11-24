import type { HeapNode, HeapStep, HeapType } from "./types";

// Générer les étapes pour l'insertion d'une valeur
export function generateInsertSteps(
  currentHeap: HeapNode[],
  valueToInsert: number,
  type: HeapType
): HeapStep[] {
  const steps: HeapStep[] = [];
  const newHeap = [...currentHeap];

  // Étape initiale
  steps.push({
    heap: [...newHeap],
    activeIndices: [],
    swappedIndices: null,
    message: `Insertion de la valeur ${valueToInsert}`,
    operation: "insert",
    heapType: type,
    operationCount: 0,
    targetValue: valueToInsert,
  });

  // Créer un nouveau nœud
  const newNode: HeapNode = {
    id: `node-${valueToInsert}-${Date.now()}`,
    value: valueToInsert,
  };

  // Ajouter le nouveau nœud à la fin du tas
  newHeap.push(newNode);

  steps.push({
    heap: [...newHeap],
    activeIndices: [newHeap.length - 1],
    swappedIndices: null,
    message: `Ajout de la valeur ${valueToInsert} à la fin du tas`,
    operation: "insert",
    heapType: type,
    operationCount: 1,
    targetValue: valueToInsert,
  });

  // Faire remonter le nœud jusqu'à sa position correcte
  let currentIndex = newHeap.length - 1;

  while (currentIndex > 0) {
    const parentIndex = Math.floor((currentIndex - 1) / 2);

    // Vérifier si le nœud doit être échangé avec son parent
    const shouldSwap =
      type === "max"
        ? newHeap[currentIndex].value > newHeap[parentIndex].value
        : newHeap[currentIndex].value < newHeap[parentIndex].value;

    if (!shouldSwap) {
      // Si pas besoin d'échanger, on a terminé
      steps.push({
        heap: [...newHeap],
        activeIndices: [currentIndex, parentIndex],
        swappedIndices: null,
        message: `Comparaison avec le parent (${newHeap[parentIndex].value}): pas besoin d'échanger, l'insertion est terminée`,
        operation: "insert",
        heapType: type,
        operationCount: steps.length + 1,
        targetValue: valueToInsert,
        completed: true,
      });
      break;
    }

    // Étape de comparaison
    steps.push({
      heap: [...newHeap],
      activeIndices: [currentIndex, parentIndex],
      swappedIndices: null,
      message: `Comparaison avec le parent (${
            newHeap[parentIndex].value
          }): ${valueToInsert} ${
            type === "max" ? "> parent" : "< parent"
          }, échange nécessaire`,
      operation: "insert",
      heapType: type,
      operationCount: steps.length + 1,
      targetValue: valueToInsert,
    });

    // Échanger le nœud avec son parent
    [newHeap[currentIndex], newHeap[parentIndex]] = [
      newHeap[parentIndex],
      newHeap[currentIndex],
    ];

    // Étape d'échange
    steps.push({
      heap: [...newHeap],
      activeIndices: [parentIndex],
      swappedIndices: [currentIndex, parentIndex],
      message: `Échange avec le parent: ${valueToInsert} remonte à la position ${parentIndex}`,
      operation: "insert",
      heapType: type,
      operationCount: steps.length + 1,
      targetValue: valueToInsert,
    });

    // Mettre à jour l'index courant
    currentIndex = parentIndex;
  }

  // Si on est sorti de la boucle sans ajouter d'étape complétée
  if (!steps[steps.length - 1].completed) {
    steps.push({
      heap: [...newHeap],
      activeIndices: [currentIndex],
      swappedIndices: null,
      message: `La valeur ${valueToInsert} est maintenant à la racine du tas, l'insertion est terminée`,
      operation: "insert",
      heapType: type,
      operationCount: steps.length + 1,
      targetValue: valueToInsert,
      completed: true,
    });
  }

  return steps;
}
