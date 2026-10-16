"use client";

import { Card, CardContent } from "@/components/ui/custom-card";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { createSampleGraph } from "./graph-visualization/data";
import { ExplanationPanel } from "./graph-visualization/explanation-panel";
import { GraphCanvas } from "./graph-visualization/graph-canvas";
import { GraphHeader } from "./graph-visualization/graph-header";
import { calculatePositions } from "./graph-visualization/layout";
import { PlaybackControls } from "./graph-visualization/playback-controls";
import { reducer } from "./graph-visualization/reducer";
import {
  getTraversalSteps,
  resetGraphHighlights,
  updateGraphHighlights,
} from "./graph-visualization/traversal";
import type { Graph, TraversalType } from "./graph-visualization/types";

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
        <GraphHeader
          graph={state.graph}
          startNode={startNode}
          traversalType={traversalType}
          handleStartNodeChange={handleStartNodeChange}
          handleTraversalTypeChange={handleTraversalTypeChange}
        />

        {/* Graph visualization */}
        <GraphCanvas graph={state.graph} />

        {/* Controls */}
        <PlaybackControls
          state={state}
          showHint={showHint}
          setShowHint={setShowHint}
          stepBackward={stepBackward}
          togglePlay={togglePlay}
          stepForward={stepForward}
          skipToEnd={skipToEnd}
          resetTraversal={resetTraversal}
          handleSpeedChange={handleSpeedChange}
        />

        {/* Current step explanation */}
        {showHint && (
          <ExplanationPanel
            state={state}
            traversalType={traversalType}
            startNode={startNode}
          />
        )}
      </CardContent>
    </Card>
  );
}
