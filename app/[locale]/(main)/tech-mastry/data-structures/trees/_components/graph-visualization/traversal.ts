import type { Graph, TraversalType } from "./types";

// Get traversal steps
export const getTraversalSteps = (
  graph: Graph,
  startNodeId: string,
  type: TraversalType
): { nodes: string[]; edges: Array<{ source: string; target: string }> } => {
  const adjacencyList: Record<string, string[]> = {};

  // Build adjacency list
  graph.nodes.forEach((node) => {
    adjacencyList[node.id] = [];
  });

  graph.edges.forEach((edge) => {
    adjacencyList[edge.source].push(edge.target);
    adjacencyList[edge.target].push(edge.source); // For undirected graph
  });

  const visitedNodes: string[] = [];
  const visitedEdges: Array<{ source: string; target: string }> = [];

  if (type === "dfs") {
    // DFS implementation
    const visited: Record<string, boolean> = {};

    const dfs = (nodeId: string, parent: string | null = null) => {
      if (visited[nodeId]) return;

      visited[nodeId] = true;
      visitedNodes.push(nodeId);

      if (parent !== null) {
        visitedEdges.push({ source: parent, target: nodeId });
      }

      for (const neighbor of adjacencyList[nodeId]) {
        if (!visited[neighbor]) {
          dfs(neighbor, nodeId);
        }
      }
    };

    dfs(startNodeId);
  } else {
    // BFS implementation
    const visited: Record<string, boolean> = {};
    const queue: Array<{ id: string; parent: string | null }> = [
      { id: startNodeId, parent: null },
    ];

    visited[startNodeId] = true;

    while (queue.length > 0) {
      const { id: nodeId, parent } = queue.shift()!;
      visitedNodes.push(nodeId);

      if (parent !== null) {
        visitedEdges.push({ source: parent, target: nodeId });
      }

      for (const neighbor of adjacencyList[nodeId]) {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push({ id: neighbor, parent: nodeId });
        }
      }
    }
  }

  return { nodes: visitedNodes, edges: visitedEdges };
};

// Get explanation for each step
export const getStepExplanation = (
  traversalType: TraversalType,
  currentStep: number,
  totalSteps: number,
  currentNodeId: string | null
): string => {
  if (!currentNodeId) return "";

  switch (traversalType) {
    case "dfs":
      return `Parcours en profondeur (DFS): Visite du nœud ${currentNodeId} (étape ${
        currentStep + 1
      }/${totalSteps})`;
    case "bfs":
      return `Parcours en largeur (BFS): Visite du nœud ${currentNodeId} (étape ${
        currentStep + 1
      }/${totalSteps})`;
    default:
      return "";
  }
};

// Reset all highlights in a graph
export const resetGraphHighlights = (graph: Graph): Graph => {
  if (!graph) return graph;

  return {
    nodes: graph.nodes.map((node) => ({
      ...node,
      highlighted: false,
      visited: false,
    })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      highlighted: false,
      visited: false,
    })),
  };
};

// Update highlights in a graph based on current step
export const updateGraphHighlights = (
  graph: Graph,
  currentStep: number,
  nodeSteps: string[],
  edgeSteps: Array<{ source: string; target: string }>
): Graph => {
  if (!graph || currentStep < 0 || currentStep >= nodeSteps.length) {
    return graph;
  }

  const visitedNodeIds = nodeSteps.slice(0, currentStep + 1);
  const visitedEdgePairs = edgeSteps.slice(0, currentStep);

  const updatedNodes = graph.nodes.map((node) => ({
    ...node,
    highlighted: node.id === nodeSteps[currentStep],
    visited: visitedNodeIds.includes(node.id),
  }));

  const updatedEdges = graph.edges.map((edge) => {
    const isVisited = visitedEdgePairs.some(
      (pair) =>
        (pair.source === edge.source && pair.target === edge.target) ||
        (pair.source === edge.target && pair.target === edge.source)
    );

    const isHighlighted =
      visitedEdgePairs.length > 0 &&
      ((visitedEdgePairs[visitedEdgePairs.length - 1].source === edge.source &&
        visitedEdgePairs[visitedEdgePairs.length - 1].target === edge.target) ||
        (visitedEdgePairs[visitedEdgePairs.length - 1].source === edge.target &&
          visitedEdgePairs[visitedEdgePairs.length - 1].target ===
            edge.source));

    return {
      ...edge,
      highlighted: isHighlighted,
      visited: isVisited,
    };
  });

  return { nodes: updatedNodes, edges: updatedEdges };
};
