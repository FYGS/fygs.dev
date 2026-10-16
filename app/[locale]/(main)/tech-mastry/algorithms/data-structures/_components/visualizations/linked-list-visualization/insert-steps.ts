import type { LinkedListStep, ListNode } from "./types";

// Générer les étapes pour l'insertion en tête
export function generateInsertHeadSteps(nodesList: ListNode[], value: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Insertion de la valeur ${value} en tête de liste`,
    operation: "insertHead",
    operationCount: 0,
  });

  // Créer un nouveau nœud
  const newNode: ListNode = {
    value,
    id: `node-${Date.now()}-new`,
  };

  // Étape d'insertion
  const newList = [newNode, ...nodesList];
  steps.push({
    nodes: newList,
    activeIndices: [0],
    message: `Valeur ${value} insérée en tête de liste`,
    operation: "insertHead",
    operationCount: 1,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour l'insertion en queue
export function generateInsertTailSteps(nodesList: ListNode[], value: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Insertion de la valeur ${value} en queue de liste`,
    operation: "insertTail",
    operationCount: 0,
  });

  // Simuler le parcours de la liste jusqu'à la fin
  for (let i = 0; i < nodesList.length; i++) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [i],
      message: `Parcours du nœud à l'index ${i}`,
      operation: "insertTail",
      operationCount: i + 1,
    });
  }

  // Créer un nouveau nœud
  const newNode: ListNode = {
    value,
    id: `node-${Date.now()}-new`,
  };

  // Étape d'insertion
  const newList = [...nodesList, newNode];
  steps.push({
    nodes: newList,
    activeIndices: [newList.length - 1],
    message: `Valeur ${value} insérée en queue de liste`,
    operation: "insertTail",
    operationCount: nodesList.length + 1,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour l'insertion à un index spécifique
export function generateInsertAtSteps(
  nodesList: ListNode[],
  value: number,
  targetIndex: number
): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Insertion de la valeur ${value} à l'index ${targetIndex}`,
    operation: "insertAt",
    operationCount: 0,
  });

  // Vérifier si l'index est valide
  if (targetIndex < 0 || targetIndex > nodesList.length) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [],
      message: `Index ${targetIndex} invalide (doit être entre 0 et ${nodesList.length})`,
      operation: "insertAt",
      operationCount: 0,
      completed: true,
    });
    return steps;
  }

  // Cas spécial: insertion en tête
  if (targetIndex === 0) {
    return generateInsertHeadSteps(nodesList, value);
  }

  // Cas spécial: insertion en queue
  if (targetIndex === nodesList.length) {
    return generateInsertTailSteps(nodesList, value);
  }

  // Simuler le parcours de la liste jusqu'à l'index cible
  for (let i = 0; i < targetIndex; i++) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [i],
      message: `Parcours du nœud à l'index ${i}`,
      operation: "insertAt",
      operationCount: i + 1,
    });
  }

  // Créer un nouveau nœud
  const newNode: ListNode = {
    value,
    id: `node-${Date.now()}-new`,
  };

  // Étape d'insertion
  const newList = [
    ...nodesList.slice(0, targetIndex),
    newNode,
    ...nodesList.slice(targetIndex),
  ];

  steps.push({
    nodes: newList,
    activeIndices: [targetIndex],
    message: `Valeur ${value} insérée à l'index ${targetIndex}`,
    operation: "insertAt",
    operationCount: targetIndex + 1,
    completed: true,
  });

  return steps;
}
