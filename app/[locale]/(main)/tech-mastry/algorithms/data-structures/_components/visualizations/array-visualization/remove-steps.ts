import type { ArrayStep } from "./types";

// Générer les étapes pour la suppression à la fin
export function generateRemoveEndSteps(arr: number[]): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Suppression de l'élément à la fin du tableau`,
    operation: "removeEnd",
    operationCount: 0,
  });

  // Vérifier si le tableau est vide
  if (arr.length === 0) {
    steps.push({
      array: [],
      activeIndices: [],
      message: `Le tableau est vide, aucun élément à supprimer`,
      operation: "removeEnd",
      operationCount: 1,
      completed: true,
    });
    return steps;
  }

  // Étape de suppression
  const removedValue = arr[arr.length - 1];
  steps.push({
    array: [...arr],
    activeIndices: [arr.length - 1],
    message: `Suppression de la valeur ${removedValue} à l'index ${
        arr.length - 1
      }`,
    operation: "removeEnd",
    operationCount: 1,
  });

  const newArray = arr.slice(0, -1);
  steps.push({
    array: [...newArray],
    activeIndices: [],
    message: `Valeur ${removedValue} supprimée`,
    operation: "removeEnd",
    operationCount: 1,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour la suppression au début
export function generateRemoveStartSteps(arr: number[]): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Suppression de l'élément au début du tableau`,
    operation: "removeStart",
    operationCount: 0,
  });

  // Vérifier si le tableau est vide
  if (arr.length === 0) {
    steps.push({
      array: [],
      activeIndices: [],
      message: `Le tableau est vide, aucun élément à supprimer`,
      operation: "removeStart",
      operationCount: 1,
      completed: true,
    });
    return steps;
  }

  // Étape de suppression
  const removedValue = arr[0];
  steps.push({
    array: [...arr],
    activeIndices: [0],
    message: `Suppression de la valeur ${removedValue} à l'index 0`,
    operation: "removeStart",
    operationCount: 1,
  });

  // Étape de décalage
  if (arr.length > 1) {
    steps.push({
      array: [...arr.slice(1)],
      activeIndices: Array.from({ length: arr.length - 1 }, (_, i) => i),
      message: `Décalage de tous les éléments vers la gauche`,
      operation: "removeStart",
      operationCount: arr.length,
    });
  }

  const newArray = arr.slice(1);
  steps.push({
    array: [...newArray],
    activeIndices: [],
    message: `Valeur ${removedValue} supprimée`,
    operation: "removeStart",
    operationCount: arr.length,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour la suppression à un index spécifique
export function generateRemoveAtSteps(arr: number[], targetIndex: number): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Suppression de l'élément à l'index ${targetIndex}`,
    operation: "removeAt",
    operationCount: 0,
  });

  // Vérifier si l'index est valide
  if (targetIndex < 0 || targetIndex >= arr.length) {
    steps.push({
      array: [...arr],
      activeIndices: [],
      message: `Index ${targetIndex} invalide (doit être entre 0 et ${
            arr.length - 1
          })`,
      operation: "removeAt",
      operationCount: 1,
      completed: true,
    });
    return steps;
  }

  // Étape de suppression
  const removedValue = arr[targetIndex];
  steps.push({
    array: [...arr],
    activeIndices: [targetIndex],
    message: `Suppression de la valeur ${removedValue} à l'index ${targetIndex}`,
    operation: "removeAt",
    operationCount: 1,
  });

  // Étape de décalage
  if (targetIndex < arr.length - 1) {
    steps.push({
      array: [...arr.slice(0, targetIndex), ...arr.slice(targetIndex + 1)],
      activeIndices: Array.from(
        { length: arr.length - targetIndex - 1 },
        (_, i) => i + targetIndex
      ),
      message: `Décalage des éléments à partir de l'index ${
            targetIndex + 1
          } vers la gauche`,
      operation: "removeAt",
      operationCount: arr.length - targetIndex,
    });
  }

  const newArray = [
    ...arr.slice(0, targetIndex),
    ...arr.slice(targetIndex + 1),
  ];
  steps.push({
    array: [...newArray],
    activeIndices: [],
    message: `Valeur ${removedValue} supprimée`,
    operation: "removeAt",
    operationCount: arr.length - targetIndex,
    completed: true,
  });

  return steps;
}
