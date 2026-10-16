import type { HashTableBucket, HashTableEntry, HashTableStep } from "./types";

// Générer les étapes pour vider la table de hachage
export function generateClearSteps(currentBuckets: HashTableBucket[]): HashTableStep[] {
  const steps: HashTableStep[] = [];

  // Étape initiale
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: "Vidage de la table de hachage",
    operation: "clear",
    operationCount: 0,
  });

  // Copier les buckets pour la modification
  const newBuckets = JSON.parse(JSON.stringify(currentBuckets));

  // Marquer tous les buckets comme actifs
  steps.push({
    buckets: JSON.parse(JSON.stringify(newBuckets)),
    activeIndices: newBuckets.map(
      (bucket: HashTableBucket) => bucket.index
    ),
    activeEntries: [],
    message: "Suppression de toutes les entrées",
    operation: "clear",
    operationCount: 1,
  });

  // Vider tous les buckets
  newBuckets.forEach((bucket: HashTableBucket) => {
    bucket.entries = [];
  });

  // Étape finale
  steps.push({
    buckets: JSON.parse(JSON.stringify(newBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: "Table de hachage vidée avec succès",
    operation: "clear",
    operationCount: 2,
    completed: true,
  });

  return steps;
}

// Générer les étapes pour redimensionner la table de hachage
export function generateResizeSteps(currentBuckets: HashTableBucket[], newSize: number): HashTableStep[] {
  const steps: HashTableStep[] = [];

  // Étape initiale
  steps.push({
    buckets: JSON.parse(JSON.stringify(currentBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: `Redimensionnement de la table de hachage à ${newSize} buckets`,
    operation: "resize",
    operationCount: 0,
  });

  // Créer une nouvelle table de hachage avec la nouvelle taille
  const newBuckets: HashTableBucket[] = Array.from(
    { length: newSize },
    (_, index) => ({
      index,
      entries: [],
    })
  );

  steps.push({
    buckets: JSON.parse(JSON.stringify(newBuckets)),
    activeIndices: newBuckets.map((bucket) => bucket.index),
    activeEntries: [],
    message: `Nouvelle table de hachage créée avec ${newSize} buckets`,
    operation: "resize",
    operationCount: 1,
  });

  // Collecter toutes les entrées de l'ancienne table
  const allEntries: HashTableEntry[] = [];
  currentBuckets.forEach((bucket: HashTableBucket) => {
    bucket.entries.forEach((entry: HashTableEntry) => {
      allEntries.push({ ...entry });
    });
  });

  steps.push({
    buckets: JSON.parse(JSON.stringify(newBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: `${allEntries.length} entrées collectées de l'ancienne table`,
    operation: "resize",
    operationCount: 2,
  });

  // Réinsérer toutes les entrées dans la nouvelle table
  let operationCount = 3;

  allEntries.forEach((entry: HashTableEntry, entryIndex) => {
    // Calculer le nouvel index avec la nouvelle taille
    const tempHashFunction = (key: string): number => {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash + key.charCodeAt(i)) % newSize;
      }
      return hash;
    };

    const newBucketIndex = tempHashFunction(entry.key);

    // Ajouter l'entrée au nouveau bucket
    newBuckets[newBucketIndex].entries.push(entry);

    // Ajouter une étape pour chaque réinsertion (limité à 5 pour éviter trop d'étapes)
    if (entryIndex < 5 || entryIndex === allEntries.length - 1) {
      steps.push({
        buckets: JSON.parse(JSON.stringify(newBuckets)),
        activeIndices: [newBucketIndex],
        activeEntries: [entry.id],
        message:
          entryIndex < 5
            ? `Réinsertion de l'entrée (${entry.key}: ${entry.value}) dans le bucket ${newBucketIndex}`
            : `${allEntries.length - 5} autres entrées réinsérées...`,
        operation: "resize",
        operationCount: operationCount++,
      });
    }
  });

  // Étape finale
  steps.push({
    buckets: JSON.parse(JSON.stringify(newBuckets)),
    activeIndices: [],
    activeEntries: [],
    message: `Table de hachage redimensionnée avec succès à ${newSize} buckets`,
    operation: "resize",
    operationCount: operationCount,
    completed: true,
  });

  return steps;
}
