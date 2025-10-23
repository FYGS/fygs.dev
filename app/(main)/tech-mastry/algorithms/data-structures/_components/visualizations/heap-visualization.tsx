"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "./visualization-container";

// Types d'opérations
type OperationType = "insert" | "extractMax" | "heapify" | "clear";
type HeapType = "max" | "min";

// Interface pour un nœud de tas
interface HeapNode {
  id: string;
  value: number;
}

// Interface pour une étape de visualisation
interface HeapStep {
  heap: HeapNode[];
  activeIndices: number[];
  swappedIndices: [number, number] | null;
  message: string;
  operation: OperationType;
  heapType: HeapType;
  operationCount: number;
  targetValue?: number;
  completed?: boolean;
}

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

  // Fonction pour faire descendre un nœud dans le tas
  const siftDown = useCallback(
    (nodes: HeapNode[], start: number, end: number, type: HeapType): void => {
      let root = start;

      while (2 * root + 1 < end) {
        const child = 2 * root + 1;
        let swap = root;

        // Comparer avec le fils gauche
        if (
          type === "max"
            ? nodes[swap].value < nodes[child].value
            : nodes[swap].value > nodes[child].value
        ) {
          swap = child;
        }

        // Comparer avec le fils droit si existe
        if (
          child + 1 < end &&
          (type === "max"
            ? nodes[swap].value < nodes[child + 1].value
            : nodes[swap].value > nodes[child + 1].value)
        ) {
          swap = child + 1;
        }

        // Si pas besoin d'échanger, on a terminé
        if (swap === root) {
          break;
        }

        // Échanger les nœuds
        [nodes[root], nodes[swap]] = [nodes[swap], nodes[root]];
        root = swap;
      }
    },
    []
  );

  // Fonction pour heapify un tableau
  const heapify = useCallback(
    (nodes: HeapNode[], type: HeapType): HeapNode[] => {
      const result = [...nodes];

      // Heapify de bas en haut
      for (let i = Math.floor(result.length / 2) - 1; i >= 0; i--) {
        siftDown(result, i, result.length, type);
      }

      return result;
    },
    [siftDown]
  );

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
  }, [heapType, heapify]);

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

  // Obtenir les statistiques pour l'étape actuelle
  const getStats = () => {
    const stats: { label: string; value: string | number }[] = [
      { label: "Opérations", value: currentStep.operationCount },
      {
        label: "Type",
        value: currentStep.heapType === "max" ? "Tas maximum" : "Tas minimum",
      },
    ];

    // Ajouter des statistiques spécifiques à l'opération
    switch (currentStep.operation) {
      case "insert":
        stats.push({ label: "Complexité", value: "O(log n)" });
        break;
      case "extractMax":
        stats.push({ label: "Complexité", value: "O(log n)" });
        break;
      case "heapify":
        stats.push({ label: "Complexité", value: "O(n)" });
        break;
      case "clear":
        stats.push({ label: "Complexité", value: "O(1)" });
        break;
    }

    return stats;
  };

  // Fonction pour calculer les coordonnées des nœuds dans le tas
  const calculateNodePositions = (
    nodes: HeapNode[],
    levelWidth = 80,
    levelHeight = 70
  ): Record<number, { x: number; y: number }> => {
    const positions: Record<number, { x: number; y: number }> = {};

    for (let i = 0; i < nodes.length; i++) {
      // Calculer le niveau du nœud dans l'arbre
      const level = Math.floor(Math.log2(i + 1));

      // Calculer la position horizontale
      const nodesInLevel = Math.pow(2, level);
      const positionInLevel = i - (Math.pow(2, level) - 1);
      const totalWidth = nodesInLevel * levelWidth;
      const startX = -totalWidth / 2 + levelWidth / 2;
      const x = startX + positionInLevel * levelWidth;

      // Calculer la position verticale
      const y = level * levelHeight;

      positions[i] = { x, y };
    }

    return positions;
  };

  // Fonction pour dessiner les arêtes entre les nœuds
  const renderEdges = (
    nodes: HeapNode[],
    positions: Record<number, { x: number; y: number }>,
    swappedIndices: [number, number] | null
  ) => {
    const edges = [];

    for (let i = 1; i < nodes.length; i++) {
      const parentIndex = Math.floor((i - 1) / 2);

      // Déterminer si cette arête est impliquée dans un échange
      const isSwapped =
        swappedIndices &&
        ((i === swappedIndices[0] && parentIndex === swappedIndices[1]) ||
          (i === swappedIndices[1] && parentIndex === swappedIndices[0]));

      edges.push(
        <line
          key={`edge-${parentIndex}-${i}`}
          x1={positions[parentIndex].x}
          y1={positions[parentIndex].y}
          x2={positions[i].x}
          y2={positions[i].y}
          stroke={isSwapped ? "#4f46e5" : "#a5b4fc"}
          strokeWidth={isSwapped ? 3 : 1.5}
          strokeLinecap="round"
          strokeDasharray={isSwapped ? "" : ""}
        />
      );
    }

    return edges;
  };

  // Fonction pour dessiner les nœuds du tas
  const renderNodes = (
    nodes: HeapNode[],
    positions: Record<number, { x: number; y: number }>,
    activeIndices: number[],
    swappedIndices: [number, number] | null
  ) => {
    return nodes.map((node, index) => {
      const isActive = activeIndices.includes(index);
      const isSwapped =
        swappedIndices &&
        (index === swappedIndices[0] || index === swappedIndices[1]);

      // Déterminer les couleurs en fonction de l'opération et de l'état
      let borderColor = "border-violet-300";
      let bgColor = "bg-linear-to-br from-violet-50 to-white";
      let textColor = "text-violet-700";
      let shadowClass = "shadow-xs";

      if (isActive && isSwapped) {
        // Nœud actif et impliqué dans un échange
        borderColor = "border-indigo-500";
        bgColor = "bg-linear-to-br from-indigo-200 to-indigo-50";
        textColor = "text-indigo-800";
        shadowClass = "shadow-md";
      } else if (isActive) {
        // Nœud actif
        switch (currentStep.operation) {
          case "insert":
            borderColor = "border-emerald-500";
            bgColor = "bg-linear-to-br from-emerald-200 to-emerald-50";
            textColor = "text-emerald-800";
            shadowClass = "shadow-md";
            break;
          case "extractMax":
            borderColor = "border-rose-500";
            bgColor = "bg-linear-to-br from-rose-200 to-rose-50";
            textColor = "text-rose-800";
            shadowClass = "shadow-md";
            break;
          case "heapify":
            borderColor = "border-amber-500";
            bgColor = "bg-linear-to-br from-amber-200 to-amber-50";
            textColor = "text-amber-800";
            shadowClass = "shadow-md";
            break;
          default:
            borderColor = "border-primary";
            bgColor = "bg-linear-to-br from-primary/30 to-primary/10";
            textColor = "text-primary-foreground";
            shadowClass = "shadow-md";
        }
      } else if (isSwapped) {
        // Nœud impliqué dans un échange mais pas actif
        borderColor = "border-purple-500";
        bgColor = "bg-linear-to-br from-purple-200 to-purple-50";
        textColor = "text-purple-800";
        shadowClass = "shadow-md";
      }

      return (
        <motion.g
          key={`node-${index}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: isActive || isSwapped ? 1.1 : 1,
            transition: { duration: 0.3 },
          }}
        >
          <circle
            cx={positions[index].x}
            cy={positions[index].y}
            r={20}
            fill="white"
            className={`${bgColor} ${borderColor} border-2 ${shadowClass}`}
          />
          <text
            x={positions[index].x}
            y={positions[index].y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-base font-bold ${textColor}`}
            stroke="white"
            strokeWidth="0.3"
            paintOrder="stroke"
          >
            {node.value}
          </text>
        </motion.g>
      );
    });
  };

  // Générer les étapes pour l'insertion d'une valeur
  const generateInsertSteps = useCallback(
    (currentHeap: HeapNode[], valueToInsert: number, type: HeapType) => {
      const steps: HeapStep[] = [];
      const newHeap = [...currentHeap];

      // Étape initiale
      steps.push({
        heap: [...newHeap],
        activeIndices: [],
        swappedIndices: null,
        message: `Insertion de la valeur ${valueToInsert}`,
        operation: "insert",
        heapType: type,
        operationCount: 0,
        targetValue: valueToInsert,
      });

      // Créer un nouveau nœud
      const newNode: HeapNode = {
        id: `node-${valueToInsert}-${Date.now()}`,
        value: valueToInsert,
      };

      // Ajouter le nouveau nœud à la fin du tas
      newHeap.push(newNode);

      steps.push({
        heap: [...newHeap],
        activeIndices: [newHeap.length - 1],
        swappedIndices: null,
        message: `Ajout de la valeur ${valueToInsert} à la fin du tas`,
        operation: "insert",
        heapType: type,
        operationCount: 1,
        targetValue: valueToInsert,
      });

      // Faire remonter le nœud jusqu'à sa position correcte
      let currentIndex = newHeap.length - 1;

      while (currentIndex > 0) {
        const parentIndex = Math.floor((currentIndex - 1) / 2);

        // Vérifier si le nœud doit être échangé avec son parent
        const shouldSwap =
          type === "max"
            ? newHeap[currentIndex].value > newHeap[parentIndex].value
            : newHeap[currentIndex].value < newHeap[parentIndex].value;

        if (!shouldSwap) {
          // Si pas besoin d'échanger, on a terminé
          steps.push({
            heap: [...newHeap],
            activeIndices: [currentIndex, parentIndex],
            swappedIndices: null,
            message: `Comparaison avec le parent (${newHeap[parentIndex].value}): pas besoin d'échanger, l'insertion est terminée`,
            operation: "insert",
            heapType: type,
            operationCount: steps.length + 1,
            targetValue: valueToInsert,
            completed: true,
          });
          break;
        }

        // Étape de comparaison
        steps.push({
          heap: [...newHeap],
          activeIndices: [currentIndex, parentIndex],
          swappedIndices: null,
          message: `Comparaison avec le parent (${
            newHeap[parentIndex].value
          }): ${valueToInsert} ${
            type === "max" ? "> parent" : "< parent"
          }, échange nécessaire`,
          operation: "insert",
          heapType: type,
          operationCount: steps.length + 1,
          targetValue: valueToInsert,
        });

        // Échanger le nœud avec son parent
        [newHeap[currentIndex], newHeap[parentIndex]] = [
          newHeap[parentIndex],
          newHeap[currentIndex],
        ];

        // Étape d'échange
        steps.push({
          heap: [...newHeap],
          activeIndices: [parentIndex],
          swappedIndices: [currentIndex, parentIndex],
          message: `Échange avec le parent: ${valueToInsert} remonte à la position ${parentIndex}`,
          operation: "insert",
          heapType: type,
          operationCount: steps.length + 1,
          targetValue: valueToInsert,
        });

        // Mettre à jour l'index courant
        currentIndex = parentIndex;
      }

      // Si on est sorti de la boucle sans ajouter d'étape complétée
      if (!steps[steps.length - 1].completed) {
        steps.push({
          heap: [...newHeap],
          activeIndices: [currentIndex],
          swappedIndices: null,
          message: `La valeur ${valueToInsert} est maintenant à la racine du tas, l'insertion est terminée`,
          operation: "insert",
          heapType: type,
          operationCount: steps.length + 1,
          targetValue: valueToInsert,
          completed: true,
        });
      }

      return steps;
    },
    []
  );

  // Générer les étapes pour l'extraction du maximum/minimum
  const generateExtractMaxSteps = useCallback(
    (currentHeap: HeapNode[], type: HeapType) => {
      const steps: HeapStep[] = [];

      if (currentHeap.length === 0) {
        steps.push({
          heap: [],
          activeIndices: [],
          swappedIndices: null,
          message: "Le tas est vide, impossible d'extraire un élément",
          operation: "extractMax",
          heapType: type,
          operationCount: 0,
          completed: true,
        });
        return steps;
      }

      const newHeap = [...currentHeap];
      const rootValue = newHeap[0].value;

      // Étape initiale
      steps.push({
        heap: [...newHeap],
        activeIndices: [0],
        swappedIndices: null,
        message: `Extraction de la ${
          type === "max" ? "valeur maximale" : "valeur minimale"
        } (${rootValue})`,
        operation: "extractMax",
        heapType: type,
        operationCount: 0,
      });

      if (newHeap.length === 1) {
        // Cas spécial: un seul élément dans le tas
        steps.push({
          heap: [],
          activeIndices: [],
          swappedIndices: null,
          message: `Suppression de la seule valeur du tas (${rootValue})`,
          operation: "extractMax",
          heapType: type,
          operationCount: 1,
          completed: true,
        });
        return steps;
      }

      // Échanger la racine avec le dernier élément
      const lastNode = newHeap[newHeap.length - 1];

      steps.push({
        heap: [...newHeap],
        activeIndices: [0, newHeap.length - 1],
        swappedIndices: null,
        message: `Échange de la racine (${rootValue}) avec le dernier élément (${lastNode.value})`,
        operation: "extractMax",
        heapType: type,
        operationCount: 1,
      });

      // Échanger la racine avec le dernier élément
      [newHeap[0], newHeap[newHeap.length - 1]] = [
        newHeap[newHeap.length - 1],
        newHeap[0],
      ];

      steps.push({
        heap: [...newHeap],
        activeIndices: [0],
        swappedIndices: [0, newHeap.length - 1],
        message: `Après échange: ${lastNode.value} est maintenant à la racine`,
        operation: "extractMax",
        heapType: type,
        operationCount: 2,
      });

      // Supprimer le dernier élément (qui est maintenant l'ancienne racine)
      newHeap.pop(); // Suppression de l'ancienne racine

      steps.push({
        heap: [...newHeap],
        activeIndices: [],
        swappedIndices: null,
        message: `Suppression de l'ancienne racine (${rootValue})`,
        operation: "extractMax",
        heapType: type,
        operationCount: 3,
      });

      // Faire descendre la nouvelle racine à sa position correcte
      let currentIndex = 0;
      let operationCount = 4;

      while (true) {
        const leftChildIndex = 2 * currentIndex + 1;
        const rightChildIndex = 2 * currentIndex + 2;
        let swapIndex = currentIndex;

        // Vérifier si le fils gauche existe et s'il doit être échangé
        if (leftChildIndex < newHeap.length) {
          const shouldSwapLeft =
            type === "max"
              ? newHeap[leftChildIndex].value > newHeap[swapIndex].value
              : newHeap[leftChildIndex].value < newHeap[swapIndex].value;

          if (shouldSwapLeft) {
            swapIndex = leftChildIndex;
          }

          steps.push({
            heap: [...newHeap],
            activeIndices: [currentIndex, leftChildIndex],
            swappedIndices: null,
            message: `Comparaison avec le fils gauche (${
              newHeap[leftChildIndex].value
            }): ${
              shouldSwapLeft ? "échange nécessaire" : "pas d'échange nécessaire"
            }`,
            operation: "extractMax",
            heapType: type,
            operationCount: operationCount++,
          });
        }

        // Vérifier si le fils droit existe et s'il doit être échangé
        if (rightChildIndex < newHeap.length) {
          const shouldSwapRight =
            type === "max"
              ? newHeap[rightChildIndex].value > newHeap[swapIndex].value
              : newHeap[rightChildIndex].value < newHeap[swapIndex].value;

          if (shouldSwapRight) {
            swapIndex = rightChildIndex;
          }

          steps.push({
            heap: [...newHeap],
            activeIndices: [currentIndex, rightChildIndex],
            swappedIndices: null,
            message: `Comparaison avec le fils droit (${
              newHeap[rightChildIndex].value
            }): ${
              shouldSwapRight
                ? "échange nécessaire"
                : "pas d'échange nécessaire"
            }`,
            operation: "extractMax",
            heapType: type,
            operationCount: operationCount++,
          });
        }

        // Si pas besoin d'échanger, on a terminé
        if (swapIndex === currentIndex) {
          steps.push({
            heap: [...newHeap],
            activeIndices: [currentIndex],
            swappedIndices: null,
            message: `La valeur ${newHeap[currentIndex].value} est à sa position correcte, l'extraction est terminée`,
            operation: "extractMax",
            heapType: type,
            operationCount: operationCount,
            completed: true,
          });
          break;
        }

        // Échanger le nœud avec son fils
        [newHeap[currentIndex], newHeap[swapIndex]] = [
          newHeap[swapIndex],
          newHeap[currentIndex],
        ];

        steps.push({
          heap: [...newHeap],
          activeIndices: [swapIndex],
          swappedIndices: [currentIndex, swapIndex],
          message: `Échange avec le fils: ${newHeap[swapIndex].value} descend à la position ${swapIndex}`,
          operation: "extractMax",
          heapType: type,
          operationCount: operationCount++,
        });

        // Mettre à jour l'index courant
        currentIndex = swapIndex;
      }

      return steps;
    },
    []
  );

  // Générer les étapes pour heapify
  const generateHeapifySteps = useCallback(
    (currentHeap: HeapNode[], type: HeapType) => {
      const steps: HeapStep[] = [];
      const newHeap = [...currentHeap];

      // Étape initiale
      steps.push({
        heap: [...newHeap],
        activeIndices: [],
        swappedIndices: null,
        message: `Début du processus de heapify pour un tas ${
          type === "max" ? "maximum" : "minimum"
        }`,
        operation: "heapify",
        heapType: type,
        operationCount: 0,
      });

      // Heapify de bas en haut
      for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
        steps.push({
          heap: [...newHeap],
          activeIndices: [i],
          swappedIndices: null,
          message: `Heapify à partir du nœud ${newHeap[i].value} (index ${i})`,
          operation: "heapify",
          heapType: type,
          operationCount: steps.length,
        });

        // Sift down à partir de l'index i
        let currentIndex = i;

        while (true) {
          const leftChildIndex = 2 * currentIndex + 1;
          const rightChildIndex = 2 * currentIndex + 2;
          let swapIndex = currentIndex;

          // Vérifier si le fils gauche existe et s'il doit être échangé
          if (leftChildIndex < newHeap.length) {
            const shouldSwapLeft =
              type === "max"
                ? newHeap[leftChildIndex].value > newHeap[swapIndex].value
                : newHeap[leftChildIndex].value < newHeap[swapIndex].value;

            if (shouldSwapLeft) {
              swapIndex = leftChildIndex;
            }

            steps.push({
              heap: [...newHeap],
              activeIndices: [currentIndex, leftChildIndex],
              swappedIndices: null,
              message: `Comparaison avec le fils gauche (${
                newHeap[leftChildIndex].value
              }): ${
                shouldSwapLeft
                  ? "échange nécessaire"
                  : "pas d'échange nécessaire"
              }`,
              operation: "heapify",
              heapType: type,
              operationCount: steps.length,
            });
          }

          // Vérifier si le fils droit existe et s'il doit être échangé
          if (rightChildIndex < newHeap.length) {
            const shouldSwapRight =
              type === "max"
                ? newHeap[rightChildIndex].value > newHeap[swapIndex].value
                : newHeap[rightChildIndex].value < newHeap[swapIndex].value;

            if (shouldSwapRight) {
              swapIndex = rightChildIndex;
            }

            steps.push({
              heap: [...newHeap],
              activeIndices: [currentIndex, rightChildIndex],
              swappedIndices: null,
              message: `Comparaison avec le fils droit (${
                newHeap[rightChildIndex].value
              }): ${
                shouldSwapRight
                  ? "échange nécessaire"
                  : "pas d'échange nécessaire"
              }`,
              operation: "heapify",
              heapType: type,
              operationCount: steps.length,
            });
          }

          // Si pas besoin d'échanger, on passe au nœud suivant
          if (swapIndex === currentIndex) {
            steps.push({
              heap: [...newHeap],
              activeIndices: [currentIndex],
              swappedIndices: null,
              message: `La valeur ${newHeap[currentIndex].value} est à sa position correcte`,
              operation: "heapify",
              heapType: type,
              operationCount: steps.length,
            });
            break;
          }

          // Échanger le nœud avec son fils
          [newHeap[currentIndex], newHeap[swapIndex]] = [
            newHeap[swapIndex],
            newHeap[currentIndex],
          ];

          steps.push({
            heap: [...newHeap],
            activeIndices: [swapIndex],
            swappedIndices: [currentIndex, swapIndex],
            message: `Échange avec le fils: ${newHeap[swapIndex].value} descend à la position ${swapIndex}`,
            operation: "heapify",
            heapType: type,
            operationCount: steps.length,
          });

          // Mettre à jour l'index courant
          currentIndex = swapIndex;
        }
      }

      // Étape finale
      steps.push({
        heap: [...newHeap],
        activeIndices: [],
        swappedIndices: null,
        message: `Heapify terminé, le tas ${
          type === "max" ? "maximum" : "minimum"
        } est maintenant valide`,
        operation: "heapify",
        heapType: type,
        operationCount: steps.length,
        completed: true,
      });

      return steps;
    },
    []
  );

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
  }, [
    operation,
    value,
    heap,
    heapType,
    generateInsertSteps,
    generateExtractMaxSteps,
    generateHeapifySteps,
    initializeHeap,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Opérations sur le Tas</h3>

          <div className="space-y-2">
            <Label htmlFor="heapType">Type de tas</Label>
            <Select
              value={heapType}
              onValueChange={(value) => setHeapType(value as HeapType)}
            >
              <SelectTrigger id="heapType">
                <SelectValue placeholder="Sélectionner un type de tas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="max">Tas maximum</SelectItem>
                <SelectItem value="min">Tas minimum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operation">Opération</Label>
            <Select
              value={operation}
              onValueChange={(value) => setOperation(value as OperationType)}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Sélectionner une opération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insert">Insertion</SelectItem>
                <SelectItem value="extractMax">
                  {heapType === "max" ? "Extraire Max" : "Extraire Min"}
                </SelectItem>
                <SelectItem value="heapify">Heapify</SelectItem>
                <SelectItem value="clear">Réinitialiser</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {operation === "insert" && (
            <div className="space-y-2">
              <Label htmlFor="value">Valeur</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Entrez une valeur"
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button onClick={executeOperation}>Exécuter</Button>
            <Button variant="outline" onClick={initializeHeap}>
              Réinitialiser
            </Button>
          </div>
        </div>

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
          stats={getStats()}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[400px] overflow-auto">
              {currentStep.heap.length > 0 && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg
                    width="800"
                    height="400"
                    viewBox="0 0 800 400"
                    className="transform scale-90"
                  >
                    <g transform="translate(400, 40)">
                      {(() => {
                        const positions = calculateNodePositions(
                          currentStep.heap
                        );
                        return (
                          <>
                            {renderEdges(
                              currentStep.heap,
                              positions,
                              currentStep.swappedIndices
                            )}
                            {renderNodes(
                              currentStep.heap,
                              positions,
                              currentStep.activeIndices,
                              currentStep.swappedIndices
                            )}
                          </>
                        );
                      })()}
                    </g>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </VisualizationContainer>
      </div>
    </div>
  );
}
