import type { GraphStep } from "./types";

// Obtenir les statistiques pour l'étape actuelle
export function getGraphStats(currentStep: GraphStep) {
  const stats: { label: string; value: string | number }[] = [
    { label: "Nœuds", value: currentStep.nodes.length },
    { label: "Arêtes", value: currentStep.edges.length },
    { label: "Opérations", value: currentStep.operationCount },
  ];

  // Ajouter des statistiques spécifiques à l'opération
  switch (currentStep.operation) {
    case "bfs":
      stats.push({ label: "Complexité", value: "O(V+E)" });
      stats.push({ label: "Note", value: "V = nœuds, E = arêtes" });
      break;
    case "dfs":
      stats.push({ label: "Complexité", value: "O(V+E)" });
      stats.push({ label: "Note", value: "V = nœuds, E = arêtes" });
      break;
    case "dijkstra":
      stats.push({ label: "Complexité", value: "O(E log V)" });
      stats.push({ label: "Note", value: "V = nœuds, E = arêtes" });
      break;
  }

  return stats;
}
