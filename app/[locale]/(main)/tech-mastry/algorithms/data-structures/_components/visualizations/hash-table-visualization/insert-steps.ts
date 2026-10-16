import { hashFunction } from "./hash-function";
import type { HashTableBucket, HashTableEntry, HashTableStep } from "./types";

// Générer les étapes pour l'insertion d'une paire clé-valeur
export function generateInsertSteps(
  currentBuckets: HashTableBucket[],
  key: string,
  value: string,
  size: number
): HashTableStep[] {
  const steps: HashTableStep[] = [];

  // Étape initiale
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: `Insertion de la paire clé-valeur (${key}: ${value})`,
    operation: "insert",
    operationCount: 0,
    targetKey: key,
    targetValue: value,
  });

  // Calculer l'index du bucket avec la fonction de hachage
  const bucketIndex = hashFunction(key, size);

  // Étape de calcul de l'index
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [bucketIndex],
    activeEntries: [],
    message: `Calcul de l'index avec la fonction de hachage: hash("${key}") = ${bucketIndex}`,
    operation: "insert",
    operationCount: 1,
    targetKey: key,
    targetValue: value,
    targetIndex: bucketIndex,
  });

  // Copier les buckets pour la modification
  const newBuckets = JSON.parse(JSON.stringify(currentBuckets));
  const bucket = newBuckets[bucketIndex];

  // Vérifier si la clé existe déjà
  const existingEntryIndex = bucket.entries.findIndex(
    (entry: HashTableEntry) => entry.key === key
  );

  if (existingEntryIndex !== -1) {
    // La clé existe déjà, mettre à jour la valeur
    const existingEntryId = bucket.entries[existingEntryIndex].id;

    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [existingEntryId],
      message: `La clé "${key}" existe déjà dans le bucket ${bucketIndex}. Mise à jour de la valeur.`,
      operation: "insert",
      operationCount: 2,
      targetKey: key,
      targetValue: value,
      targetIndex: bucketIndex,
    });

    // Mettre à jour la valeur
    bucket.entries[existingEntryIndex].value = value;

    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [existingEntryId],
      message: `Valeur mise à jour pour la clé "${key}": ${value}`,
      operation: "insert",
      operationCount: 3,
      targetKey: key,
      targetValue: value,
      targetIndex: bucketIndex,
      completed: true,
    });
  } else {
    // La clé n'existe pas, ajouter une nouvelle entrée
    const newEntry: HashTableEntry = {
      key,
      value,
      id: `entry-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}`,
    };

    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [],
      message: `La clé "${key}" n'existe pas dans le bucket ${bucketIndex}. Ajout d'une nouvelle entrée.`,
      operation: "insert",
      operationCount: 2,
      targetKey: key,
      targetValue: value,
      targetIndex: bucketIndex,
    });

    // Ajouter la nouvelle entrée
    bucket.entries.push(newEntry);

    steps.push({
      buckets: JSON.parse(JSON.stringify(newBuckets)),
      activeIndices: [bucketIndex],
      activeEntries: [newEntry.id],
      message: `Nouvelle entrée ajoutée au bucket ${bucketIndex}: (${key}: ${value})`,
      operation: "insert",
      operationCount: 3,
      targetKey: key,
      targetValue: value,
      targetIndex: bucketIndex,
      completed: true,
    });
  }

  return steps;
}
