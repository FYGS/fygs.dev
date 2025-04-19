"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/custom-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

// Node type for graph
interface GraphNode {
  id: string;
  x: number;
  y: number;
  highlighted?: boolean;
  visited?: boolean;
}

// Edge type for graph
interface GraphEdge {
  source: string;
  target: string;
  highlighted?: boolean;
  visited?: boolean;
}

// Graph type
interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Traversal types
type TraversalType = "dfs" | "bfs";

// State type
interface VisualizationState {
  graph: Graph | null;
  nodeSteps: string[];
  edgeSteps: Array<{ source: string; target: string }>;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  initialized: boolean;
}

// Action types
type Action =
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

// Create a sample graph
const createSampleGraph = (): Graph => {
  return {
    nodes: [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 0, y: 0 },
      { id: "C", x: 0, y: 0 },
      { id: "D", x: 0, y: 0 },
      { id: "E", x: 0, y: 0 },
      { id: "F", x: 0, y: 0 },
      { id: "G", x: 0, y: 0 },
    ],
    edges: [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "A", target: "E" },
      { source: "B", target: "D" },
      { source: "C", target: "F" },
      { source: "E", target: "F" },
      { source: "F", target: "G" },
    ],
  };
};

// Calculate positions for graph visualization using optimized force-directed layout
const calculatePositions = (graph: Graph): Graph => {
  // Create a deep clone to avoid mutating the original
  const nodes = [...graph.nodes.map((node) => ({ ...node }))];
  const edges = [...graph.edges.map((edge) => ({ ...edge }))];

  // Create a node lookup map for faster edge processing
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  // Set initial positions in a circle
  const radius = 150;
  const centerX = 0;
  const centerY = 0;

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });

  // Optimized force-directed layout simulation
  const iterations = 50;
  const repulsionForce = 5000;
  const attractionForce = 0.05;
  const dampingFactor = 0.95; // Add damping to improve stability

  // Pre-calculate edge connections for faster lookup
  const edgeConnections = edges.map((edge) => ({
    source: nodeMap.get(edge.source)!,
    target: nodeMap.get(edge.target)!,
    edge,
  }));

  for (let iter = 0; iter < iterations; iter++) {
    // Calculate repulsion forces between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared) || 1;

        // Apply inverse square law with minimum distance to prevent extreme forces
        const force = repulsionForce / Math.max(distanceSquared, 10);

        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;

        nodes[i].x -= forceX;
        nodes[i].y -= forceY;
        nodes[j].x += forceX;
        nodes[j].y += forceY;
      }
    }

    // Calculate attraction forces along edges using the pre-calculated connections
    for (const { source, target } of edgeConnections) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      // Apply Hooke's law with optimal distance
      const optimalDistance = 100;
      const force = (distance - optimalDistance) * attractionForce;

      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      source.x += forceX * dampingFactor;
      source.y += forceY * dampingFactor;
      target.x -= forceX * dampingFactor;
      target.y -= forceY * dampingFactor;
    }
  }

  return { nodes, edges };
};

// Get traversal steps
const getTraversalSteps = (
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
const getStepExplanation = (
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
const resetGraphHighlights = (graph: Graph): Graph => {
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
const updateGraphHighlights = (
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

// Reducer function
function reducer(
  state: VisualizationState,
  action: Action
): VisualizationState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        graph: action.payload,
        currentStep: -1,
        isPlaying: false,
        initialized: true,
      };
    case "SET_TRAVERSAL":
      return {
        ...state,
        nodeSteps: action.payload.nodeSteps,
        edgeSteps: action.payload.edgeSteps,
        currentStep: -1,
        isPlaying: false,
      };
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };
    case "PLAY":
      return {
        ...state,
        isPlaying: true,
      };
    case "PAUSE":
      return {
        ...state,
        isPlaying: false,
      };
    case "RESET":
      return {
        ...state,
        currentStep: -1,
        isPlaying: false,
      };
    case "STEP_FORWARD":
      if (state.currentStep < state.nodeSteps.length - 1) {
        return {
          ...state,
          currentStep: state.currentStep + 1,
        };
      }
      return state;
    case "STEP_BACKWARD":
      if (state.currentStep > 0) {
        return {
          ...state,
          currentStep: state.currentStep - 1,
        };
      }
      return state;
    case "SKIP_TO_END":
      return {
        ...state,
        currentStep: state.nodeSteps.length - 1,
        isPlaying: false,
      };
    case "SET_SPEED":
      return {
        ...state,
        speed: action.payload,
      };
    case "UPDATE_GRAPH":
      return {
        ...state,
        graph: action.payload,
      };
    default:
      return state;
  }
}

