"use client";

import { useState, useEffect, useMemo } from "react";
import { useClientValue } from "../../../_hooks/use-client-value";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AlgorithmType = "bubble" | "selection" | "insertion" | "merge" | "quick";

// Libellés affichés (interface en français)
const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  bubble: "Tri à bulles",
  selection: "Tri par sélection",
  insertion: "Tri par insertion",
  merge: "Tri fusion",
  quick: "Tri rapide",
};

interface SortingStep {
  array: number[];
  highlighted: number[];
  comparing: number[];
  sorted: number[];
}

const NO_ITEMS: number[] = [];

// Initialize array with random values
function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
}

// Generate steps based on selected algorithm
function generateSteps(algorithm: AlgorithmType, array: number[]): SortingStep[] {
  if (array.length === 0) return [];

  switch (algorithm) {
    case "bubble":
      return generateBubbleSortSteps(array);
    case "selection":
      return generateSelectionSortSteps(array);
    case "insertion":
      return generateInsertionSortSteps(array);
    default:
      return generateBubbleSortSteps(array);
  }
}

// Generate steps for bubble sort
function generateBubbleSortSteps(arr: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Add step before comparison
      steps.push({
        array: [...array],
        highlighted: [],
        comparing: [j, j + 1],
        sorted: Array.from({ length: n }, (_, idx) => idx >= n - i)
          .map((v, i) => (v ? i : -1))
          .filter(v => v !== -1)
      });

      if (array[j] > array[j + 1]) {
        // Swap elements
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        
        // Add step after swap
        steps.push({
          array: [...array],
          highlighted: [j, j + 1],
          comparing: [],
          sorted: Array.from({ length: n }, (_, idx) => idx >= n - i)
            .map((v, i) => (v ? i : -1))
            .filter(v => v !== -1)
        });
      }
    }
  }

  // Add final sorted array
  steps.push({
    array: [...array],
    highlighted: [],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  });

  return steps;
}

// Generate steps for selection sort
function generateSelectionSortSteps(arr: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    // Add step showing initial state
    steps.push({
      array: [...array],
      highlighted: [],
      comparing: [i],
      sorted: Array.from({ length: n }, (_, idx) => idx < i)
        .map((v, i) => (v ? i : -1))
        .filter(v => v !== -1)
    });

    for (let j = i + 1; j < n; j++) {
      // Add step for comparison
      steps.push({
        array: [...array],
        highlighted: [minIdx],
        comparing: [j],
        sorted: Array.from({ length: n }, (_, idx) => idx < i)
          .map((v, i) => (v ? i : -1))
          .filter(v => v !== -1)
      });

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    // Swap if needed
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      
      // Add step after swap
      steps.push({
        array: [...array],
        highlighted: [i, minIdx],
        comparing: [],
        sorted: Array.from({ length: n }, (_, idx) => idx <= i)
          .map((v, i) => (v ? i : -1))
          .filter(v => v !== -1)
      });
    } else {
      // Add step when no swap is needed
      steps.push({
        array: [...array],
        highlighted: [i],
        comparing: [],
        sorted: Array.from({ length: n }, (_, idx) => idx <= i)
          .map((v, i) => (v ? i : -1))
          .filter(v => v !== -1)
      });
    }
  }

  // Add final sorted array
  steps.push({
    array: [...array],
    highlighted: [],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  });

  return steps;
}

// Generate steps for insertion sort
function generateInsertionSortSteps(arr: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    // Add step before inner loop
    steps.push({
      array: [...array],
      highlighted: [i],
      comparing: [j, i],
      sorted: Array.from({ length: n }, (_, idx) => idx < i)
        .map((v, i) => (v ? i : -1))
        .filter(v => v !== -1)
    });

    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      
      // Pendant le décalage, seul le préfixe [0..j-1] est intact et trié :
      // la case j+1 vient d'être écrasée et la clé est en attente d'insertion
      steps.push({
        array: [...array],
        highlighted: [j, j + 1],
        comparing: [j, i],
        sorted: Array.from({ length: n }, (_, idx) => idx < j)
          .map((v, i) => (v ? i : -1))
          .filter(v => v !== -1)
      });
      
      j--;
    }
    
    array[j + 1] = key;
    
    // Add step after insertion
    steps.push({
      array: [...array],
      highlighted: [j + 1],
      comparing: [],
      sorted: Array.from({ length: n }, (_, idx) => idx <= i)
        .map((v, i) => (v ? i : -1))
        .filter(v => v !== -1)
    });
  }

  // Add final sorted array
  steps.push({
    array: [...array],
    highlighted: [],
    comparing: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  });

  return steps;
}

