import type { HashTableStep } from "./types";

// Obtenir les statistiques pour l'étape actuelle
export function getHashStats(currentStep: HashTableStep) {
  const stats: { label: string; value: string | number }[] = [
    { label: "Opérations", value: currentStep.operationCount },
  ];

  // Ajouter des statistiques spécifiques à l'opération
  switch (currentStep.operation) {
    case "insert":
    case "get":
    case "remove":
      stats.push({ label: "Complexité", value: "O(1) moyen" });
      stats.push({
        label: "Note",
        value: "O(n) dans le pire cas (toutes les clés dans le même bucket)",
      });
      break;
    case "clear":
      stats.push({ label: "Complexité", value: "O(m)" });
      stats.push({ label: "Note", value: "m = nombre de buckets" });
      break;
    case "resize":
      stats.push({ label: "Complexité", value: "O(n+m)" });
      stats.push({
        label: "Note",
        value: "n = nombre d'entrées, m = nouvelle taille",
      });
      break;
  }

  return stats;
}