export function GraphVisualization() {
  // State for traversal type and start node
  const [traversalType, setTraversalType] = useState<TraversalType>("dfs");
  const [startNode, setStartNode] = useState<string>("A");

  // Refs to prevent infinite loops
  const graphRef = useRef<Graph | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Use reducer for main state management
  const [state, dispatch] = useReducer(reducer, {
    graph: null,
    nodeSteps: [],
    edgeSteps: [],
    currentStep: -1,
    isPlaying: false,
    speed: 1,
    initialized: false,
  });

  // UI state
  const [showHint, setShowHint] = useState<boolean>(false);

  // Initialize graph only once
  useEffect(() => {
    if (initializedRef.current) return;

    // Create and position the graph
    const sampleGraph = createSampleGraph();
    const positionedGraph = calculatePositions(sampleGraph);

    // Store in ref for stability
    graphRef.current = positionedGraph;

    // Calculate initial traversal steps
    const { nodes, edges } = getTraversalSteps(
      positionedGraph,
      startNode,
      traversalType
    );

    // Initialize state
    dispatch({
      type: "INITIALIZE",
      payload: positionedGraph,
    });

    dispatch({
      type: "SET_TRAVERSAL",
      payload: {
        nodeSteps: nodes,
        edgeSteps: edges,
      },
    });

    initializedRef.current = true;
  }, [startNode, traversalType]); // Add dependencies

  // Memoize traversal steps calculation for better performance
  const traversalSteps = useMemo(() => {
    if (!initializedRef.current || !graphRef.current) return null;

    // Calculate new traversal steps
    return getTraversalSteps(graphRef.current, startNode, traversalType);
  }, [traversalType, startNode]);

  // Handle traversal type or start node changes
  useEffect(() => {
    if (!initializedRef.current || !graphRef.current || !traversalSteps) return;

    // Reset the graph highlights
    const resetGraph = resetGraphHighlights(graphRef.current);

    // Update the graph ref
    graphRef.current = resetGraph;

    // Update state
    dispatch({
      type: "UPDATE_GRAPH",
      payload: resetGraph,
    });

    dispatch({
      type: "SET_TRAVERSAL",
      payload: {
        nodeSteps: traversalSteps.nodes,
        edgeSteps: traversalSteps.edges,
      },
    });
  }, [traversalSteps]);

  // Update highlights when current step changes
  useEffect(() => {
    if (!initializedRef.current || !graphRef.current || state.currentStep < 0)
      return;

    try {
      // Update graph highlights
      const updatedGraph = updateGraphHighlights(
        graphRef.current,
        state.currentStep,
        state.nodeSteps,
        state.edgeSteps
      );

      // Update the graph ref and state
      graphRef.current = updatedGraph;

      dispatch({
        type: "UPDATE_GRAPH",
        payload: updatedGraph,
      });
    } catch (error) {
      console.error("Error updating graph highlights:", error);
      // Fallback to reset if there's an error
      if (graphRef.current) {
        const resetGraph = resetGraphHighlights(graphRef.current);
        graphRef.current = resetGraph;
        dispatch({ type: "UPDATE_GRAPH", payload: resetGraph });
      }
    }
  }, [state.currentStep, state.nodeSteps, state.edgeSteps]);

  // Animation loop with error handling
  useEffect(() => {
    // Safety checks
    if (!state.isPlaying || state.currentStep >= state.nodeSteps.length - 1) {
      if (state.isPlaying) {
        dispatch({ type: "PAUSE" });
      }
      return;
    }

    // Use a try-catch block to handle any potential errors
    try {
      const timer = setTimeout(() => {
        dispatch({ type: "STEP_FORWARD" });
      }, 1000 / state.speed);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error in animation loop:", error);
      // Ensure we pause the animation if there's an error
      dispatch({ type: "PAUSE" });
    }
  }, [state.isPlaying, state.currentStep, state.nodeSteps.length, state.speed]);

  // Set speed
  const handleSpeedChange = useCallback((value: number[]) => {
    dispatch({ type: "SET_SPEED", payload: value[0] });
  }, []);

  // Play/pause traversal
  const togglePlay = useCallback(() => {
    if (state.currentStep >= state.nodeSteps.length - 1) {
      // If at the end, restart
      dispatch({ type: "RESET" });

      // Reset graph highlights
      if (graphRef.current) {
        const resetGraph = resetGraphHighlights(graphRef.current);
        graphRef.current = resetGraph;
        dispatch({ type: "UPDATE_GRAPH", payload: resetGraph });
      }

      dispatch({ type: "PLAY" });
    } else {
      dispatch({
        type: state.isPlaying ? "PAUSE" : "PLAY",
      });
    }
  }, [state.currentStep, state.nodeSteps.length, state.isPlaying]);

  // Reset traversal
  const resetTraversal = useCallback(() => {
    dispatch({ type: "RESET" });

    // Reset graph highlights
    if (graphRef.current) {
      const resetGraph = resetGraphHighlights(graphRef.current);
      graphRef.current = resetGraph;
      dispatch({ type: "UPDATE_GRAPH", payload: resetGraph });
    }
  }, []);

  // Step forward
  const stepForward = useCallback(() => {
    dispatch({ type: "STEP_FORWARD" });
  }, []);

  // Step backward
  const stepBackward = useCallback(() => {
    dispatch({ type: "STEP_BACKWARD" });
  }, []);

  // Skip to end
  const skipToEnd = useCallback(() => {
    dispatch({ type: "SKIP_TO_END" });
  }, []);

  // Change traversal type
  const handleTraversalTypeChange = useCallback((type: TraversalType) => {
    setTraversalType(type);
  }, []);

  // Change start node
  const handleStartNodeChange = useCallback((nodeId: string) => {
    setStartNode(nodeId);
  }, []);

  // If not initialized yet, show loading state
  if (!state.initialized) {
    return (
      <Card className="w-full overflow-hidden border border-border/50 shadow-md">
        <CardContent className="p-6 flex justify-center items-center h-[450px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initialisation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden border border-border/50 shadow-md">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Visualisation d&apos;un Graphe
            </h3>
            <p className="text-sm text-muted-foreground">
              Explorez les différents types de parcours d&apos;un graphe
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Départ:</span>
              <Select value={startNode} onValueChange={handleStartNodeChange}>
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={startNode} />
                </SelectTrigger>
                <SelectContent>
                  {state.graph?.nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={traversalType === "dfs" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTraversalTypeChange("dfs")}
              >
                DFS
              </Button>
              <Button
                variant={traversalType === "bfs" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTraversalTypeChange("bfs")}
              >
                BFS
              </Button>
            </div>
          </div>
        </div>

        {/* Graph visualization */}
        <div className="relative w-full h-[400px] border rounded-lg bg-background/50">
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10 bg-background/80 p-1 rounded-md">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const zoomElement = document.getElementById("graph-zoom");
                if (zoomElement) {
                  zoomElement.style.transform = `scale(${Math.max(
                    0.6,
                    parseFloat(
                      zoomElement.style.transform
                        .replace("scale(", "")
                        .replace(")", "")
                    ) - 0.05
                  )})`;
                }
              }}
              className="h-7 w-7"
              title="Zoom out"
            >
              <span className="text-xs">-</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const zoomElement = document.getElementById("graph-zoom");
                if (zoomElement) {
                  zoomElement.style.transform = `scale(${Math.min(
                    2,
                    parseFloat(
                      zoomElement.style.transform
                        .replace("scale(", "")
                        .replace(")", "")
                    ) + 0.05
                  )})`;
                }
              }}
              className="h-7 w-7"
              title="Zoom in"
            >
              <span className="text-xs">+</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const zoomElement = document.getElementById("graph-zoom");
                if (zoomElement) {
                  zoomElement.style.transform = "scale(1)";
                }
              }}
              className="h-7 w-7"
              title="Reset zoom"
            >
              <span className="text-xs">↺</span>
            </Button>
          </div>

          <ScrollArea className="h-full w-full">
            <div className="h-full min-w-[800px]">
              <div
                id="graph-zoom"
                className="h-full w-full flex items-center justify-center"
                style={{
                  transform: "scale(1)",
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                  overflow: "visible",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="-200 -200 400 400"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ overflow: "visible" }}
                >
                  {state.graph && (
                    <g>
                      {/* Edges */}
                      {state.graph.edges.map((edge, index) => {
                        const source = state.graph!.nodes.find(
                          (n) => n.id === edge.source
                        )!;
                        const target = state.graph!.nodes.find(
                          (n) => n.id === edge.target
                        )!;

                        return (
                          <motion.line
                            key={`edge-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              stroke: edge.highlighted
                                ? "#6366f1"
                                : edge.visited
                                ? "#a5b4fc"
                                : "#64748b",
                            }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            strokeWidth={edge.highlighted ? 3 : 2}
                          />
                        );
                      })}

                      {/* Nodes */}
                      {state.graph.nodes.map((node) => (
                        <g key={`node-${node.id}`}>
                          <motion.circle
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              fill: node.highlighted
                                ? "#6366f1"
                                : node.visited
                                ? "#a5b4fc"
                                : "#f8fafc",
                              stroke: node.highlighted ? "#4f46e5" : "#64748b",
                            }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            cx={node.x}
                            cy={node.y}
                            r={25}
                            strokeWidth={2}
                          />

                          <motion.text
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={14}
                            fontWeight="bold"
                            fill={node.highlighted ? "white" : "currentColor"}
                          >
                            {node.id}
                          </motion.text>
                        </g>
                      ))}
                    </g>
                  )}
                </svg>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={stepBackward}
              disabled={state.currentStep <= 0}
              title="Reculer d'une étape"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              title={state.isPlaying ? "Pause" : "Lecture"}
            >
              {state.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={stepForward}
              disabled={state.currentStep >= state.nodeSteps.length - 1}
              title="Avancer d'une étape"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skipToEnd}
              disabled={state.currentStep >= state.nodeSteps.length - 1}
              title="Aller à la fin"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={resetTraversal}
              title="Réinitialiser le parcours"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Vitesse:</span>
            <Slider
              value={[state.speed]}
              min={0.5}
              max={3}
              step={0.5}
              onValueChange={handleSpeedChange}
              className="w-32"
              title="Ajuster la vitesse d'animation"
            />

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHint(!showHint)}
                aria-label="Afficher/masquer les explications"
                title="Afficher/masquer les explications"
              >
                <Lightbulb
                  className={`h-4 w-4 ${showHint ? "text-yellow-500" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Current step explanation */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 rounded-lg bg-muted/50 border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium">Explication</h4>
            </div>

            {state.currentStep >= 0 &&
            state.currentStep < state.nodeSteps.length ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {getStepExplanation(
                    traversalType,
                    state.currentStep,
                    state.nodeSteps.length,
                    state.nodeSteps[state.currentStep]
                  )}
                </p>

                {traversalType === "dfs" && (
                  <p className="text-xs text-muted-foreground">
                    Le parcours en profondeur (DFS) explore un chemin aussi loin
                    que possible avant de revenir en arrière (backtracking). Il
                    utilise une pile (implicite via la récursion) pour garder
                    trace des nœuds à visiter.
                  </p>
                )}

                {traversalType === "bfs" && (
                  <p className="text-xs text-muted-foreground">
                    Le parcours en largeur (BFS) explore tous les voisins
                    d&apos;un nœud avant de passer aux nœuds du niveau suivant.
                    Il utilise une file d&apos;attente et est idéal pour trouver
                    le chemin le plus court dans un graphe non pondéré.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cliquez sur Play pour démarrer la visualisation du parcours{" "}
                {traversalType === "dfs"
                  ? "en profondeur (DFS)"
                  : "en largeur (BFS)"}{" "}
                à partir du nœud {startNode}.
              </p>
            )}

            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Progression: {state.currentStep + 1}/{state.nodeSteps.length}
              </Badge>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
