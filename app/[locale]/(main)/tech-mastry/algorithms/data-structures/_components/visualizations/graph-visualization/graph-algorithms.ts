import { MinHeap } from "./min-heap";
import type { GraphEdge, GraphNode, GraphStep } from "./types";

type Neighbor = { nodeId: string; edgeId: string; weight: number };

// Liste d'adjacence construite une seule fois en O(V+E) : chaque nœud y retrouve
// ses voisins en O(deg) au lieu de rescanner toutes les arêtes (O(E) par nœud).
function buildAdjacency(edges: GraphEdge[]): Map<string, Neighbor[]> {
  const adjacency = new Map<string, Neighbor[]>();
  const add = (from: string, neighbor: Neighbor) => {
    const list = adjacency.get(from);
    if (list) list.push(neighbor);
    else adjacency.set(from, [neighbor]);
  };
  for (const edge of edges) {
    add(edge.source, { nodeId: edge.target, edgeId: edge.id, weight: edge.weight });
    if (!edge.directed) {
      add(edge.target, { nodeId: edge.source, edgeId: edge.id, weight: edge.weight });
    }
  }
  return adjacency;
}

// Les générateurs d'étapes ci-dessous sont purs : `lastOperationCount` est le
// compteur d'opérations de la dernière étape déjà enregistrée.

// Parcours en largeur (BFS)
export function generateBfsSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  lastOperationCount: number
): GraphStep[] {
  // Créer une copie des nœuds et arêtes
  const currentNodes = [...nodes];
  const currentEdges = [...edges];

  // Initialiser les structures de données pour le BFS
  // File = tableau + index de tête (head) : défiler est O(1), BFS en O(V+E)
  // (queue.shift() décalerait tout le tableau à chaque défilement).
  const adjacency = buildAdjacency(currentEdges);
  const queue: string[] = [startNodeId];
  let head = 0;
  const visited = new Set<string>([startNodeId]);
  const visitOrder: string[] = [startNodeId];
  const edgesUsed: string[] = [];

  // Créer les étapes de visualisation
  const bfsSteps: GraphStep[] = [];

  // Étape initiale
  bfsSteps.push({
    nodes: currentNodes,
    edges: currentEdges,
    activeNodeIds: [startNodeId],
    activeEdgeIds: [],
    visitedNodeIds: [startNodeId],
    message: `Début du parcours en largeur (BFS) depuis le nœud "${
          currentNodes.find((n) => n.id === startNodeId)?.label
        }"`,
    operation: "bfs",
    operationCount: lastOperationCount + 1,
  });

  // Exécuter le BFS
  while (head < queue.length) {
    const currentNodeId = queue[head++];

    // Voisins du nœud actuel (liste d'adjacence)
    const neighbors = adjacency.get(currentNodeId) ?? [];

    // Visiter chaque voisin non visité
    for (const { nodeId, edgeId } of neighbors) {
      if (!visited.has(nodeId)) {
        // Marquer comme visité
        visited.add(nodeId);
        visitOrder.push(nodeId);
        queue.push(nodeId);
        edgesUsed.push(edgeId);

        // Ajouter une étape pour cette visite
        bfsSteps.push({
          nodes: currentNodes,
          edges: currentEdges,
          activeNodeIds: [nodeId],
          activeEdgeIds: [edgeId],
          visitedNodeIds: [...visitOrder],
          message: `Visite du nœud "${
                currentNodes.find((n) => n.id === nodeId)?.label
              }" depuis "${
                currentNodes.find((n) => n.id === currentNodeId)?.label
              }"`,
          operation: "bfs",
          operationCount:
            lastOperationCount + 1 + bfsSteps.length,
        });
      }
    }
  }

  // Étape finale
  bfsSteps.push({
    nodes: currentNodes,
    edges: currentEdges,
    activeNodeIds: [],
    activeEdgeIds: [],
    visitedNodeIds: [...visitOrder],
    message: `Parcours en largeur (BFS) terminé. Ordre de visite: ${visitOrder
          .map((id) => currentNodes.find((n) => n.id === id)?.label)
          .join(" -> ")}`,
    operation: "bfs",
    operationCount:
      lastOperationCount + 1 + bfsSteps.length,
    completed: true,
  });

  return bfsSteps;
}

