// Types d'opérations
export type OperationType =
  | "addNode"
  | "addEdge"
  | "removeNode"
  | "removeEdge"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "clear";

// Type de graphe
export type GraphType = "directed" | "undirected";

// Interface pour un nœud du graphe
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

// Interface pour une arête du graphe
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed: boolean;
}

// Interface pour une étape de visualisation
export interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeNodeIds: string[];
  activeEdgeIds: string[];
  visitedNodeIds: string[];
  message: string;
  operation: OperationType;
  operationCount: number;
  completed?: boolean;
}
