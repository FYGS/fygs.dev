"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "../visualization-container";
import { HeapCanvas } from "./heap-canvas";
import { heapify } from "./heap-operations";
import { getHeapStats } from "./heap-stats";
import { generateExtractMaxSteps } from "./extract-steps";
import { generateHeapifySteps } from "./heapify-steps";
import { generateInsertSteps } from "./insert-steps";
import { OperationPanel } from "./operation-panel";
import type { HeapNode, HeapStep, HeapType, OperationType } from "./types";

export function HeapVisualization() {
  // État pour le tas
  const [heap, setHeap] = useState<HeapNode[]>([]);
  const [heapType, setHeapType] = useState<HeapType>("max");

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<HeapStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [value, setValue] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("insert");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser le tas avec quelques valeurs
  const initializeHeap = useCallback(() => {
    // Créer un tas avec quelques valeurs
    const values = [45, 30, 60, 10, 25, 50, 70];
    const newHeap: HeapNode[] = values.map((value) => ({
      id: `node-${value}-${Date.now()}`,
      value,
    }));

    // Heapify pour s'assurer que c'est un tas valide
    const heapifiedHeap = heapify(newHeap, heapType);

    setHeap(heapifiedHeap);

    // Réinitialiser les étapes
    const initialStep: HeapStep = {
      heap: [...heapifiedHeap],
      activeIndices: [],
      swappedIndices: null,
      message: `Tas ${heapType === "max" ? "maximum" : "minimum"} initialisé`,
      operation: "heapify",
      heapType,
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [heapType]);

  // Initialiser le tas au chargement du composant et lorsque le type de tas change
  useEffect(() => {
    initializeHeap();
  }, [initializeHeap]);

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
    heap: [],
    activeIndices: [],
    swappedIndices: null,
    message: "",
    operation: "insert" as OperationType,
    heapType,
    operationCount: 0,
  };

  // Fonction pour exécuter l'opération sélectionnée
  const executeOperation = useCallback(() => {
    let newSteps: HeapStep[] = [];

    switch (operation) {
      case "insert":
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          newSteps = generateInsertSteps(heap, numValue, heapType);
        }
        break;
      case "extractMax":
        newSteps = generateExtractMaxSteps(heap, heapType);
        break;
      case "heapify":
        newSteps = generateHeapifySteps(heap, heapType);
        break;
      case "clear":
        initializeHeap();
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour le tas si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setHeap(lastStep.heap);
      }
    }
  }, [operation, value, heap, heapType, initializeHeap]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <OperationPanel
          heapType={heapType}
          onHeapTypeChange={setHeapType}
          operation={operation}
          onOperationChange={setOperation}
          value={value}
          onValueChange={setValue}
          onExecute={executeOperation}
          onReset={initializeHeap}
        />

        {/* Visualisation */}
        <VisualizationContainer
          title={`Visualisation de ${
            heapType === "max" ? "Tas Maximum" : "Tas Minimum"
          }`}
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
          stats={getHeapStats(currentStep)}
        >
          <HeapCanvas currentStep={currentStep} />
        </VisualizationContainer>
      </div>
    </div>
  );
}
