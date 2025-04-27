"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/custom-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

// Node type for binary tree
interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
  highlighted?: boolean;
  visited?: boolean;
}

// Traversal types
type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder";

// State type
interface VisualizationState {
  tree: TreeNode | null;
  traversalSteps: TreeNode[];
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  initialized: boolean;
}

// Action types
type Action =
  | {
      type: "INITIALIZE";
      payload: { tree: TreeNode | null; steps: TreeNode[] };
    }
  | {
      type: "SET_TRAVERSAL";
      payload: { type: TraversalType; steps: TreeNode[] };
    }
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACKWARD" }
  | { type: "SKIP_TO_END" }
  | { type: "SET_SPEED"; payload: number }
  | { type: "UPDATE_TREE"; payload: TreeNode | null };

// Create a sample binary tree
const createSampleTree = (): TreeNode => {
  return {
    value: 50,
    left: {
      value: 30,
      left: {
        value: 20,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      right: {
        value: 40,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
    },
    right: {
      value: 70,
      left: {
        value: 60,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      right: {
        value: 80,
        left: null,
        right: null,
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
    },
    x: 0,
    y: 0,
  };
};

// Calculate positions for tree visualization
const calculatePositions = (
  node: TreeNode | null,
  depth: number = 0,
  position: number = 0,
  horizontalSpacing: number = 100,
  verticalSpacing: number = 85
): TreeNode | null => {
  if (!node) return null;

  // Create a new node to avoid mutating the original
  const newNode = { ...node };

  // Calculate x and y positions
  newNode.x = position * horizontalSpacing;
  newNode.y = depth * verticalSpacing;

  // Calculate positions for children with spacing that scales with depth
  // For deeper levels, we need wider spacing to prevent overlap
  // Using a smaller base (1.6) for more compact horizontal layout
  const spacingFactor = Math.pow(1.6, Math.max(4 - depth, 0));
  const leftSpacing = position - spacingFactor;
  const rightSpacing = position + spacingFactor;

  newNode.left = calculatePositions(
    node.left,
    depth + 1,
    leftSpacing,
    horizontalSpacing,
    verticalSpacing
  );
  newNode.right = calculatePositions(
    node.right,
    depth + 1,
    rightSpacing,
    horizontalSpacing,
    verticalSpacing
  );

  return newNode;
};

// Deep clone a tree to ensure immutability
const cloneTree = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;

  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
};

// Get traversal steps
const getTraversalSteps = (
  root: TreeNode | null,
  type: TraversalType
): TreeNode[] => {
  if (!root) return [];

  const steps: TreeNode[] = [];
  // Clone the root to avoid mutating the original
  const clonedRoot = cloneTree(root);

  const inorder = (node: TreeNode | null) => {
    if (!node) return;
    inorder(node.left);
    steps.push(node);
    inorder(node.right);
  };

  const preorder = (node: TreeNode | null) => {
    if (!node) return;
    steps.push(node);
    preorder(node.left);
    preorder(node.right);
  };

  const postorder = (node: TreeNode | null) => {
    if (!node) return;
    postorder(node.left);
    postorder(node.right);
    steps.push(node);
  };

  const levelorder = (node: TreeNode | null) => {
    if (!node) return;
    const queue: TreeNode[] = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      steps.push(current);

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  };

  switch (type) {
    case "inorder":
      inorder(clonedRoot);
      break;
    case "preorder":
      preorder(clonedRoot);
      break;
    case "postorder":
      postorder(clonedRoot);
      break;
    case "levelorder":
      levelorder(clonedRoot);
      break;
  }

  return steps;
};

// Get explanation for each step
const getStepExplanation = (
  traversalType: TraversalType,
  currentStep: number,
  totalSteps: number,
  currentNode: TreeNode | null
): string => {
  if (!currentNode) return "";

  switch (traversalType) {
    case "inorder":
      return `Parcours inordre (gauche → racine → droite): Visite du nœud ${
        currentNode.value
      } (étape ${currentStep + 1}/${totalSteps})`;
    case "preorder":
      return `Parcours préordre (racine → gauche → droite): Visite du nœud ${
        currentNode.value
      } (étape ${currentStep + 1}/${totalSteps})`;
    case "postorder":
      return `Parcours postordre (gauche → droite → racine): Visite du nœud ${
        currentNode.value
      } (étape ${currentStep + 1}/${totalSteps})`;
    case "levelorder":
      return `Parcours par niveau: Visite du nœud ${currentNode.value} (étape ${
        currentStep + 1
      }/${totalSteps})`;
    default:
      return "";
  }
};

// Reset all highlights in a tree
const resetTreeHighlights = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;

  return {
    ...node,
    highlighted: false,
    visited: false,
    left: resetTreeHighlights(node.left),
    right: resetTreeHighlights(node.right),
  };
};

// Update highlights in a tree based on current step
const updateTreeHighlights = (
  node: TreeNode | null,
  currentStep: number,
  traversalSteps: TreeNode[]
): TreeNode | null => {
  if (!node || currentStep < 0 || currentStep >= traversalSteps.length) {
    return node;
  }

  const nodeToHighlight = traversalSteps[currentStep];

  const highlight = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null;

    const newNode = { ...node };

    if (node.value === nodeToHighlight.value) {
      newNode.highlighted = true;
      newNode.visited = true;
    } else {
      newNode.highlighted = false;
      // Keep visited state for nodes that were previously visited
      newNode.visited =
        currentStep > 0 &&
        traversalSteps
          .slice(0, currentStep)
          .some((step) => step.value === node.value);
    }

    newNode.left = highlight(node.left);
    newNode.right = highlight(node.right);

    return newNode;
  };

  return highlight(cloneTree(node));
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
        tree: action.payload.tree,
        traversalSteps: action.payload.steps,
        currentStep: -1,
        isPlaying: false,
        initialized: true,
      };
    case "SET_TRAVERSAL":
      return {
        ...state,
        traversalSteps: action.payload.steps,
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
      if (state.currentStep < state.traversalSteps.length - 1) {
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
        currentStep: state.traversalSteps.length - 1,
        isPlaying: false,
      };
    case "SET_SPEED":
      return {
        ...state,
        speed: action.payload,
      };
    case "UPDATE_TREE":
      return {
        ...state,
        tree: action.payload,
      };
    default:
      return state;
  }
}

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

  // Render a tree node (memoized)
  const renderNode = useCallback(
    (node: TreeNode | null, centerX: number = 0, centerY: number = 0) => {
      if (!node) return null;

      const nodeSize = 40;
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;

      return (
        <g key={`node-${node.value}`}>
          {/* Edges to children */}
          {node.left && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              x1={nodeX}
              y1={nodeY}
              x2={centerX + node.left.x}
              y2={centerY + node.left.y}
              stroke={node.left.visited ? "#6366f1" : "#64748b"}
              strokeWidth={2.5}
              strokeOpacity={0.8}
            />
          )}
          {node.right && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              x1={nodeX}
              y1={nodeY}
              x2={centerX + node.right.x}
              y2={centerY + node.right.y}
              stroke={node.right.visited ? "#6366f1" : "#64748b"}
              strokeWidth={2.5}
              strokeOpacity={0.8}
            />
          )}

          {/* Node circle */}
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
            transition={{ duration: 0.5, delay: 0.3 + node.y * 0.05 }}
            cx={nodeX}
            cy={nodeY}
            r={nodeSize / 2}
            strokeWidth={2.5}
          />

          {/* Node value */}
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + node.y * 0.05 }}
            x={nodeX}
            y={nodeY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fontWeight="bold"
            fill={node.highlighted ? "white" : "currentColor"}
          >
            {node.value}
          </motion.text>

          {/* Render children */}
          {renderNode(node.left, centerX, centerY)}
          {renderNode(node.right, centerX, centerY)}
        </g>
      );
    },
    []
  );

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
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Visualisation d&apos;un Arbre Binaire
            </h3>
            <p className="text-sm text-muted-foreground">
              Explorez les différents types de parcours d&apos;un arbre binaire
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={traversalType === "inorder" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTraversalTypeChange("inorder")}
            >
              Inordre
            </Button>
            <Button
              variant={traversalType === "preorder" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTraversalTypeChange("preorder")}
            >
              Préordre
            </Button>
            <Button
              variant={traversalType === "postorder" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTraversalTypeChange("postorder")}
            >
              Postordre
            </Button>
            <Button
              variant={traversalType === "levelorder" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTraversalTypeChange("levelorder")}
            >
              Par niveau
            </Button>
          </div>
        </div>

        {/* Tree visualization */}
        <div className="relative w-full h-[500px] border rounded-lg bg-background/50">
          {/* Zoom controls */}
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10 bg-background/80 p-1 rounded-md">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom((prev) => Math.max(0.3, prev - 0.05))}
              className="h-7 w-7"
              title="Zoom out"
            >
              <span className="text-xs">-</span>
            </Button>
            <span className="text-xs">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom((prev) => Math.min(2, prev + 0.05))}
              className="h-7 w-7"
              title="Zoom in"
            >
              <span className="text-xs">+</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(0.6)}
              className="h-7 w-7"
              title="Fit to view"
            >
              <span className="text-xs">↺</span>
            </Button>
          </div>

          <ScrollArea className="h-full w-full">
            <div className="h-full min-w-[1000px]">
              <div
                className="h-full w-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                  overflow: "visible",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="-450 -100 900 550"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ overflow: "visible" }}
                >
                  {state.tree && renderNode(state.tree, 0, 30)}
                </svg>
              </div>
            </div>
            <ScrollBar orientation="horizontal" className="h-3" />
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
              disabled={state.currentStep >= state.traversalSteps.length - 1}
              title="Avancer d'une étape"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skipToEnd}
              disabled={state.currentStep >= state.traversalSteps.length - 1}
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
            <span
              className="text-sm text-muted-foreground"
              title="Ajuster la vitesse d'animation"
            >
              Vitesse:
            </span>
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
            state.currentStep < state.traversalSteps.length ? (
              <p className="text-sm text-muted-foreground">
                {getStepExplanation(
                  traversalType,
                  state.currentStep,
                  state.traversalSteps.length,
                  state.traversalSteps[state.currentStep]
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cliquez sur Play pour démarrer la visualisation du parcours{" "}
                {traversalType === "inorder" &&
                  "inordre (gauche → racine → droite)"}
                {traversalType === "preorder" &&
                  "préordre (racine → gauche → droite)"}
                {traversalType === "postorder" &&
                  "postordre (gauche → droite → racine)"}
                {traversalType === "levelorder" && "par niveau"}
              </p>
            )}

            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Progression: {state.currentStep + 1}/
                {state.traversalSteps.length}
              </Badge>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
