"use client";

import React from "react";
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
type OperationType = "insert" | "search" | "delete" | "traverse" | "clear";
type TraversalType = "inorder" | "preorder" | "postorder" | "levelorder";

// Interface pour un nœud d'arbre binaire
interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// Interface pour une étape de visualisation
interface BinaryTreeStep {
  root: TreeNode | null;
  activeNodes: string[]; // IDs des nœuds actifs
  highlightedEdges: { from: string; to: string }[];
  message: string;
  operation: OperationType;
  traversalType?: TraversalType;
  operationCount: number;
  targetValue?: number;
  found?: boolean;
  completed?: boolean;
  traversalPath?: number[];
}

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

  // Obtenir les statistiques pour l'étape actuelle
  const getStats = () => {
    const stats: { label: string; value: string | number }[] = [
      { label: "Opérations", value: currentStep.operationCount },
    ];

    // Ajouter des statistiques spécifiques à l'opération
    switch (currentStep.operation) {
      case "insert":
      case "search":
      case "delete":
        stats.push({ label: "Complexité", value: "O(log n)*" });
        stats.push({
          label: "Note",
          value: "O(n) dans le pire cas (arbre déséquilibré)",
        });
        break;
      case "traverse":
        stats.push({ label: "Complexité", value: "O(n)" });
        stats.push({
          label: "Type",
          value: currentStep.traversalType || "inorder",
        });
        break;
      case "clear":
        stats.push({ label: "Complexité", value: "O(1)" });
        break;
    }

    return stats;
  };

  // Fonction pour calculer les coordonnées des nœuds dans l'arbre
  const calculateNodePositions = (
    node: TreeNode | null,
    level = 0,
    position = 0,
    positions: Record<string, { x: number; y: number }> = {},
    levelWidths: Record<number, number> = {},
    nodeSpacing = 60,
    levelHeight = 80
  ) => {
    if (!node) return positions;

    // Mettre à jour le nombre de nœuds à ce niveau
    levelWidths[level] = (levelWidths[level] || 0) + 1;

    // Calculer les positions des enfants d'abord
    calculateNodePositions(
      node.left,
      level + 1,
      position * 2,
      positions,
      levelWidths,
      nodeSpacing,
      levelHeight
    );
    calculateNodePositions(
      node.right,
      level + 1,
      position * 2 + 1,
      positions,
      levelWidths,
      nodeSpacing,
      levelHeight
    );

    // Calculer la position horizontale en fonction du niveau et de la position
    const horizontalSpacing = nodeSpacing * Math.pow(2, Math.max(0, 4 - level));
    const x = position * horizontalSpacing;
    const y = level * levelHeight;

    positions[node.id] = { x, y };

    return positions;
  };

  // Fonction pour dessiner les arêtes entre les nœuds
  const renderEdges = (
    node: TreeNode | null,
    positions: Record<string, { x: number; y: number }>,
    offsetX = 0,
    offsetY = 0
  ): React.JSX.Element[] | null => {
    if (!node) return null;

    const edges = [];

    if (node.left) {
      const isHighlighted = currentStep.highlightedEdges.some(
        (edge) => edge.from === node.id && edge.to === node.left!.id
      );

      edges.push(
        <line
          key={`${node.id}-${node.left.id}`}
          x1={positions[node.id].x + offsetX}
          y1={positions[node.id].y + offsetY}
          x2={positions[node.left.id].x + offsetX}
          y2={positions[node.left.id].y + offsetY}
          stroke={isHighlighted ? "#4f46e5" : "#a5b4fc"}
          strokeWidth={isHighlighted ? 3 : 1.5}
          strokeLinecap="round"
          strokeDasharray={isHighlighted ? "" : ""}
        />
      );

      edges.push(
        ...(renderEdges(node.left, positions, offsetX, offsetY) || [])
      );
    }

    if (node.right) {
      const isHighlighted = currentStep.highlightedEdges.some(
        (edge) => edge.from === node.id && edge.to === node.right!.id
      );

      edges.push(
        <line
          key={`${node.id}-${node.right.id}`}
          x1={positions[node.id].x + offsetX}
          y1={positions[node.id].y + offsetY}
          x2={positions[node.right.id].x + offsetX}
          y2={positions[node.right.id].y + offsetY}
          stroke={isHighlighted ? "#4f46e5" : "#a5b4fc"}
          strokeWidth={isHighlighted ? 3 : 1.5}
          strokeLinecap="round"
          strokeDasharray={isHighlighted ? "" : ""}
        />
      );

      edges.push(
        ...(renderEdges(node.right, positions, offsetX, offsetY) || [])
      );
    }

    return edges;
  };

  // Fonction pour dessiner les nœuds de l'arbre
  const renderNodes = (
    node: TreeNode | null,
    positions: Record<string, { x: number; y: number }>,
    offsetX = 0,
    offsetY = 0
  ): React.JSX.Element[] | null => {
    if (!node) return null;

    const nodes = [];
    const isActive = currentStep.activeNodes.includes(node.id);
    const isTarget = currentStep.targetValue === node.value;

    // Déterminer les couleurs en fonction de l'opération et de l'état
    let borderColor = "border-indigo-300";
    let bgColor = "bg-linear-to-br from-indigo-50 to-white";
    let textColor = "text-indigo-700";
    let shadowClass = "shadow-xs";

    if (isActive && isTarget) {
      // Nœud actif et cible (trouvé)
      switch (currentStep.operation) {
        case "search":
          borderColor = "border-emerald-500";
          bgColor = "bg-linear-to-br from-emerald-200 to-emerald-50";
          textColor = "text-emerald-800";
          shadowClass = "shadow-md";
          break;
        case "delete":
          borderColor = "border-rose-500";
          bgColor = "bg-linear-to-br from-rose-200 to-rose-50";
          textColor = "text-rose-800";
          shadowClass = "shadow-md";
          break;
        default:
          borderColor = "border-purple-500";
          bgColor = "bg-linear-to-br from-purple-200 to-purple-50";
          textColor = "text-purple-800";
          shadowClass = "shadow-md";
      }
    } else if (isActive) {
      // Nœud actif (en cours d'examen)
      switch (currentStep.operation) {
        case "insert":
          borderColor = "border-teal-500";
          bgColor = "bg-linear-to-br from-teal-200 to-teal-50";
          textColor = "text-teal-800";
          shadowClass = "shadow-md";
          break;
        case "search":
          borderColor = "border-amber-500";
          bgColor = "bg-linear-to-br from-amber-200 to-amber-50";
          textColor = "text-amber-800";
          shadowClass = "shadow-md";
          break;
        case "delete":
          borderColor = "border-rose-500";
          bgColor = "bg-linear-to-br from-rose-200 to-rose-50";
          textColor = "text-rose-800";
          shadowClass = "shadow-md";
          break;
        case "traverse":
          borderColor = "border-blue-500";
          bgColor = "bg-linear-to-br from-blue-200 to-blue-50";
          textColor = "text-blue-800";
          shadowClass = "shadow-md";
          break;
        default:
          borderColor = "border-primary";
          bgColor = "bg-linear-to-br from-primary/30 to-primary/10";
          textColor = "text-primary-foreground";
          shadowClass = "shadow-md";
      }
    } else if (isTarget && !currentStep.found) {
      // Cible recherchée mais pas encore trouvée
      borderColor = "border-fuchsia-400";
      bgColor = "bg-linear-to-br from-fuchsia-100 to-fuchsia-50/50";
      textColor = "text-fuchsia-700";
      shadowClass = "shadow-xs";
    }

    nodes.push(
      <motion.g
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: isActive ? 1.1 : 1,
          transition: { duration: 0.3 },
        }}
      >
        <circle
          cx={positions[node.id].x + offsetX}
          cy={positions[node.id].y + offsetY}
          r={20}
          fill="white"
          className={`${bgColor} ${borderColor} border-2 ${shadowClass}`}
          stroke={isActive ? "currentColor" : "#e2e8f0"}
        />
        <text
          x={positions[node.id].x + offsetX}
          y={positions[node.id].y + offsetY}
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

    if (node.left) {
      nodes.push(
        ...(renderNodes(node.left, positions, offsetX, offsetY) || [])
      );
    }

    if (node.right) {
      nodes.push(
        ...(renderNodes(node.right, positions, offsetX, offsetY) || [])
      );
    }

    return nodes;
  };

  // Générer les étapes pour le parcours de l'arbre
  const generateTraverseSteps = useCallback(
    (currentRoot: TreeNode | null, type: TraversalType) => {
      const steps: BinaryTreeStep[] = [];
      const newRoot = currentRoot
        ? JSON.parse(JSON.stringify(currentRoot))
        : null;

      // Étape initiale
      steps.push({
        root: newRoot,
        activeNodes: [],
        highlightedEdges: [],
        message: `Parcours ${type} de l'arbre`,
        operation: "traverse",
        traversalType: type,
        operationCount: 0,
        traversalPath: [],
      });

      if (!newRoot) {
        // Arbre vide
        steps.push({
          root: null,
          activeNodes: [],
          highlightedEdges: [],
          message: `L'arbre est vide, aucun parcours possible`,
          operation: "traverse",
          traversalType: type,
          operationCount: 1,
          traversalPath: [],
          completed: true,
        });

        return steps;
      }

      // Tableau pour stocker le chemin de parcours
      const traversalPath: number[] = [];

      // Implémentation simplifiée pour résoudre la référence circulaire
      // Nous implémenterons les détails dans une étape ultérieure

      // Parcours infixe simple pour démonstration
      const inorderTraversal = (node: TreeNode | null) => {
        if (!node) return;
        inorderTraversal(node.left);
        traversalPath.push(node.value);
        steps.push({
          root: newRoot,
          activeNodes: [node.id],
          highlightedEdges: [],
          message: `Visite du noeud ${node.value}`,
          operation: "traverse",
          traversalType: type,
          operationCount: traversalPath.length,
          traversalPath: [...traversalPath],
        });
        inorderTraversal(node.right);
      };

      // Parcours préfixe simple
      const preorderTraversal = (node: TreeNode | null) => {
        if (!node) return;
        traversalPath.push(node.value);
        steps.push({
          root: newRoot,
          activeNodes: [node.id],
          highlightedEdges: [],
          message: `Visite du noeud ${node.value}`,
          operation: "traverse",
          traversalType: type,
          operationCount: traversalPath.length,
          traversalPath: [...traversalPath],
        });
        preorderTraversal(node.left);
        preorderTraversal(node.right);
      };

      // Parcours postfixe simple
      const postorderTraversal = (node: TreeNode | null) => {
        if (!node) return;
        postorderTraversal(node.left);
        postorderTraversal(node.right);
        traversalPath.push(node.value);
        steps.push({
          root: newRoot,
          activeNodes: [node.id],
          highlightedEdges: [],
          message: `Visite du noeud ${node.value}`,
          operation: "traverse",
          traversalType: type,
          operationCount: traversalPath.length,
          traversalPath: [...traversalPath],
        });
      };

      // Parcours par niveau simple
      const levelOrderTraversal = () => {
        if (!newRoot) return;

        const queue: TreeNode[] = [newRoot];

        while (queue.length > 0) {
          const node = queue.shift()!;
          traversalPath.push(node.value);
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges: [],
            message: `Visite du noeud ${node.value}`,
            operation: "traverse",
            traversalType: type,
            operationCount: traversalPath.length,
            traversalPath: [...traversalPath],
          });

          if (node.left) queue.push(node.left);
          if (node.right) queue.push(node.right);
        }
      };

      // Exécuter le parcours selon le type sélectionné
      switch (type) {
        case "inorder":
          inorderTraversal(newRoot);
          break;
        case "preorder":
          preorderTraversal(newRoot);
          break;
        case "postorder":
          postorderTraversal(newRoot);
          break;
        case "levelorder":
          levelOrderTraversal();
          break;
      }

      // Ajouter une étape finale
      steps.push({
        root: newRoot,
        activeNodes: [],
        highlightedEdges: [],
        message: `Parcours ${type} terminé: [${traversalPath.join(", ")}]`,
        operation: "traverse",
        traversalType: type,
        operationCount: traversalPath.length + 1,
        traversalPath,
        completed: true,
      });

      return steps;
    },
    []
  );

  // Générer les étapes pour la recherche d'une valeur
  const generateSearchSteps = useCallback(
    (currentRoot: TreeNode | null, valueToSearch: number) => {
      const steps: BinaryTreeStep[] = [];
      const newRoot = currentRoot
        ? JSON.parse(JSON.stringify(currentRoot))
        : null;

      // Étape initiale
      steps.push({
        root: newRoot,
        activeNodes: [],
        highlightedEdges: [],
        message: `Recherche de la valeur ${valueToSearch}`,
        operation: "search",
        operationCount: 0,
        targetValue: valueToSearch,
      });

      if (!newRoot) {
        // Arbre vide
        steps.push({
          root: null,
          activeNodes: [],
          highlightedEdges: [],
          message: `L'arbre est vide, la valeur ${valueToSearch} n'a pas été trouvée`,
          operation: "search",
          operationCount: 1,
          targetValue: valueToSearch,
          found: false,
          completed: true,
        });

        return steps;
      }

      // Fonction récursive pour rechercher une valeur et générer les étapes
      const searchWithSteps = (
        node: TreeNode | null,
        value: number,
        path: TreeNode[] = [],
        operationCount = 1
      ): { found: boolean; operationCount: number } => {
        if (node === null) {
          // Valeur non trouvée
          steps.push({
            root: newRoot,
            activeNodes: [],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: "null" }]
                : [],
            message: `Noeud null atteint, la valeur ${value} n'a pas été trouvée`,
            operation: "search",
            operationCount,
            targetValue: value,
            found: false,
            completed: true,
          });

          return { found: false, operationCount: operationCount + 1 };
        }

        // Ajouter une étape pour la visite du noeud actuel
        steps.push({
          root: newRoot,
          activeNodes: [node.id],
          highlightedEdges:
            path.length > 0
              ? [{ from: path[path.length - 1].id, to: node.id }]
              : [],
          message: `Visite du noeud avec la valeur ${node.value}`,
          operation: "search",
          operationCount,
          targetValue: value,
        });

        // Mettre à jour le chemin
        const newPath = [...path, node];

        // Comparer la valeur avec le noeud actuel
        if (value === node.value) {
          // Valeur trouvée
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: node.id }]
                : [],
            message: `Valeur ${value} trouvée !`,
            operation: "search",
            operationCount: operationCount + 1,
            targetValue: value,
            found: true,
            completed: true,
          });

          return { found: true, operationCount: operationCount + 2 };
        } else if (value < node.value) {
          // Rechercher dans le sous-arbre gauche
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: node.id }]
                : [],
            message: `${value} < ${node.value}, on cherche à gauche`,
            operation: "search",
            operationCount: operationCount + 1,
            targetValue: value,
          });

          return searchWithSteps(node.left, value, newPath, operationCount + 2);
        } else {
          // Rechercher dans le sous-arbre droit
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: node.id }]
                : [],
            message: `${value} > ${node.value}, on cherche à droite`,
            operation: "search",
            operationCount: operationCount + 1,
            targetValue: value,
          });

          return searchWithSteps(
            node.right,
            value,
            newPath,
            operationCount + 2
          );
        }
      };

      // Rechercher la valeur et générer les étapes
      searchWithSteps(newRoot, valueToSearch, []);

      return steps;
    },
    []
  );

  // Générer les étapes pour l'insertion d'une valeur
  const generateInsertSteps = useCallback(
    (currentRoot: TreeNode | null, valueToInsert: number) => {
      const steps: BinaryTreeStep[] = [];
      let newRoot = currentRoot
        ? JSON.parse(JSON.stringify(currentRoot))
        : null;

      // Étape initiale
      steps.push({
        root: newRoot,
        activeNodes: [],
        highlightedEdges: [],
        message: `Insertion de la valeur ${valueToInsert}`,
        operation: "insert",
        operationCount: 0,
        targetValue: valueToInsert,
      });

      // Fonction récursive pour insérer une valeur et générer les étapes
      const insertWithSteps = (
        node: TreeNode | null,
        value: number,
        path: TreeNode[] = [],
        operationCount = 1
      ): { node: TreeNode; operationCount: number } => {
        // Si le noeud est null, créer un nouveau noeud
        if (node === null) {
          const newNode: TreeNode = {
            id: `node-${value}-${Date.now()}`,
            value,
            left: null,
            right: null,
          };

          // Ajouter une étape pour la création du nouveau noeud
          steps.push({
            root: newRoot,
            activeNodes: [newNode.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: newNode.id }]
                : [],
            message: `Création d'un nouveau noeud avec la valeur ${value}`,
            operation: "insert",
            operationCount,
            targetValue: value,
          });

          return { node: newNode, operationCount: operationCount + 1 };
        }

        // Ajouter une étape pour la comparaison avec le noeud actuel
        steps.push({
          root: newRoot,
          activeNodes: [node.id],
          highlightedEdges:
            path.length > 0
              ? [{ from: path[path.length - 1].id, to: node.id }]
              : [],
          message: `Comparaison avec le noeud ${node.value}`,
          operation: "insert",
          operationCount,
          targetValue: value,
        });

        // Mettre à jour le chemin
        const newPath = [...path, node];

        // Insérer dans le sous-arbre gauche ou droit selon la valeur
        if (value < node.value) {
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: node.id }]
                : [],
            message: `${value} < ${node.value}, on va insérer à gauche`,
            operation: "insert",
            operationCount: operationCount + 1,
            targetValue: value,
          });

          const result = insertWithSteps(
            node.left,
            value,
            newPath,
            operationCount + 2
          );
          node.left = result.node;
          return { node, operationCount: result.operationCount };
        } else if (value > node.value) {
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: node.id }]
                : [],
            message: `${value} > ${node.value}, on va insérer à droite`,
            operation: "insert",
            operationCount: operationCount + 1,
            targetValue: value,
          });

          const result = insertWithSteps(
            node.right,
            value,
            newPath,
            operationCount + 2
          );
          node.right = result.node;
          return { node, operationCount: result.operationCount };
        } else {
          // La valeur existe déjà dans l'arbre
          steps.push({
            root: newRoot,
            activeNodes: [node.id],
            highlightedEdges:
              path.length > 0
                ? [{ from: path[path.length - 1].id, to: node.id }]
                : [],
            message: `La valeur ${value} existe déjà dans l'arbre`,
            operation: "insert",
            operationCount: operationCount + 1,
            targetValue: value,
            found: true,
            completed: true,
          });

          return { node, operationCount: operationCount + 2 };
        }
      };

      // Insérer la valeur et générer les étapes
      if (newRoot === null) {
        const newNode: TreeNode = {
          id: `node-${valueToInsert}-${Date.now()}`,
          value: valueToInsert,
          left: null,
          right: null,
        };

        steps.push({
          root: newNode,
          activeNodes: [newNode.id],
          highlightedEdges: [],
          message: `Création du noeud racine avec la valeur ${valueToInsert}`,
          operation: "insert",
          operationCount: 1,
          targetValue: valueToInsert,
          completed: true,
        });

        newRoot = newNode;
      } else {
        const result = insertWithSteps(newRoot, valueToInsert, []);

        // Ajouter une étape finale
        if (!steps[steps.length - 1].completed) {
          steps.push({
            root: newRoot,
            activeNodes: [],
            highlightedEdges: [],
            message: `Insertion de la valeur ${valueToInsert} terminée`,
            operation: "insert",
            operationCount: result.operationCount,
            targetValue: valueToInsert,
            completed: true,
          });
        }
      }

      return steps;
    },
    []
  );

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
  }, [
    operation,
    value,
    root,
    traversalType,
    generateInsertSteps,
    generateSearchSteps,
    generateTraverseSteps,
    initializeTree,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">
            Opérations sur l&apos;Arbre Binaire
          </h3>

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
                <SelectItem value="search">Recherche</SelectItem>
                <SelectItem value="delete">Suppression</SelectItem>
                <SelectItem value="traverse">Parcours</SelectItem>
                <SelectItem value="clear">Réinitialiser</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {operation === "traverse" ? (
            <div className="space-y-2">
              <Label htmlFor="traversalType">Type de parcours</Label>
              <Select
                value={traversalType}
                onValueChange={(value) =>
                  setTraversalType(value as TraversalType)
                }
              >
                <SelectTrigger id="traversalType">
                  <SelectValue placeholder="Sélectionner un type de parcours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inorder">Infixe (Inorder)</SelectItem>
                  <SelectItem value="preorder">Préfixe (Preorder)</SelectItem>
                  <SelectItem value="postorder">
                    Postfixe (Postorder)
                  </SelectItem>
                  <SelectItem value="levelorder">
                    Par niveau (Level Order)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : operation !== "clear" ? (
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
          ) : null}

          <div className="flex justify-between">
            <Button onClick={executeOperation}>Exécuter</Button>
            <Button variant="outline" onClick={initializeTree}>
              Réinitialiser
            </Button>
          </div>
        </div>

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
          stats={getStats()}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[400px] overflow-auto">
              {currentStep.root && (
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
                          currentStep.root
                        );
                        return (
                          <>
                            {renderEdges(currentStep.root, positions)}
                            {renderNodes(currentStep.root, positions)}
                          </>
                        );
                      })()}
                    </g>
                  </svg>
                </div>
              )}
            </div>

            {currentStep.traversalPath &&
              currentStep.traversalPath.length > 0 && (
                <div className="mt-4 p-2 bg-gray-100 rounded-md">
                  <p className="text-sm font-medium">Chemin de parcours:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentStep.traversalPath.map((value, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-md text-sm ${
                          index < currentStep.operationCount
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </VisualizationContainer>
      </div>
    </div>
  );
}
