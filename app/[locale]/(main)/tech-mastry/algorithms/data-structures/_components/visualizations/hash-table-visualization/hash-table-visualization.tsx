"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "../visualization-container";
import { BucketList } from "./bucket-list";
import {
  generateClearSteps,
  generateResizeSteps,
} from "./clear-resize-steps";
import { generateGetSteps, generateRemoveSteps } from "./get-remove-steps";
import { getHashStats } from "./hash-stats";
import { generateInsertSteps } from "./insert-steps";
import { OperationPanel } from "./operation-panel";
import type { HashTableBucket, HashTableStep, OperationType } from "./types";

const DEFAULT_SIZE = 7; // Taille par défaut

// Créer une table de hachage vide
function createBuckets(size: number): HashTableBucket[] {
  return Array.from({ length: size }, (_, index) => ({
    index,
    entries: [],
  }));
}

function initialStepFor(buckets: HashTableBucket[]): HashTableStep {
  return {
    buckets: [...buckets],
    activeIndices: [],
    activeEntries: [],
    message: "Table de hachage initialisée",
    operation: "clear",
    operationCount: 0,
  };
}

export function HashTableVisualization() {
  // État pour la table de hachage
  const [buckets, setBuckets] = useState<HashTableBucket[]>(() => createBuckets(DEFAULT_SIZE));
  const [size, setSize] = useState<number>(DEFAULT_SIZE);

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<HashTableStep[]>(() => [initialStepFor(buckets)]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [key, setKey] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [operation, setOperation] = useState<OperationType>("insert");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser une table de hachage vide
  const initializeHashTable = useCallback((tableSize: number = size) => {
    const newBuckets = createBuckets(tableSize);

    setBuckets(newBuckets);

    // Réinitialiser les étapes
    setSteps([initialStepFor(newBuckets)]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [size]);

  // Changer la taille réinitialise la table
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    initializeHashTable(newSize);
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
    buckets: [],
    activeIndices: [],
    activeEntries: [],
    message: "",
    operation: "insert" as OperationType,
    operationCount: 0,
  };

  // Exécuter l'opération sélectionnée
  const executeOperation = useCallback(() => {
    let newSteps: HashTableStep[] = [];

    switch (operation) {
      case "insert":
        if (key.trim() !== "" && value.trim() !== "") {
          newSteps = generateInsertSteps(buckets, key, value, size);
        }
        break;
      case "get":
        if (key.trim() !== "") {
          newSteps = generateGetSteps(buckets, key, size);
        }
        break;
      case "remove":
        if (key.trim() !== "") {
          newSteps = generateRemoveSteps(buckets, key, size);
        }
        break;
      case "clear":
        newSteps = generateClearSteps(buckets);
        break;
      case "resize":
        if (size > 0) {
          newSteps = generateResizeSteps(buckets, size);
        }
        break;
    }

    if (newSteps.length > 0) {
      setSteps(newSteps);
      setCurrentStepIndex(0);

      // Mettre à jour la table si l'opération est terminée
      const lastStep = newSteps[newSteps.length - 1];
      if (lastStep.completed) {
        setBuckets(lastStep.buckets);
      }
    }
  }, [operation, key, value, size, buckets]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <OperationPanel
          operation={operation}
          onOperationChange={setOperation}
          entryKey={key}
          onKeyChange={setKey}
          value={value}
          onValueChange={setValue}
          size={size}
          onSizeChange={handleSizeChange}
          onExecute={executeOperation}
          onReset={() => initializeHashTable()}
        />

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Table de Hachage"
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
          stats={getHashStats(currentStep)}
        >
          <BucketList currentStep={currentStep} />
        </VisualizationContainer>
      </div>
    </div>
  );
}