export function SortingAlgorithmsVisualization({
  arraySize,
  speed
}: {
  arraySize: number;
  speed: number;
}) {
  // The random array only exists on the client (no hydration mismatch)
  const initialArray = useClientValue(() => randomArray(arraySize));
  const [generatedArray, setGeneratedArray] = useState<number[] | null>(null);
  const array = generatedArray ?? initialArray ?? NO_ITEMS;
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("bubble");
  const [isCompleted, setIsCompleted] = useState(false);

  // The steps follow from the array and the selected algorithm
  const steps = useMemo(() => generateSteps(algorithm, array), [algorithm, array]);

  // Initialize array with random values
  const initializeArray = (size: number = arraySize) => {
    setGeneratedArray(randomArray(size));
    setIsPlaying(false);
    setCurrentStep(0);
    setIsCompleted(false);
  };

  // A new array size draws a new array (state adjusted during render)
  const [seenArraySize, setSeenArraySize] = useState(arraySize);
  if (seenArraySize !== arraySize) {
    setSeenArraySize(arraySize);
    initializeArray(arraySize);
  }

  // Changing the algorithm restarts from the first step
  const handleAlgorithmChange = (newAlgorithm: AlgorithmType) => {
    setAlgorithm(newAlgorithm);
    setCurrentStep(0);
    setIsCompleted(false);
  };

  // Play the visualization
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep(currentStep + 1);
      // Reaching the last step ends the playback
      if (currentStep + 1 >= steps.length - 1) {
        setIsCompleted(true);
        setIsPlaying(false);
      }
    }, 1000 - (speed * 9.9)); // Speed calculation: ~990ms (speed 1) to 10ms (speed 100) per step

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 >= steps.length - 1) {
        setIsCompleted(true);
        setIsPlaying(false);
      }
    }
 };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getAlgorithmComplexity = () => {
    switch (algorithm) {
      case "bubble":
        return { time: "O(n²)", space: "O(1)" };
      case "selection":
        return { time: "O(n²)", space: "O(1)" };
      case "insertion":
        return { time: "O(n²)", space: "O(1)" };
      case "merge":
        return { time: "O(n log n)", space: "O(n)" };
      case "quick":
        return { time: "O(n log n) en moyenne", space: "O(log n) en moyenne" };
      default:
        return { time: "O(n²)", space: "O(1)" };
    }
  };

  const complexity = getAlgorithmComplexity();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {(["bubble", "selection", "insertion"] as AlgorithmType[]).map((algo) => (
            <Button
              key={algo}
              variant={algorithm === algo ? "default" : "outline"}
              size="sm"
              onClick={() => handleAlgorithmChange(algo)}
            >
              {ALGORITHM_LABELS[algo]}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">Temps : {complexity.time}</Badge>
          <Badge variant="outline">Espace : {complexity.space}</Badge>
        </div>
      </div>

      <Card className="p-4 bg-muted/30">
        <div className="flex items-end justify-center h-64 gap-1 p-4">
          {steps.length > 0 && steps[currentStep] ? (
            steps[currentStep].array.map((value, index) => {
              const isHighlighted = steps[currentStep].highlighted.includes(index);
              const isComparing = steps[currentStep].comparing.includes(index);
              const isSorted = steps[currentStep].sorted.includes(index);
              
              let barColor = "bg-primary/40";
              if (isSorted) barColor = "bg-green-500";
              else if (isHighlighted) barColor = "bg-yellow-500";
              else if (isComparing) barColor = "bg-red-500";
              
              return (
                <div
                  key={index}
                  className={`${barColor} transition-all duration-300 rounded-t-sm min-w-[20px]`}
                  style={{
                    height: `${(value / 100) * 100}%`,
                  }}
                >
                  <div className="text-[8px] text-center text-muted-foreground pt-1">
                    {value}
                  </div>
                </div>
              );
            })
          ) : (
            array.map((value, index) => (
              <div
                key={index}
                className="bg-primary/40 rounded-t-sm min-w-[20px]"
                style={{
                  height: `${(value / 100) * 10}%`,
                }}
              >
                <div className="text-[8px] text-center text-muted-foreground pt-1">
                  {value}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
          Précédent
        </Button>
        {!isPlaying ? (
          <Button onClick={handlePlay} disabled={steps.length === 0}>
            {currentStep === 0 || isCompleted ? "Démarrer" : "Reprendre"}
          </Button>
        ) : (
          <Button onClick={handlePause}>Pause</Button>
        )}
        <Button variant="outline" onClick={handleNext} disabled={currentStep >= (steps.length - 1)}>
          Suivant
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Réinitialiser
        </Button>
        <Button variant="outline" onClick={() => initializeArray()}>
          Mélanger
        </Button>
      </div>

      {steps.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Étape {currentStep + 1} sur {steps.length}
        </div>
      )}
    </div>
  );
}