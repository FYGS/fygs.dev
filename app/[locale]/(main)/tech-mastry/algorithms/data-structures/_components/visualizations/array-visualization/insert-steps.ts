import type { ArrayStep } from "./types";

// Générer les étapes pour l'insertion à la fin
export function generateInsertEndSteps(arr: number[], value: number): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Insertion de la valeur ${value} à la fin du tableau`,
    operation: "insertEnd",
    operationCount: 0,
  });

  // Étape d'insertion
  const newArray = [...arr, value];
  steps.push({
    array: [...newArray],
    activeIndices: [newArray.length - 1],
    message: `Valeur ${value} insérée à l'index ${newArray.length - 1}`,
    operation: "insertEnd",
    operationCount: 1,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour l'insertion au début
export function generateInsertStartSteps(arr: number[], value: number): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Insertion de la valeur ${value} au début du tableau`,
    operation: "insertStart",
    operationCount: 0,
  });

  // Étape de décalage
  steps.push({
    array: [...arr],
    activeIndices: Array.from({ length: arr.length }, (_, i) => i),
    message: `Décalage de tous les éléments vers la droite`,
    operation: "insertStart",
    operationCount: arr.length,
  });

  // Étape d'insertion
  const newArray = [value, ...arr];
  steps.push({
    array: [...newArray],
    activeIndices: [0],
    message: `Valeur ${value} insérée à l'index 0`,
    operation: "insertStart",
    operationCount: arr.length + 1,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour l'insertion à un index spécifique
export function generateInsertAtSteps(arr: number[], value: number, targetIndex: number): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Insertion de la valeur ${value} à l'index ${targetIndex}`,
    operation: "insertAt",
    operationCount: 0,
  });

  // Vérifier si l'index est valide
  if (targetIndex < 0 || targetIndex > arr.length) {
    steps.push({
      array: [...arr],
      activeIndices: [],
      message: `Index ${targetIndex} invalide (doit être entre 0 et ${arr.length})`,
      operation: "insertAt",
      operationCount: 1,
      completed: true,
    });
    return steps;
  }

  // Étape de décalage
  if (targetIndex < arr.length) {
    steps.push({
      array: [...arr],
      activeIndices: Array.from(
        { length: arr.length - targetIndex },
        (_, i) => i + targetIndex
      ),
      message: `Décalage des éléments à partir de l'index ${targetIndex} vers la droite`,
      operation: "insertAt",
      operationCount: arr.length - targetIndex,
    });
  }

  // Étape d'insertion
  const newArray = [
    ...arr.slice(0, targetIndex),
    value,
    ...arr.slice(targetIndex),
  ];
  steps.push({
    array: [...newArray],
    activeIndices: [targetIndex],
    message: `Valeur ${value} insérée à l'index ${targetIndex}`,
    operation: "insertAt",
    operationCount: arr.length - targetIndex + 1,
    completed: true,
  });

  return steps;
}
