// Node type for graph
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  highlighted?: boolean;
  visited?: boolean;
}

// Edge type for graph
export interface GraphEdge {
  source: string;
  target: string;
  highlighted?: boolean;
  visited?: boolean;
}

// Graph type
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Traversal types
export type TraversalType = "dfs" | "bfs";

// State type
export interface VisualizationState {
  graph: Graph | null;
  nodeSteps: string[];
  edgeSteps: Array<{ source: string; target: string }>;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  initialized: boolean;
}

// Action types
export type Action =
  | { type: "INITIALIZE"; payload: Graph }
  | {
      type: "SET_TRAVERSAL";
      payload: {
        nodeSteps: string[];
        edgeSteps: Array<{ source: string; target: string }>;
      };
    }
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACKWARD" }
  | { type: "SKIP_TO_END" }
  | { type: "SET_SPEED"; payload: number }
  | { type: "UPDATE_GRAPH"; payload: Graph };
