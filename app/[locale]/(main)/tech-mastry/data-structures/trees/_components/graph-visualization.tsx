"use client";

import { Card, CardContent } from "@/components/ui/custom-card";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
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
import type {
  Graph,
  TraversalType,
  VisualizationState,
} from "./graph-visualization/types";

export function GraphVisualization() {
  // State for traversal type and start node
  const [traversalType, setTraversalType] = useState<TraversalType>("dfs");
  const [startNode, setStartNode] = useState<string>("A");

  // The positioned graph never changes: highlights are derived from the step
  const [baseGraph] = useState<Graph>(() => calculatePositions(createSampleGraph()));

  // Use reducer for main state management
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    (): VisualizationState => {
      // Calculate initial traversal steps
      const { nodes, edges } = getTraversalSteps(baseGraph, "A", "dfs");
      return {
        graph: baseGraph,
        nodeSteps: nodes,
        edgeSteps: edges,
        currentStep: -1,
        isPlaying: false,
        speed: 1,
        initialized: true,
      };
    }
  );

  // UI state
  const [showHint, setShowHint] = useState<boolean>(false);

  // Highlights follow the current step
  const graph = useMemo(() => {
    if (state.currentStep < 0) return resetGraphHighlights(baseGraph);

    try {
      return updateGraphHighlights(
        baseGraph,
        state.currentStep,
        state.nodeSteps,
        state.edgeSteps
      );
    } catch (error) {
      console.error("Error updating graph highlights:", error);
      // Fallback to reset if there's an error
      return resetGraphHighlights(baseGraph);
    }
  }, [baseGraph, state.currentStep, state.nodeSteps, state.edgeSteps]);
  const view = useMemo(() => ({ ...state, graph }), [state, graph]);

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

  // Changing the traversal type or the start node restarts the traversal
  const restartTraversal = useCallback(
    (nextStartNode: string, nextTraversalType: TraversalType) => {
      const { nodes, edges } = getTraversalSteps(
        baseGraph,
        nextStartNode,
        nextTraversalType
      );
      dispatch({
        type: "SET_TRAVERSAL",
        payload: { nodeSteps: nodes, edgeSteps: edges },
      });
    },
    [baseGraph]
  );

  // Change traversal type
  const handleTraversalTypeChange = useCallback(
    (type: TraversalType) => {
      setTraversalType(type);
      restartTraversal(startNode, type);
    },
    [restartTraversal, startNode]
  );

  // Change start node
  const handleStartNodeChange = useCallback(
    (nodeId: string) => {
      setStartNode(nodeId);
      restartTraversal(nodeId, traversalType);
    },
    [restartTraversal, traversalType]
  );

  return (
    <Card className="w-full overflow-hidden border border-border/50 shadow-md">
      <CardContent className="p-6 space-y-6">
        <GraphHeader
          graph={graph}
          startNode={startNode}
          traversalType={traversalType}
          handleStartNodeChange={handleStartNodeChange}
          handleTraversalTypeChange={handleTraversalTypeChange}
        />

        {/* Graph visualization */}
        <GraphCanvas graph={graph} />

        {/* Controls */}
        <PlaybackControls
          state={view}
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
            state={view}
            traversalType={traversalType}
            startNode={startNode}
          />
        )}
      </CardContent>
    </Card>
  );
}
