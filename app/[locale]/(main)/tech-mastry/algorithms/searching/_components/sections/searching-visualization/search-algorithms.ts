import type { ArrayElement } from "./types";

// Implémentation de la recherche linéaire
export function linearSearch(array: ArrayElement[], target: number) {
  const steps = [];
  let found = false;
  let foundIndex = -1;

  // Créer les étapes de la recherche linéaire
  for (let i = 0; i < array.length; i++) {
    steps.push({
      index: i,
      state: array[i].value === target ? "found" : "searching",
    });

    if (array[i].value === target) {
      found = true;
      foundIndex = i;
      break;
    }
  }

  // Si l'élément n'est pas trouvé, marquer tous les éléments comme non trouvés
  if (!found) {
    steps.push({
      index: -1,
      state: "not-found",
    });
  }

  return { steps, found, foundIndex };
}

// Implémentation de la recherche binaire
export function binarySearch(array: ArrayElement[], target: number) {
  const steps = [];
  let left = 0;
  let right = array.length - 1;
  let found = false;
  let foundIndex = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Ajouter l'étape actuelle
    steps.push({
      left,
      right,
      mid,
      state: array[mid].value === target ? "found" : "searching",
    });

    if (array[mid].value === target) {
      found = true;
      foundIndex = mid;
      break;
    }

    if (array[mid].value < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Si l'élément n'est pas trouvé
  if (!found) {
    steps.push({
      left,
      right,
      mid: -1,
      state: "not-found",
    });
  }

  return { steps, found, foundIndex };
}

// Implémentation de la recherche par saut
export function jumpSearch(array: ArrayElement[], target: number) {
  const steps = [];
  let found = false;
  let foundIndex = -1;

  const n = array.length;
  const step = Math.floor(Math.sqrt(n));

  // Étape 1: Trouver le bloc
  let prev = 0;
  let current = Math.min(step, n) - 1;

  // Ajouter l'étape initiale
  steps.push({
    prev,
    current,
    state: "searching",
    blockSearch: true,
  });

  while (array[current].value < target) {
    prev = current + 1;
    current = Math.min(current + step, n - 1);

    // Ajouter l'étape de saut
    steps.push({
      prev,
      current,
      state: "searching",
      blockSearch: true,
    });

    // Si nous avons atteint la fin du tableau
    if (prev >= n) {
      steps.push({
        state: "not-found",
        blockSearch: false,
      });
      return { steps, found, foundIndex };
    }
  }

  // Étape 2: Recherche linéaire dans le bloc
  steps.push({
    message: "Bloc trouvé, début de la recherche linéaire",
    prev,
    current,
    blockSearch: false,
  });

  for (let i = prev; i <= current; i++) {
    // Ajouter l'étape de recherche linéaire
    steps.push({
      index: i,
      state: array[i].value === target ? "found" : "searching",
      blockSearch: false,
    });

    if (array[i].value === target) {
      found = true;
      foundIndex = i;
      break;
    }

    if (array[i].value > target) {
      break;
    }
  }

  // Si l'élément n'est pas trouvé
  if (!found) {
    steps.push({
      state: "not-found",
      blockSearch: false,
    });
  }

  return { steps, found, foundIndex };
}

// Implémentation de la recherche par interpolation
export function interpolationSearch(array: ArrayElement[], target: number) {
  const steps = [];
  let found = false;
  let foundIndex = -1;

  let low = 0;
  let high = array.length - 1;

  while (
    low <= high &&
    target >= array[low].value &&
    target <= array[high].value
  ) {
    // Calculer la position estimée
    let pos;
    if (array[low].value === array[high].value) {
      pos = low;
    } else {
      pos =
        low +
        Math.floor(
          ((high - low) * (target - array[low].value)) /
            (array[high].value - array[low].value)
        );
    }

    // Ajouter l'étape actuelle
    steps.push({
      low,
      high,
      pos,
      state: array[pos].value === target ? "found" : "searching",
      formula: `pos = ${low} + floor((${high} - ${low}) * (${target} - ${array[low].value}) / (${array[high].value} - ${array[low].value}))`,
    });

    if (array[pos].value === target) {
      found = true;
      foundIndex = pos;
      break;
    }

    if (array[pos].value < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }

  // Si l'élément n'est pas trouvé
  if (!found) {
    steps.push({
      state: "not-found",
    });
  }

  return { steps, found, foundIndex };
}
