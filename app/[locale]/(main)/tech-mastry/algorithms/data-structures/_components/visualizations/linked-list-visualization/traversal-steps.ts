import type { LinkedListStep, ListNode } from "./types";

// Générer les étapes pour l'opération d'accès
export function generateAccessSteps(nodesList: ListNode[], targetIndex: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Accès à l'élément à l'index ${targetIndex}`,
    operation: "access",
    operationCount: 0,
  });

  // Vérifier si l'index est valide
  if (targetIndex < 0 || targetIndex >= nodesList.length) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [],
      message: `Index ${targetIndex} hors limites (0-${
            nodesList.length - 1
          })`,
      operation: "access",
      operationCount: 0,
      completed: true,
    });
    return steps;
  }

  // Simuler le parcours de la liste jusqu'à l'index cible
  for (let i = 0; i <= targetIndex; i++) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [i],
      message:
        i === targetIndex
          ? `Élément trouvé à l'index ${i}: ${nodesList[i].value}`
          : `Parcours du nœud à l'index ${i}`,
      operation: "access",
      operationCount: i + 1,
      completed: i === targetIndex,
    });
  }

  return steps;
}

// Générer les étapes pour l'opération de recherche
export function generateSearchSteps(nodesList: ListNode[], targetValue: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  // Étape initiale
  steps.push({
    nodes: [...nodesList],
    activeIndices: [],
    message: `Recherche de la valeur ${targetValue} dans la liste`,
    operation: "search",
    operationCount: 0,
    targetValue,
  });

  // Simuler la recherche dans la liste
  let found = false;
  let foundIndex = -1;

  for (let i = 0; i < nodesList.length; i++) {
    steps.push({
      nodes: [...nodesList],
      activeIndices: [i],
      message: `Comparaison avec le nœud à l'index ${i}: ${nodesList[i].value}`,
      operation: "search",
      operationCount: i + 1,
      targetValue,
    });

    if (nodesList[i].value === targetValue) {
      found = true;
      foundIndex = i;
      break;
    }
  }

  // Étape finale
  steps.push({
    nodes: [...nodesList],
    activeIndices: found ? [foundIndex] : [],
    message: found
      ? `Valeur ${targetValue} trouvée à l'index ${foundIndex} après ${
              foundIndex + 1
            } comparaisons`
      : `Valeur ${targetValue} non trouvée après ${nodesList.length} comparaisons`,
    operation: "search",
    operationCount: found ? foundIndex + 1 : nodesList.length,
    targetValue,
    found,
    completed: true,
  });

  return steps;
}