// Parcours en profondeur (DFS)
export function generateDfsSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  lastOperationCount: number
): GraphStep[] {
  // Créer une copie des nœuds et arêtes
  const currentNodes = [...nodes];
  const currentEdges = [...edges];

  // Initialiser les structures de données pour le DFS
  const visited = new Set<string>();
  const visitOrder: string[] = [];
  const edgesUsed: string[] = [];

  // Créer les étapes de visualisation
  const dfsSteps: GraphStep[] = [];

  // Étape initiale
  dfsSteps.push({
    nodes: currentNodes,
    edges: currentEdges,
    activeNodeIds: [startNodeId],
    activeEdgeIds: [],
    visitedNodeIds: [],
    message: `Début du parcours en profondeur (DFS) depuis le nœud "${
          currentNodes.find((n) => n.id === startNodeId)?.label
        }"`,
    operation: "dfs",
    operationCount: lastOperationCount + 1,
  });

  // Fonction récursive pour le DFS (les voisins sont explorés dans l'ordre des
  // arêtes : le premier voisin d'abord, comme dans un DFS récursif classique ;
  // un DFS itératif avec pile devrait empiler les voisins à l'envers pour
  // produire le même ordre de visite).
  const adjacency = buildAdjacency(currentEdges);
  const dfs = (nodeId: string, parentId: string | null = null) => {
    // Marquer comme visité
    visited.add(nodeId);
    visitOrder.push(nodeId);

    // Ajouter une étape pour cette visite
    dfsSteps.push({
      nodes: currentNodes,
      edges: currentEdges,
      activeNodeIds: [nodeId],
      activeEdgeIds: parentId
        ? [
            currentEdges.find(
              (e) =>
                (e.source === parentId && e.target === nodeId) ||
                (!e.directed &&
                  e.source === nodeId &&
                  e.target === parentId)
            )?.id || "",
          ]
        : [],
      visitedNodeIds: [...visitOrder],
      message: `Visite du nœud "${
            currentNodes.find((n) => n.id === nodeId)?.label
          }"${
            parentId
              ? ` depuis "${
              currentNodes.find((n) => n.id === parentId)?.label
            }"`
              : ""
          }`,
      operation: "dfs",
      operationCount:
        lastOperationCount + 1 + dfsSteps.length,
    });

    // Visiter chaque voisin non visité
    for (const { nodeId: neighborId, edgeId } of adjacency.get(nodeId) ?? []) {
      if (!visited.has(neighborId)) {
        edgesUsed.push(edgeId);
        dfs(neighborId, nodeId);
      }
    }
  };

  // Exécuter le DFS
  dfs(startNodeId);

  // Étape finale
  dfsSteps.push({
    nodes: currentNodes,
    edges: currentEdges,
    activeNodeIds: [],
    activeEdgeIds: [],
    visitedNodeIds: [...visitOrder],
    message: `Parcours en profondeur (DFS) terminé. Ordre de visite: ${visitOrder
          .map((id) => currentNodes.find((n) => n.id === id)?.label)
          .join(" -> ")}`,
    operation: "dfs",
    operationCount:
      lastOperationCount + 1 + dfsSteps.length,
    completed: true,
  });

  return dfsSteps;
}

// Algorithme de Dijkstra pour le plus court chemin
export function generateDijkstraSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  endNodeId: string,
  lastOperationCount: number
): GraphStep[] {
  // Créer une copie des nœuds et arêtes
  const currentNodes = [...nodes];
  const currentEdges = [...edges];

  // Initialiser les structures de données pour Dijkstra
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Initialiser les distances
  currentNodes.forEach((node) => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  // Créer les étapes de visualisation
  const dijkstraSteps: GraphStep[] = [];

  // Étape initiale
  dijkstraSteps.push({
    nodes: currentNodes,
    edges: currentEdges,
    activeNodeIds: [startNodeId],
    activeEdgeIds: [],
    visitedNodeIds: [],
    message: `Début de l'algorithme de Dijkstra depuis "${
          currentNodes.find((n) => n.id === startNodeId)?.label
        }" vers "${currentNodes.find((n) => n.id === endNodeId)?.label}"`,
    operation: "dijkstra",
    operationCount: lastOperationCount + 1,
  });

  // Exécuter l'algorithme de Dijkstra avec un tas binaire min (file de priorité) :
  // chaque push/pop coûte O(log n), d'où O((V+E) log V) au total (listes
  // d'adjacence + suppression paresseuse des entrées périmées).
  const adjacency = buildAdjacency(currentEdges);
  const heap = new MinHeap<{ nodeId: string; distance: number }>(
    (x, y) => x.distance - y.distance
  );
  heap.push({ nodeId: startNodeId, distance: 0 });

  while (heap.size > 0) {
    const { nodeId: currentNodeId, distance } = heap.pop()!;

    // Entrée périmée : le nœud est déjà finalisé ou une meilleure distance existe
    if (!unvisited.has(currentNodeId) || distance > distances[currentNodeId]) {
      continue;
    }

    // Nous avons atteint le nœud cible : sa distance est définitive
    if (currentNodeId === endNodeId) {
      break;
    }

    // Retirer le nœud actuel des non visités (distance définitive)
    unvisited.delete(currentNodeId);

    // Mettre à jour les distances des voisins
    for (const { nodeId: neighborId, edgeId, weight } of adjacency.get(
      currentNodeId
    ) ?? []) {
      if (unvisited.has(neighborId)) {
        const tentativeDistance = distances[currentNodeId] + weight;

        if (tentativeDistance < distances[neighborId]) {
          distances[neighborId] = tentativeDistance;
          previous[neighborId] = currentNodeId;
          heap.push({ nodeId: neighborId, distance: tentativeDistance });

          // Ajouter une étape pour cette mise à jour
          dijkstraSteps.push({
            nodes: currentNodes,
            edges: currentEdges,
            activeNodeIds: [neighborId, currentNodeId],
            activeEdgeIds: [edgeId],
            visitedNodeIds: Array.from(
              currentNodes
                .map((n) => n.id)
                .filter((id) => !unvisited.has(id))
            ),
            message: `Mise à jour de la distance de "${
                  currentNodes.find((n) => n.id === neighborId)?.label
                }" à ${tentativeDistance} via "${
                  currentNodes.find((n) => n.id === currentNodeId)?.label
                }"`,
            operation: "dijkstra",
            operationCount:
              lastOperationCount +
              1 +
              dijkstraSteps.length,
          });
        }
      }
    }
  }

  // Reconstruire le chemin
  const path: string[] = [];
  let current = endNodeId;

  while (current) {
    path.unshift(current);
    current = previous[current] || "";
    if (!current) break;
  }

  // Vérifier si un chemin a été trouvé
  if (path.length <= 1 || path[0] !== startNodeId) {
    // Aucun chemin trouvé
    dijkstraSteps.push({
      nodes: currentNodes,
      edges: currentEdges,
      activeNodeIds: [startNodeId, endNodeId],
      activeEdgeIds: [],
      visitedNodeIds: Array.from(
        currentNodes.map((n) => n.id).filter((id) => !unvisited.has(id))
      ),
      message: `Aucun chemin trouvé entre "${
            currentNodes.find((n) => n.id === startNodeId)?.label
          }" et "${currentNodes.find((n) => n.id === endNodeId)?.label}"`,
      operation: "dijkstra",
      operationCount:
        lastOperationCount + 1 + dijkstraSteps.length,
      completed: true,
    });
  } else {
    // Chemin trouvé
    const pathEdges: string[] = [];

    // Trouver les arêtes du chemin
    for (let i = 0; i < path.length - 1; i++) {
      const edge = currentEdges.find(
        (e) =>
          (e.source === path[i] && e.target === path[i + 1]) ||
          (!e.directed && e.source === path[i + 1] && e.target === path[i])
      );

      if (edge) pathEdges.push(edge.id);
    }

    // Étape finale avec le chemin trouvé
    dijkstraSteps.push({
      nodes: currentNodes,
      edges: currentEdges,
      activeNodeIds: [...path],
      activeEdgeIds: [...pathEdges],
      visitedNodeIds: Array.from(
        currentNodes.map((n) => n.id).filter((id) => !unvisited.has(id))
      ),
      message: `Chemin le plus court trouvé entre "${
            currentNodes.find((n) => n.id === startNodeId)?.label
          }" et "${currentNodes.find((n) => n.id === endNodeId)?.label}": ${path
            .map((id) => currentNodes.find((n) => n.id === id)?.label)
            .join(" -> ")} (distance totale: ${distances[endNodeId]})`,
      operation: "dijkstra",
      operationCount:
        lastOperationCount + 1 + dijkstraSteps.length,
      completed: true,
    });
  }

  return dijkstraSteps;
}
