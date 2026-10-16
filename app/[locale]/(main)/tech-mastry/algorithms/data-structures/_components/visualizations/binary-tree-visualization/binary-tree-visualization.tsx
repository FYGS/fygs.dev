"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "../visualization-container";
import { OperationPanel } from "./operation-panel";
import { generateInsertSteps } from "./insert-steps";
import { generateSearchSteps } from "./search-steps";
import { generateTraverseSteps } from "./traverse-steps";
import { TreeCanvas } from "./tree-canvas";
import { getTreeStats } from "./tree-stats";
import type {
  BinaryTreeStep,
  OperationType,
  TraversalType,
  TreeNode,
} from "./types";

export function BinaryTreeVisualization() {
  // État pour l'arbre binaire
  const [root, setRoot] = useState<TreeNode | null>(null);

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<BinaryTreeStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [value, setValue] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("insert");
  const [traversalType, setTraversalType] = useState<TraversalType>("inorder");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser l'arbre binaire avec quelques valeurs
  const initializeTree = useCallback(() => {
    // Créer un arbre binaire de recherche équilibré avec quelques valeurs
    const values = [50, 30, 70, 20, 40, 60, 80];
    let newRoot: TreeNode | null = null;

    // Fonction pour insérer une valeur dans l'arbre
    const insertNode = (root: TreeNode | null, value: number): TreeNode => {
      if (root === null) {
        return {
          id: `node-${value}-${Date.now()}`,
          value,
          left: null,
          right: null,
        };
      }

      if (value < root.value) {
        root.left = insertNode(root.left, value);
      } else if (value > root.value) {
        root.right = insertNode(root.right, value);
      }

      return root;
    };

    // Insérer chaque valeur dans l'arbre
    values.forEach((value) => {
      newRoot = insertNode(newRoot, value);
    });

    setRoot(newRoot);

    // Réinitialiser les étapes
    const initialStep: BinaryTreeStep = {
      root: newRoot,
      activeNodes: [],
      highlightedEdges: [],
      message: "Arbre binaire de recherche initialisé",
      operation: "clear",
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Initialiser l'arbre au chargement du composant
  useEffect(() => {
    initializeTree();
  }, [initializeTree]);

  // Contrôles de la visualisation
  const handlePlay = () => {
    setIsPlaying(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < steps.length - 1) {
          return prevIndex + 1;
        } else {
          setIsPlaying(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prevIndex;
        }
      });
    }, 1000 / speed);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSpeedChange = (values: number[]) => {
    setSpeed(values[0]);
  };

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Obtenir l'étape actuelle
  const currentStep = steps[currentStepIndex] || {
    root: null,
    activeNodes: [],
    highlightedEdges: [],
    message: "",
    operation: "insert" as OperationType,
    operationCount: 0,
  };

  // Fonction pour exécuter l'opération sélectionnée
  const executeOperation = useCallback(() => {
    let newSteps: BinaryTreeStep[] = [];

    switch (operation) {
      case "insert":
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          newSteps = generateInsertSteps(root, numValue);
        }
        break;
      case "search":
        const searchValue = parseInt(value);
        if (!isNaN(searchValue)) {
          newSteps = generateSearchSteps(root, searchValue);
        }
        break;
      case "traverse":
        newSteps = generateTraverseSteps(root, traversalType);
        break;
      case "clear":
        initializeTree();
        break;
      // L'opération de suppression sera implémentée dans la prochaine étape
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour l'arbre si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setRoot(lastStep.root);
      }
    }
  }, [operation, value, root, traversalType, initializeTree]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <OperationPanel
          operation={operation}
          onOperationChange={setOperation}
          traversalType={traversalType}
          onTraversalTypeChange={setTraversalType}
          value={value}
          onValueChange={setValue}
          onExecute={executeOperation}
          onReset={initializeTree}
        />

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation d'Arbre Binaire"
          currentStep={currentStepIndex}
          totalSteps={steps.length - 1}
          isPlaying={isPlaying}
          speed={speed}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onSpeedChange={handleSpeedChange}
          message={currentStep.message}
          stats={getTreeStats(currentStep)}
        >
          <TreeCanvas currentStep={currentStep} />
        </VisualizationContainer>
      </div>
    </div>
  );
}
