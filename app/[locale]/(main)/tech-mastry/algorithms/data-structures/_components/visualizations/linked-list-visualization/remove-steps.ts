import type { LinkedListStep, ListNode } from "./types";

// Générer les étapes pour la suppression en tête
export function generateRemoveHeadSteps(nodesList: ListNode[]): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Suppression du nœud en tête de liste`,
    operation: "removeHead",
    operationCount: 0,
  });

  // Vérifier si la liste est vide
  if (nodesList.length === 0) {
    steps.push({
      nodes: [],
      activeIndices: [],
      message: `La liste est vide, aucun nœud à supprimer`,
      operation: "removeHead",
      operationCount: 0,
      completed: true,
    });
    return steps;
  }

  // Étape de suppression
  const removedValue = nodesList[0].value;
  steps.push({
    nodes: [...nodesList],
    activeIndices: [0],
    message: `Suppression du nœud avec la valeur ${removedValue} en tête de liste`,
    operation: "removeHead",
    operationCount: 1,
  });

  const newList = nodesList.slice(1);
  steps.push({
    nodes: newList,
    activeIndices: [],
    message: `Nœud avec la valeur ${removedValue} supprimé de la tête de liste`,
    operation: "removeHead",
    operationCount: 1,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour la suppression en queue
export function generateRemoveTailSteps(nodesList: ListNode[]): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Suppression du nœud en queue de liste`,
    operation: "removeTail",
    operationCount: 0,
  });

  // Vérifier si la liste est vide
  if (nodesList.length === 0) {
    steps.push({
      nodes: [],
      activeIndices: [],
      message: `La liste est vide, aucun nœud à supprimer`,
      operation: "removeTail",
      operationCount: 0,
      completed: true,
    });
    return steps;
  }

  // Simuler le parcours de la liste jusqu'à la fin
  for (let i = 0; i < nodesList.length; i++) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [i],
      message: `Parcours du nœud à l'index ${i}`,
      operation: "removeTail",
      operationCount: i + 1,
    });
  }

  // Étape de suppression
  const removedValue = nodesList[nodesList.length - 1].value;
  steps.push({
    nodes: [...nodesList],
    activeIndices: [nodesList.length - 1],
    message: `Suppression du nœud avec la valeur ${removedValue} en queue de liste`,
    operation: "removeTail",
    operationCount: nodesList.length,
  });

  const newList = nodesList.slice(0, -1);
  steps.push({
    nodes: newList,
    activeIndices: [],
    message: `Nœud avec la valeur ${removedValue} supprimé de la queue de liste`,
    operation: "removeTail",
    operationCount: nodesList.length,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour la suppression à un index spécifique
export function generateRemoveAtSteps(nodesList: ListNode[], targetIndex: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Suppression du nœud à l'index ${targetIndex}`,
    operation: "removeAt",
    operationCount: 0,
  });

  // Vérifier si l'index est valide
  if (targetIndex < 0 || targetIndex >= nodesList.length) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [],
      message: `Index ${targetIndex} invalide (doit être entre 0 et ${
            nodesList.length - 1
          })`,
      operation: "removeAt",
      operationCount: 0,
      completed: true,
    });
    return steps;
  }

  // Cas spécial: suppression en tête
  if (targetIndex === 0) {
    return generateRemoveHeadSteps(nodesList);
  }

  // Cas spécial: suppression en queue
  if (targetIndex === nodesList.length - 1) {
    return generateRemoveTailSteps(nodesList);
  }

  // Simuler le parcours de la liste jusqu'à l'index cible
  for (let i = 0; i <= targetIndex; i++) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [i],
      message:
        i === targetIndex
          ? `Nœud trouvé à l'index ${i}: ${nodesList[i].value}`
          : `Parcours du nœud à l'index ${i}`,
      operation: "removeAt",
      operationCount: i + 1,
    });
  }

  // Étape de suppression
  const removedValue = nodesList[targetIndex].value;
  steps.push({
    nodes: [...nodesList],
    activeIndices: [targetIndex],
    message: `Suppression du nœud avec la valeur ${removedValue} à l'index ${targetIndex}`,
    operation: "removeAt",
    operationCount: targetIndex + 1,
  });

  const newList = [
    ...nodesList.slice(0, targetIndex),
    ...nodesList.slice(targetIndex + 1),
  ];

  steps.push({
    nodes: newList,
    activeIndices: [],
    message: `Nœud avec la valeur ${removedValue} supprimé de l'index ${targetIndex}`,
    operation: "removeAt",
    operationCount: targetIndex + 1,
    completed: true,
  });

  return steps;
}
