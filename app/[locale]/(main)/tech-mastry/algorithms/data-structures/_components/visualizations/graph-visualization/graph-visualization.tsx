"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VisualizationContainer } from "../visualization-container";
import {
  generateBfsSteps,
  generateDfsSteps,
  generateDijkstraSteps,
} from "./graph-algorithms";
import { GraphCanvas } from "./graph-canvas";
import { getGraphStats } from "./graph-stats";
import { OperationPanel } from "./operation-panel";
import type {
  GraphEdge,
  GraphNode,
  GraphStep,
  GraphType,
  OperationType,
} from "./types";

export function GraphVisualization() {
  // État pour le graphe
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [graphType, setGraphType] = useState<GraphType>("undirected");

  // État pour les étapes de visualisation
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // État pour les contrôles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // État pour les entrées utilisateur
  const [nodeLabel, setNodeLabel] = useState<string>("");
  const [sourceNode, setSourceNode] = useState<string>("");
  const [targetNode, setTargetNode] = useState<string>("");
  const [edgeWeight, setEdgeWeight] = useState<string>("1");
  const [operation, setOperation] = useState<OperationType>("addNode");

  // Référence pour le timer d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Générer une position aléatoire pour un nouveau nœud
  const generateRandomPosition = useCallback(() => {
    // Dimensions de la zone de visualisation
    const width = 400 - 50; // Marge pour éviter les bords
    const height = 400 - 50;

    // Position aléatoire
    return {
      x: 50 + Math.random() * width,
      y: 50 + Math.random() * height,
    };
  }, []);

  // Ajouter un nœud au graphe
  const addNode = useCallback(
    (label: string) => {
      if (!label.trim()) return;

      // Générer un ID unique
      const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Générer une position aléatoire
      const { x, y } = generateRandomPosition();

      // Créer le nouveau nœud
      const newNode: GraphNode = {
        id,
        label,
        x,
        y,
      };

      // Mettre à jour les nœuds
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);

      // Créer une nouvelle étape
      const newStep: GraphStep = {
        nodes: updatedNodes,
        edges,
        activeNodeIds: [id],
        activeEdgeIds: [],
        visitedNodeIds: [],
        message: `Nœud "${label}" ajouté`,
        operation: "addNode",
        operationCount: steps[steps.length - 1].operationCount + 1,
      };

      // Mettre à jour les étapes
      setSteps([...steps, newStep]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser le champ de saisie
      setNodeLabel("");
    },
    [nodes, edges, steps, generateRandomPosition]
  );

  // Ajouter une arête au graphe
  const addEdge = useCallback(
    (source: string, target: string, weight: number) => {
      if (!source || !target || source === target) return;

      // Vérifier si l'arête existe déjà
      const edgeExists = edges.some(
        (edge) =>
          (edge.source === source && edge.target === target) ||
          (!edge.directed && edge.source === target && edge.target === source)
      );

      if (edgeExists) return;

      // Générer un ID unique
      const id = `edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Créer la nouvelle arête
      const newEdge: GraphEdge = {
        id,
        source,
        target,
        weight,
        directed: graphType === "directed",
      };

      // Mettre à jour les arêtes
      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);

      // Créer une nouvelle étape
      const newStep: GraphStep = {
        nodes,
        edges: updatedEdges,
        activeNodeIds: [source, target],
        activeEdgeIds: [id],
        visitedNodeIds: [],
        message: `Arête ajoutée de "${
          nodes.find((n) => n.id === source)?.label
        }" à "${
          nodes.find((n) => n.id === target)?.label
        }" avec un poids de ${weight}`,
        operation: "addEdge",
        operationCount: steps[steps.length - 1].operationCount + 1,
      };

      // Mettre à jour les étapes
      setSteps([...steps, newStep]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser les champs de saisie
      setSourceNode("");
      setTargetNode("");
      setEdgeWeight("1");
    },
    [nodes, edges, steps, graphType]
  );

  // Supprimer un nœud du graphe
  const removeNode = useCallback(
    (nodeId: string) => {
      if (!nodeId) return;

      // Supprimer le nœud
      const updatedNodes = nodes.filter((node) => node.id !== nodeId);

      // Supprimer toutes les arêtes connectées à ce nœud
      const updatedEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );

      // Mettre à jour les nœuds et arêtes
      setNodes(updatedNodes);
      setEdges(updatedEdges);

      // Créer une nouvelle étape
      const newStep: GraphStep = {
        nodes: updatedNodes,
        edges: updatedEdges,
        activeNodeIds: [],
        activeEdgeIds: [],
        visitedNodeIds: [],
        message: `Nœud "${nodes.find((n) => n.id === nodeId)?.label}" supprimé`,
        operation: "removeNode",
        operationCount: steps[steps.length - 1].operationCount + 1,
      };

      // Mettre à jour les étapes
      setSteps([...steps, newStep]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser le champ de saisie
      setSourceNode("");
    },
    [nodes, edges, steps]
  );

  // Supprimer une arête du graphe
  const removeEdge = useCallback(
    (source: string, target: string) => {
      if (!source || !target) return;

      // Trouver l'arête à supprimer
      const edgeToRemove = edges.find(
        (edge) =>
          (edge.source === source && edge.target === target) ||
          (!edge.directed && edge.source === target && edge.target === source)
      );

      if (!edgeToRemove) return;

      // Supprimer l'arête
      const updatedEdges = edges.filter((edge) => edge.id !== edgeToRemove.id);

      // Mettre à jour les arêtes
      setEdges(updatedEdges);

      // Créer une nouvelle étape
      const newStep: GraphStep = {
        nodes,
        edges: updatedEdges,
        activeNodeIds: [source, target],
        activeEdgeIds: [],
        visitedNodeIds: [],
        message: `Arête supprimée entre "${
          nodes.find((n) => n.id === source)?.label
        }" et "${nodes.find((n) => n.id === target)?.label}"`,
        operation: "removeEdge",
        operationCount: steps[steps.length - 1].operationCount + 1,
      };

      // Mettre à jour les étapes
      setSteps([...steps, newStep]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser les champs de saisie
      setSourceNode("");
      setTargetNode("");
    },
    [nodes, edges, steps]
  );

  // Initialiser un graphe vide
  const initializeGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);

    // Réinitialiser les étapes
    const initialStep: GraphStep = {
      nodes: [],
      edges: [],
      activeNodeIds: [],
      activeEdgeIds: [],
      visitedNodeIds: [],
      message: "Graphe initialisé",
      operation: "clear",
      operationCount: 0,
    };

    setSteps([initialStep]);
    setCurrentStepIndex(0);
    setIsPlaying(false);

    // Réinitialiser les champs de saisie
    setNodeLabel("");
    setSourceNode("");
    setTargetNode("");
    setEdgeWeight("1");
  }, []);

  // Parcours en largeur (BFS)
  const runBFS = useCallback(
    (startNodeId: string) => {
      if (!startNodeId || nodes.length === 0) return;

      const bfsSteps = generateBfsSteps(
        nodes,
        edges,
        startNodeId,
        steps[steps.length - 1].operationCount
      );

      // Mettre à jour les étapes
      setSteps([...steps, ...bfsSteps]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser les champs de saisie
      setSourceNode("");
    },
    [nodes, edges, steps]
  );

  // Parcours en profondeur (DFS)
  const runDFS = useCallback(
    (startNodeId: string) => {
      if (!startNodeId || nodes.length === 0) return;

      const dfsSteps = generateDfsSteps(
        nodes,
        edges,
        startNodeId,
        steps[steps.length - 1].operationCount
      );

      // Mettre à jour les étapes
      setSteps([...steps, ...dfsSteps]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser les champs de saisie
      setSourceNode("");
    },
    [nodes, edges, steps]
  );

  // Algorithme de Dijkstra pour le plus court chemin
  const runDijkstra = useCallback(
    (startNodeId: string, endNodeId: string) => {
      if (
        !startNodeId ||
        !endNodeId ||
        startNodeId === endNodeId ||
        nodes.length === 0
      )
        return;

      const dijkstraSteps = generateDijkstraSteps(
        nodes,
        edges,
        startNodeId,
        endNodeId,
        steps[steps.length - 1].operationCount
      );

      // Mettre à jour les étapes
      setSteps([...steps, ...dijkstraSteps]);
      setCurrentStepIndex(steps.length);

      // Réinitialiser les champs de saisie
      setSourceNode("");
      setTargetNode("");
    },
    [nodes, edges, steps]
  );

  // Initialiser le graphe au chargement du composant
  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

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
    edges: [],
    activeNodeIds: [],
    activeEdgeIds: [],
    visitedNodeIds: [],
    message: "",
    operation: "addNode" as OperationType,
    operationCount: 0,
  };

  // Exécuter l'opération sélectionnée
  const handleExecute = () => {
    switch (operation) {
      case "addNode":
        if (nodeLabel.trim()) {
          addNode(nodeLabel);
        }
        break;
      case "addEdge":
        if (sourceNode && targetNode && edgeWeight) {
          addEdge(
            sourceNode,
            targetNode,
            parseInt(edgeWeight, 10) || 1
          );
        }
        break;
      case "removeNode":
        if (sourceNode) {
          removeNode(sourceNode);
        }
        break;
      case "removeEdge":
        if (sourceNode && targetNode) {
          removeEdge(sourceNode, targetNode);
        }
        break;
      case "bfs":
        if (sourceNode) {
          runBFS(sourceNode);
        }
        break;
      case "dfs":
        if (sourceNode) {
          runDFS(sourceNode);
        }
        break;
      case "dijkstra":
        if (sourceNode && targetNode) {
          runDijkstra(sourceNode, targetNode);
        }
        break;
      case "clear":
        initializeGraph();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <OperationPanel
          graphType={graphType}
          onGraphTypeChange={setGraphType}
          operation={operation}
          onOperationChange={setOperation}
          nodes={nodes}
          nodeLabel={nodeLabel}
          onNodeLabelChange={setNodeLabel}
          sourceNode={sourceNode}
          onSourceNodeChange={setSourceNode}
          targetNode={targetNode}
          onTargetNodeChange={setTargetNode}
          edgeWeight={edgeWeight}
          onEdgeWeightChange={setEdgeWeight}
          onExecute={handleExecute}
          onReset={initializeGraph}
        />

        {/* Visualisation */}
        <VisualizationContainer
          title="Visualisation de Graphe"
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
          stats={getGraphStats(currentStep)}
        >
          <GraphCanvas currentStep={currentStep} />
        </VisualizationContainer>
      </div>
    </div>
  );
}
