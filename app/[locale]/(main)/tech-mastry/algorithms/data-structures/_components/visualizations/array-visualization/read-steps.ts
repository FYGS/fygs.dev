import type { ArrayStep } from "./types";

// Générer les étapes pour l'opération d'accès
export function generateAccessSteps(arr: number[], targetIndex: number): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Accès à l'élément à l'index ${targetIndex}`,
    operation: "access",
    operationCount: 0,
  });

  // Étape d'accès
  if (targetIndex >= 0 && targetIndex < arr.length) {
    steps.push({
      array: [...arr],
      activeIndices: [targetIndex],
      message: `Élément trouvé: ${arr[targetIndex]} à l'index ${targetIndex}`,
      operation: "access",
      operationCount: 1,
      targetIndex,
      completed: true,
    });
  } else {
    steps.push({
      array: [...arr],
      activeIndices: [],
      message: `Index ${targetIndex} hors limites (0-${arr.length - 1})`,
      operation: "access",
      operationCount: 1,
      targetIndex,
      completed: true,
    });
  }

  return steps;
}

// Générer les étapes pour l'opération de recherche
export function generateSearchSteps(arr: number[], targetValue: number): ArrayStep[] {
  const steps: ArrayStep[] = [];

  // Étape initiale
  steps.push({
    array: [...arr],
    activeIndices: [],
    message: `Recherche de la valeur ${targetValue} dans le tableau`,
    operation: "search",
    operationCount: 0,
    targetValue,
  });

  // Simuler la recherche linéaire
  let found = false;
  let foundIndex = -1;

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      array: [...arr],
      activeIndices: [i],
      message: `Comparaison avec l'élément à l'index ${i}: ${arr[i]}`,
      operation: "search",
      operationCount: i + 1,
      targetValue,
    });

    if (arr[i] === targetValue) {
      found = true;
      foundIndex = i;
      break;
    }
  }

  // Étape finale
  steps.push({
    array: [...arr],
    activeIndices: found ? [foundIndex] : [],
    message: found
      ? `Valeur ${targetValue} trouvée à l'index ${foundIndex} après ${
              foundIndex + 1
            } comparaisons`
      : `Valeur ${targetValue} non trouvée après ${arr.length} comparaisons`,
    operation: "search",
    operationCount: found ? foundIndex + 1 : arr.length,
    targetValue,
    found,
    completed: true,
  });

  return steps;
}
