"use client";

import { Card, CardContent } from "@/components/ui/custom-card";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createSampleTree } from "./binary-tree/data";
import { ExplanationPanel } from "./binary-tree/explanation-panel";
import { calculatePositions } from "./binary-tree/layout";
import { PlaybackControls } from "./binary-tree/playback-controls";
import { reducer } from "./binary-tree/reducer";
import { TreeCanvas } from "./binary-tree/tree-canvas";
import { TreeHeader } from "./binary-tree/tree-header";
import {
  getTraversalSteps,
  resetTreeHighlights,
  updateTreeHighlights,
} from "./binary-tree/traversal";
import type { TraversalType, TreeNode } from "./binary-tree/types";

export function BinaryTreeVisualization() {
  // State for traversal type
  const [traversalType, setTraversalType] = useState<TraversalType>("inorder");

  // Refs to prevent infinite loops
  const treeRef = useRef<TreeNode | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Use reducer for main state management
  const [state, dispatch] = useReducer(reducer, {
    tree: null,
    traversalSteps: [],
    currentStep: -1,
    isPlaying: false,
    speed: 1,
    initialized: false,
  });

  // UI state
  const [showHint, setShowHint] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0.6); // Start with a zoomed out view to show the entire tree

  // Initialize tree only once
  useEffect(() => {
    if (initializedRef.current) return;

    try {
      // Create and position the tree
      const sampleTree = createSampleTree();
      const positionedTree = calculatePositions(sampleTree);

      // Store in ref for stability
      treeRef.current = positionedTree;

      // Calculate initial traversal steps
      const steps = getTraversalSteps(positionedTree, traversalType);

      // Initialize state
      dispatch({
        type: "INITIALIZE",
        payload: {
          tree: positionedTree,
          steps,
        },
      });

      initializedRef.current = true;
    } catch (error) {
      console.error("Error initializing tree:", error);
      // Create a fallback simple tree if there's an error
      const fallbackTree = { value: 1, left: null, right: null, x: 0, y: 0 };
      treeRef.current = fallbackTree;
      dispatch({
        type: "INITIALIZE",
        payload: {
          tree: fallbackTree,
          steps: [fallbackTree],
        },
      });
      initializedRef.current = true;
    }
  }, [traversalType, dispatch]); // Include traversalType and dispatch as dependencies

  // Handle traversal type changes
  useEffect(() => {
    if (!initializedRef.current || !treeRef.current) return;

    try {
      // Reset the tree highlights
      const resetTree = resetTreeHighlights(treeRef.current);

      // Update the tree ref
      treeRef.current = resetTree;

      // Calculate new traversal steps
      const steps = getTraversalSteps(resetTree, traversalType);

      // Update state
      dispatch({
        type: "UPDATE_TREE",
        payload: resetTree,
      });

      dispatch({
        type: "SET_TRAVERSAL",
        payload: {
          type: traversalType,
          steps,
        },
      });
    } catch (error) {
      console.error("Error changing traversal type:", error);
      // Fallback to a simple reset if there's an error
      if (treeRef.current) {
        const resetTree = resetTreeHighlights(treeRef.current);
        treeRef.current = resetTree;
        dispatch({ type: "UPDATE_TREE", payload: resetTree });
        dispatch({ type: "RESET" });
      }
    }
  }, [traversalType, dispatch]);

  // Update highlights when current step changes
  useEffect(() => {
    if (!initializedRef.current || !treeRef.current || state.currentStep < 0)
      return;

    try {
      // Update tree highlights
      const updatedTree = updateTreeHighlights(
        treeRef.current,
        state.currentStep,
        state.traversalSteps
      );

      // Update the tree ref and state
      treeRef.current = updatedTree;

      dispatch({
        type: "UPDATE_TREE",
        payload: updatedTree,
      });
    } catch (error) {
      console.error("Error updating tree highlights:", error);
      // Fallback to reset if there's an error
      if (treeRef.current) {
        const resetTree = resetTreeHighlights(treeRef.current);
        treeRef.current = resetTree;
        dispatch({ type: "UPDATE_TREE", payload: resetTree });
      }
    }
  }, [state.currentStep, state.traversalSteps, dispatch]); // Include dispatch as dependency

  // Animation loop with error handling
  useEffect(() => {
    if (
      !state.isPlaying ||
      state.currentStep >= state.traversalSteps.length - 1
    ) {
      if (state.isPlaying) {
        dispatch({ type: "PAUSE" });
      }
      return;
    }

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
  }, [
    state.isPlaying,
    state.currentStep,
    state.traversalSteps.length,
    state.speed,
    dispatch,
  ]);

  // Set speed
  const handleSpeedChange = useCallback((value: number[]) => {
    dispatch({ type: "SET_SPEED", payload: value[0] });
  }, []);

  // Play/pause traversal
  const togglePlay = useCallback(() => {
    if (state.currentStep >= state.traversalSteps.length - 1) {
      // If at the end, restart
      dispatch({ type: "RESET" });
      dispatch({ type: "PLAY" });
    } else {
      dispatch({
        type: state.isPlaying ? "PAUSE" : "PLAY",
      });
    }
  }, [state.currentStep, state.traversalSteps.length, state.isPlaying]);

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

  // Change traversal type
  const handleTraversalTypeChange = useCallback((type: TraversalType) => {
    setTraversalType(type);
  }, []);

  // If not initialized yet, show loading state
  if (!state.initialized) {
    return (
      <Card className="w-full overflow-hidden border border-border/50 shadow-md">
        <CardContent className="p-6 flex justify-center items-center h-[500px]">
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
        <TreeHeader
          traversalType={traversalType}
          handleTraversalTypeChange={handleTraversalTypeChange}
        />

        {/* Tree visualization */}
        <TreeCanvas tree={state.tree} zoom={zoom} setZoom={setZoom} />

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
          <ExplanationPanel state={state} traversalType={traversalType} />
        )}
      </CardContent>
    </Card>
  );
}
