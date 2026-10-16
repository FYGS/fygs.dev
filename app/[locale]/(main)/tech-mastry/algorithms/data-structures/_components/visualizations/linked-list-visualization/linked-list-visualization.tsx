"use client";

import { useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "../visualization-container";
import {
  generateInsertAtSteps,
  generateInsertHeadSteps,
  generateInsertTailSteps,
} from "./insert-steps";
import { ListCanvas } from "./list-canvas";
import { getListStats } from "./list-stats";
import { OperationPanel } from "./operation-panel";
import {
  generateRemoveAtSteps,
  generateRemoveHeadSteps,
  generateRemoveTailSteps,
} from "./remove-steps";
import { generateAccessSteps, generateSearchSteps } from "./traversal-steps";
import type { LinkedListStep, ListNode, OperationType } from "./types";

export function LinkedListVisualization() {
  // État pour la liste chaînée
  const [nodes, setNodes] = useState<ListNode[]>([]);

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<LinkedListStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [value, setValue] = useState<string>("");
  const [index, setIndex] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("access");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser la liste chaînée
  useEffect(() => {
    generateRandomList();
  }, []);

  // Générer une liste chaînée aléatoire
  const generateRandomList = () => {
    const size = 5;
    const newNodes: ListNode[] = Array.from({ length: size }, (_, i) => ({
      value: Math.floor(Math.random() * 100),
      id: `node-${Date.now()}-${i}`,
    }));

    setNodes(newNodes);

    // Réinitialiser les étapes
    const initialStep: LinkedListStep = {
      nodes: [...newNodes],
      activeIndices: [],
      message: "Liste chaînée initiale",
      operation: "access",
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

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
    nodes: [],
    activeIndices: [],
    message: "",
    operation: "access" as OperationType,
    operationCount: 0,
  };

  // Exécuter l'opération sélectionnée
  const executeOperation = () => {
    let newSteps: LinkedListStep[] = [];

    switch (operation) {
      case "access":
        const accessIndex = parseInt(index);
        if (!isNaN(accessIndex)) {
          newSteps = generateAccessSteps(nodes, accessIndex);
        }
        break;
      case "search":
        const searchValue = parseInt(value);
        if (!isNaN(searchValue)) {
          newSteps = generateSearchSteps(nodes, searchValue);
        }
        break;
      case "insertHead":
        const insertHeadValue = parseInt(value);
        if (!isNaN(insertHeadValue)) {
          newSteps = generateInsertHeadSteps(nodes, insertHeadValue);
        }
        break;
      case "insertTail":
        const insertTailValue = parseInt(value);
        if (!isNaN(insertTailValue)) {
          newSteps = generateInsertTailSteps(nodes, insertTailValue);
        }
        break;
      case "insertAt":
        const insertAtValue = parseInt(value);
        const insertAtIndex = parseInt(index);
        if (!isNaN(insertAtValue) && !isNaN(insertAtIndex)) {
          newSteps = generateInsertAtSteps(nodes, insertAtValue, insertAtIndex);
        }
        break;
      case "removeHead":
        newSteps = generateRemoveHeadSteps(nodes);
        break;
      case "removeTail":
        newSteps = generateRemoveTailSteps(nodes);
        break;
      case "removeAt":
        const removeAtIndex = parseInt(index);
        if (!isNaN(removeAtIndex)) {
          newSteps = generateRemoveAtSteps(nodes, removeAtIndex);
        }
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour la liste si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setNodes(lastStep.nodes);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <OperationPanel
          operation={operation}
          onOperationChange={setOperation}
          value={value}
          onValueChange={setValue}
          index={index}
          onIndexChange={setIndex}
          onExecute={executeOperation}
          onGenerateList={generateRandomList}
        />

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Liste Chaînée"
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
          stats={getListStats(currentStep)}
        >
          <ListCanvas currentStep={currentStep} />
        </VisualizationContainer>
      </div>
    </div>
  );
}
