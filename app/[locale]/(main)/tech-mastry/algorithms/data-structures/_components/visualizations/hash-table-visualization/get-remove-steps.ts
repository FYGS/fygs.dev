import { hashFunction } from "./hash-function";
import type { HashTableBucket, HashTableEntry, HashTableStep } from "./types";

// Générer les étapes pour la recherche d'une valeur par clé
export function generateGetSteps(currentBuckets: HashTableBucket[], key: string, size: number): HashTableStep[] {
  const steps: HashTableStep[] = [];

  // Étape initiale
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: `Recherche de la valeur associée à la clé "${key}"`,
    operation: "get",
    operationCount: 0,
    targetKey: key,
  });

  // Calculer l'index du bucket avec la fonction de hachage
  const bucketIndex = hashFunction(key, size);

  // Étape de calcul de l'index
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [bucketIndex],
    activeEntries: [],
    message: `Calcul de l'index avec la fonction de hachage: hash("${key}") = ${bucketIndex}`,
    operation: "get",
    operationCount: 1,
    targetKey: key,
    targetIndex: bucketIndex,
  });

  // Rechercher la clé dans le bucket
  const bucket = currentBuckets[bucketIndex];
  const existingEntry = bucket.entries.find(
    (entry: HashTableEntry) => entry.key === key
  );

  if (existingEntry) {
    // La clé a été trouvée
    steps.push({
      buckets: JSON.parse(JSON.stringify(currentBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [existingEntry.id],
      message: `Clé "${key}" trouvée dans le bucket ${bucketIndex}. Valeur associée: ${existingEntry.value}`,
      operation: "get",
      operationCount: 2,
      targetKey: key,
      targetValue: existingEntry.value,
      targetIndex: bucketIndex,
      found: true,
      completed: true,
    });
  } else {
    // La clé n'a pas été trouvée
    steps.push({
      buckets: JSON.parse(JSON.stringify(currentBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [],
      message: `Clé "${key}" non trouvée dans le bucket ${bucketIndex}.`,
      operation: "get",
      operationCount: 2,
      targetKey: key,
      targetIndex: bucketIndex,
      found: false,
      completed: true,
    });
  }

  return steps;
}

// Générer les étapes pour la suppression d'une entrée par clé
export function generateRemoveSteps(currentBuckets: HashTableBucket[], key: string, size: number): HashTableStep[] {
  const steps: HashTableStep[] = [];

  // Étape initiale
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: `Suppression de l'entrée avec la clé "${key}"`,
    operation: "remove",
    operationCount: 0,
    targetKey: key,
  });

  // Calculer l'index du bucket avec la fonction de hachage
  const bucketIndex = hashFunction(key, size);

  // Étape de calcul de l'index
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [bucketIndex],
    activeEntries: [],
    message: `Calcul de l'index avec la fonction de hachage: hash("${key}") = ${bucketIndex}`,
    operation: "remove",
    operationCount: 1,
    targetKey: key,
    targetIndex: bucketIndex,
  });

  // Copier les buckets pour la modification
  const newBuckets = JSON.parse(JSON.stringify(currentBuckets));
  const bucket = newBuckets[bucketIndex];

  // Rechercher la clé dans le bucket
  const existingEntryIndex = bucket.entries.findIndex(
    (entry: HashTableEntry) => entry.key === key
  );

  if (existingEntryIndex !== -1) {
    // La clé a été trouvée
    const existingEntry = bucket.entries[existingEntryIndex];

    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [existingEntry.id],
      message: `Clé "${key}" trouvée dans le bucket ${bucketIndex}. Suppression de l'entrée.`,
      operation: "remove",
      operationCount: 2,
      targetKey: key,
      targetValue: existingEntry.value,
      targetIndex: bucketIndex,
      found: true,
    });

    // Supprimer l'entrée
    bucket.entries.splice(existingEntryIndex, 1);

    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [],
      message: `Entrée avec la clé "${key}" supprimée du bucket ${bucketIndex}.`,
      operation: "remove",
      operationCount: 3,
      targetKey: key,
      targetIndex: bucketIndex,
      found: true,
      completed: true,
    });
  } else {
    // La clé n'a pas été trouvée
    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [],
      message: `Clé "${key}" non trouvée dans le bucket ${bucketIndex}. Aucune suppression effectuée.`,
      operation: "remove",
      operationCount: 2,
      targetKey: key,
      targetIndex: bucketIndex,
      found: false,
      completed: true,
    });
  }

  return steps;
}
