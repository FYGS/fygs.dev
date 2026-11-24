export interface SearchStep {
  type: "linear" | "binary";
  array: number[];
  target: number;
  currentIndex?: number;
  left?: number;
  right?: number;
  middle?: number;
  found?: boolean;
  comparisons: number;
  message: string;
}

export interface Problem {
  array: number[];
  target: number;
}

export const EMPTY_PROBLEM: Problem = { array: [], target: 0 };

// Générer un tableau trié de nombres aléatoires
export function generateProblem(arraySize: number): Problem {
  const array = Array.from({ length: arraySize }, () =>
    Math.floor(Math.random() * 100)
  ).sort((a, b) => a - b);

  // Choisir une valeur cible (75% de chance d'être dans le tableau)
  if (Math.random() < 0.75 && array.length > 0) {
    return { array, target: array[Math.floor(Math.random() * array.length)] };
  }
  // Valeur qui n'est pas dans le tableau
  let newTarget;
  do {
    newTarget = Math.floor(Math.random() * 100);
  } while (array.includes(newTarget));
  return { array, target: newTarget };
}

// Générer les étapes pour la recherche linéaire
export function generateLinearSearchSteps(array: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];

  // Étape initiale
  steps.push({
    type: "linear",
    array: [...array],
    target,
    comparisons: 0,
    message: `Recherche de la valeur ${target} dans le tableau.`,
  });

  // Simuler la recherche linéaire
  for (let i = 0; i < array.length; i++) {
    const found = array[i] === target;

    steps.push({
      type: "linear",
      array: [...array],
      target,
      currentIndex: i,
      comparisons: i + 1,
      found,
      message: found
        ? `Valeur ${target} trouvée à l'index ${i} après ${
            i + 1
          } comparaisons.`
        : `Comparaison avec l'élément à l'index ${i}: ${array[i]} ${
            found ? "=" : "≠"
          } ${target}`,
    });

    if (found) break;
  }

  // Si la valeur n'a pas été trouvée
  if (!steps[steps.length - 1].found) {
    steps.push({
      type: "linear",
      array: [...array],
      target,
      comparisons: array.length,
      message: `Valeur ${target} non trouvée après ${array.length} comparaisons.`,
    });
  }

  return steps;
}

// Générer les étapes pour la recherche binaire
export function generateBinarySearchSteps(array: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];

  // Étape initiale
  steps.push({
    type: "binary",
    array: [...array],
    target,
    left: 0,
    right: array.length - 1,
    comparisons: 0,
    message: `Recherche de la valeur ${target} dans le tableau trié.`,
  });

  // Simuler la recherche binaire
  let left = 0;
  let right = array.length - 1;
  let comparisons = 0;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    comparisons++;

    const found = array[middle] === target;

    steps.push({
      type: "binary",
      array: [...array],
      target,
      left,
      right,
      middle,
      comparisons,
      found,
      message: found
        ? `Valeur ${target} trouvée à l'index ${middle} après ${comparisons} comparaisons.`
        : `Comparaison avec l'élément au milieu (index ${middle}): ${
            array[middle]
          } ${array[middle] < target ? "<" : ">"} ${target}`,
    });

    if (found) break;

    if (array[middle] < target) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  // Si la valeur n'a pas été trouvée
  if (!steps[steps.length - 1].found) {
    steps.push({
      type: "binary",
      array: [...array],
      target,
      left,
      right,
      comparisons,
      message: `Valeur ${target} non trouvée après ${comparisons} comparaisons.`,
    });
  }

  return steps;
}
