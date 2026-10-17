import type { ArrayElement, ElementState, SearchStep } from "./types";

// Algorithme de recherche binaire
export function binarySearchSteps(arr: number[], target: number) {
  const steps: SearchStep[] = [];
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      left,
      right,
      mid,
      state: "searching",
      message: `Comparaison de ${arr[mid]} avec ${target}`,
    });

    if (arr[mid] === target) {
      steps.push({
        left,
        right,
        mid,
        state: "found",
        message: `L'élément ${target} est trouvé à l'index ${mid}.`,
      });
      return { steps, found: true, foundIndex: mid };
    }

    if (arr[mid] < target) {
      left = mid + 1;
      steps.push({
        left,
        right,
        state: "range",
        message: `L'élément ${arr[mid]} est plus petit que ${target}, on cherche à droite.`,
      });
    } else {
      right = mid - 1;
      steps.push({
        left,
        right,
        state: "range",
        message: `L'élément ${arr[mid]} est plus grand que ${target}, on cherche à gauche.`,
      });
    }
  }

  steps.push({
    state: "not-found",
    message: `L'élément ${target} n'est pas trouvé dans le tableau.`,
  });

  return { steps, found: false, foundIndex: -1 };
}

// Mettre à jour l'état du tableau pour une étape de l'algorithme
export function applySearchStep(prev: ArrayElement[], step: SearchStep): ArrayElement[] {
  const newArray = [...prev].map((item) => ({
    ...item,
    state: "default" as ElementState,
  }));

  if (step.state === "searching") {
    // Marquer l'élément en cours de comparaison
    if (step.mid !== undefined) {
      newArray[step.mid].state = "current";
    }

    // Marquer la plage de recherche
    if (step.left !== undefined && step.right !== undefined) {
      for (let i = step.left; i <= step.right; i++) {
        if (i !== step.mid && i < newArray.length) {
          newArray[i].state = "range";
        }
      }
    }
  } else if (step.state === "found") {
    // Marquer l'élément trouvé
    if (step.mid !== undefined) {
      newArray[step.mid].state = "found";
    }
  } else if (step.state === "not-found") {
    // Marquer tous les éléments comme non trouvés
    newArray.forEach((item) => {
      item.state = "not-found";
    });
  } else if (step.state === "range") {
    // Marquer la plage de recherche
    if (step.left !== undefined && step.right !== undefined) {
      for (let i = step.left; i <= step.right; i++) {
        if (i < newArray.length) {
          newArray[i].state = "range";
        }
      }
    }
  }

  return newArray;
}
