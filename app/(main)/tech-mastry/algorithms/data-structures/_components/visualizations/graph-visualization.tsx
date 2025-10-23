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
type OperationType =
  | "addNode"
  | "addEdge"
  | "removeNode"
  | "removeEdge"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "clear";

// Type de graphe
type GraphType = "directed" | "undirected";

// Interface pour un nœud du graphe
interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

// Interface pour une arête du graphe
interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed: boolean;
}

// Interface pour une étape de visualisation
interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeNodeIds: string[];
  activeEdgeIds: string[];
  visitedNodeIds: string[];
  message: string;
  operation: OperationType;
  operationCount: number;
  completed?: boolean;
}

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

      // Créer une copie des nœuds et arêtes
      const currentNodes = [...nodes];
      const currentEdges = [...edges];

      // Initialiser les structures de données pour le BFS
      const queue: string[] = [startNodeId];
      const visited = new Set<string>([startNodeId]);
      const visitOrder: string[] = [startNodeId];
      const edgesUsed: string[] = [];

      // Créer les étapes de visualisation
      const bfsSteps: GraphStep[] = [];

      // Étape initiale
      bfsSteps.push({
        nodes: currentNodes,
        edges: currentEdges,
        activeNodeIds: [startNodeId],
        activeEdgeIds: [],
        visitedNodeIds: [startNodeId],
        message: `Début du parcours en largeur (BFS) depuis le nœud "${
          currentNodes.find((n) => n.id === startNodeId)?.label
        }"`,
        operation: "bfs",
        operationCount: steps[steps.length - 1].operationCount + 1,
      });

      // Exécuter le BFS
      while (queue.length > 0) {
        const currentNodeId = queue.shift()!;

        // Trouver tous les voisins du nœud actuel
        const neighbors: { nodeId: string; edgeId: string }[] = [];

        currentEdges.forEach((edge) => {
          if (edge.source === currentNodeId) {
            neighbors.push({ nodeId: edge.target, edgeId: edge.id });
          } else if (!edge.directed && edge.target === currentNodeId) {
            neighbors.push({ nodeId: edge.source, edgeId: edge.id });
          }
        });

        // Visiter chaque voisin non visité
        for (const { nodeId, edgeId } of neighbors) {
          if (!visited.has(nodeId)) {
            // Marquer comme visité
            visited.add(nodeId);
            visitOrder.push(nodeId);
            queue.push(nodeId);
            edgesUsed.push(edgeId);

            // Ajouter une étape pour cette visite
            bfsSteps.push({
              nodes: currentNodes,
              edges: currentEdges,
              activeNodeIds: [nodeId],
              activeEdgeIds: [edgeId],
              visitedNodeIds: [...visitOrder],
              message: `Visite du nœud "${
                currentNodes.find((n) => n.id === nodeId)?.label
              }" depuis "${
                currentNodes.find((n) => n.id === currentNodeId)?.label
              }"`,
              operation: "bfs",
              operationCount:
                steps[steps.length - 1].operationCount + 1 + bfsSteps.length,
            });
          }
        }
      }

      // Étape finale
      bfsSteps.push({
        nodes: currentNodes,
        edges: currentEdges,
        activeNodeIds: [],
        activeEdgeIds: [],
        visitedNodeIds: [...visitOrder],
        message: `Parcours en largeur (BFS) terminé. Ordre de visite: ${visitOrder
          .map((id) => currentNodes.find((n) => n.id === id)?.label)
          .join(" -> ")}`,
        operation: "bfs",
        operationCount:
          steps[steps.length - 1].operationCount + 1 + bfsSteps.length,
        completed: true,
      });

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

      // Créer une copie des nœuds et arêtes
      const currentNodes = [...nodes];
      const currentEdges = [...edges];

      // Initialiser les structures de données pour le DFS
      const visited = new Set<string>();
      const visitOrder: string[] = [];
      const edgesUsed: string[] = [];

      // Créer les étapes de visualisation
      const dfsSteps: GraphStep[] = [];

      // Étape initiale
      dfsSteps.push({
        nodes: currentNodes,
        edges: currentEdges,
        activeNodeIds: [startNodeId],
        activeEdgeIds: [],
        visitedNodeIds: [],
        message: `Début du parcours en profondeur (DFS) depuis le nœud "${
          currentNodes.find((n) => n.id === startNodeId)?.label
        }"`,
        operation: "dfs",
        operationCount: steps[steps.length - 1].operationCount + 1,
      });

      // Fonction récursive pour le DFS
      const dfs = (nodeId: string, parentId: string | null = null) => {
        // Marquer comme visité
        visited.add(nodeId);
        visitOrder.push(nodeId);

        // Ajouter une étape pour cette visite
        dfsSteps.push({
          nodes: currentNodes,
          edges: currentEdges,
          activeNodeIds: [nodeId],
          activeEdgeIds: parentId
            ? [
                currentEdges.find(
                  (e) =>
                    (e.source === parentId && e.target === nodeId) ||
                    (!e.directed &&
                      e.source === nodeId &&
                      e.target === parentId)
                )?.id || "",
              ]
            : [],
          visitedNodeIds: [...visitOrder],
          message: `Visite du nœud "${
            currentNodes.find((n) => n.id === nodeId)?.label
          }"${
            parentId
              ? ` depuis "${
                  currentNodes.find((n) => n.id === parentId)?.label
                }"`
              : ""
          }`,
          operation: "dfs",
          operationCount:
            steps[steps.length - 1].operationCount + 1 + dfsSteps.length,
        });

        // Trouver tous les voisins du nœud actuel
        const neighbors: { nodeId: string; edgeId: string }[] = [];

        currentEdges.forEach((edge) => {
          if (edge.source === nodeId) {
            neighbors.push({ nodeId: edge.target, edgeId: edge.id });
          } else if (!edge.directed && edge.target === nodeId) {
            neighbors.push({ nodeId: edge.source, edgeId: edge.id });
          }
        });

        // Visiter chaque voisin non visité
        for (const { nodeId: neighborId, edgeId } of neighbors) {
          if (!visited.has(neighborId)) {
            edgesUsed.push(edgeId);
            dfs(neighborId, nodeId);
          }
        }
      };

      // Exécuter le DFS
      dfs(startNodeId);

      // Étape finale
      dfsSteps.push({
        nodes: currentNodes,
        edges: currentEdges,
        activeNodeIds: [],
        activeEdgeIds: [],
        visitedNodeIds: [...visitOrder],
        message: `Parcours en profondeur (DFS) terminé. Ordre de visite: ${visitOrder
          .map((id) => currentNodes.find((n) => n.id === id)?.label)
          .join(" -> ")}`,
        operation: "dfs",
        operationCount:
          steps[steps.length - 1].operationCount + 1 + dfsSteps.length,
        completed: true,
      });

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

      // Créer une copie des nœuds et arêtes
      const currentNodes = [...nodes];
      const currentEdges = [...edges];

      // Initialiser les structures de données pour Dijkstra
      const distances: Record<string, number> = {};
      const previous: Record<string, string | null> = {};
      const unvisited = new Set<string>();

      // Initialiser les distances
      currentNodes.forEach((node) => {
        distances[node.id] = node.id === startNodeId ? 0 : Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
      });

      // Créer les étapes de visualisation
      const dijkstraSteps: GraphStep[] = [];

      // Étape initiale
      dijkstraSteps.push({
        nodes: currentNodes,
        edges: currentEdges,
        activeNodeIds: [startNodeId],
        activeEdgeIds: [],
        visitedNodeIds: [],
        message: `Début de l&apos;algorithme de Dijkstra depuis "${
          currentNodes.find((n) => n.id === startNodeId)?.label
        }" vers "${currentNodes.find((n) => n.id === endNodeId)?.label}"`,
        operation: "dijkstra",
        operationCount: steps[steps.length - 1].operationCount + 1,
      });

      // Exécuter l'algorithme de Dijkstra
      while (unvisited.size > 0) {
        // Trouver le nœud non visité avec la plus petite distance
        let currentNodeId: string | null = null;
        let smallestDistance = Infinity;

        unvisited.forEach((nodeId) => {
          if (distances[nodeId] < smallestDistance) {
            smallestDistance = distances[nodeId];
            currentNodeId = nodeId;
          }
        });

        // Si aucun chemin n'est trouvé ou si nous avons atteint le nœud cible
        if (
          currentNodeId === null ||
          distances[currentNodeId] === Infinity ||
          currentNodeId === endNodeId
        ) {
          break;
        }

        // Retirer le nœud actuel des non visités
        unvisited.delete(currentNodeId);

        // Trouver tous les voisins du nœud actuel
        const neighbors: { nodeId: string; edgeId: string; weight: number }[] =
          [];

        currentEdges.forEach((edge) => {
          if (edge.source === currentNodeId) {
            neighbors.push({
              nodeId: edge.target,
              edgeId: edge.id,
              weight: edge.weight,
            });
          } else if (!edge.directed && edge.target === currentNodeId) {
            neighbors.push({
              nodeId: edge.source,
              edgeId: edge.id,
              weight: edge.weight,
            });
          }
        });

        // Mettre à jour les distances des voisins
        for (const { nodeId: neighborId, edgeId, weight } of neighbors) {
          if (unvisited.has(neighborId)) {
            const tentativeDistance = distances[currentNodeId] + weight;

            if (tentativeDistance < distances[neighborId]) {
              distances[neighborId] = tentativeDistance;
              previous[neighborId] = currentNodeId;

              // Ajouter une étape pour cette mise à jour
              dijkstraSteps.push({
                nodes: currentNodes,
                edges: currentEdges,
                activeNodeIds: [neighborId, currentNodeId],
                activeEdgeIds: [edgeId],
                visitedNodeIds: Array.from(
                  currentNodes
                    .map((n) => n.id)
                    .filter((id) => !unvisited.has(id))
                ),
                message: `Mise à jour de la distance de "${
                  currentNodes.find((n) => n.id === neighborId)?.label
                }" à ${tentativeDistance} via "${
                  currentNodes.find((n) => n.id === currentNodeId)?.label
                }"`,
                operation: "dijkstra",
                operationCount:
                  steps[steps.length - 1].operationCount +
                  1 +
                  dijkstraSteps.length,
              });
            }
          }
        }
      }

      // Reconstruire le chemin
      const path: string[] = [];
      let current = endNodeId;

      while (current) {
        path.unshift(current);
        current = previous[current] || "";
        if (!current) break;
      }

      // Vérifier si un chemin a été trouvé
      if (path.length <= 1 || path[0] !== startNodeId) {
        // Aucun chemin trouvé
        dijkstraSteps.push({
          nodes: currentNodes,
          edges: currentEdges,
          activeNodeIds: [startNodeId, endNodeId],
          activeEdgeIds: [],
          visitedNodeIds: Array.from(
            currentNodes.map((n) => n.id).filter((id) => !unvisited.has(id))
          ),
          message: `Aucun chemin trouvé entre "${
            currentNodes.find((n) => n.id === startNodeId)?.label
          }" et "${currentNodes.find((n) => n.id === endNodeId)?.label}"`,
          operation: "dijkstra",
          operationCount:
            steps[steps.length - 1].operationCount + 1 + dijkstraSteps.length,
          completed: true,
        });
      } else {
        // Chemin trouvé
        const pathEdges: string[] = [];

        // Trouver les arêtes du chemin
        for (let i = 0; i < path.length - 1; i++) {
          const edge = currentEdges.find(
            (e) =>
              (e.source === path[i] && e.target === path[i + 1]) ||
              (!e.directed && e.source === path[i + 1] && e.target === path[i])
          );

          if (edge) pathEdges.push(edge.id);
        }

        // Étape finale avec le chemin trouvé
        dijkstraSteps.push({
          nodes: currentNodes,
          edges: currentEdges,
          activeNodeIds: [...path],
          activeEdgeIds: [...pathEdges],
          visitedNodeIds: Array.from(
            currentNodes.map((n) => n.id).filter((id) => !unvisited.has(id))
          ),
          message: `Chemin le plus court trouvé entre "${
            currentNodes.find((n) => n.id === startNodeId)?.label
          }" et "${currentNodes.find((n) => n.id === endNodeId)?.label}": ${path
            .map((id) => currentNodes.find((n) => n.id === id)?.label)
            .join(" -> ")} (distance totale: ${distances[endNodeId]})`,
          operation: "dijkstra",
          operationCount:
            steps[steps.length - 1].operationCount + 1 + dijkstraSteps.length,
          completed: true,
        });
      }

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

  // Obtenir les statistiques pour l'étape actuelle
  const getStats = () => {
    const stats: { label: string; value: string | number }[] = [
      { label: "Nœuds", value: currentStep.nodes.length },
      { label: "Arêtes", value: currentStep.edges.length },
      { label: "Opérations", value: currentStep.operationCount },
    ];

    // Ajouter des statistiques spécifiques à l'opération
    switch (currentStep.operation) {
      case "bfs":
        stats.push({ label: "Complexité", value: "O(V+E)" });
        stats.push({ label: "Note", value: "V = nœuds, E = arêtes" });
        break;
      case "dfs":
        stats.push({ label: "Complexité", value: "O(V+E)" });
        stats.push({ label: "Note", value: "V = nœuds, E = arêtes" });
        break;
      case "dijkstra":
        stats.push({ label: "Complexité", value: "O(E log V)" });
        stats.push({ label: "Note", value: "V = nœuds, E = arêtes" });
        break;
    }

    return stats;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contrôles d'opération */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium">Opérations sur le Graphe</h3>

          <div className="space-y-2">
            <Label htmlFor="graphType">Type de graphe</Label>
            <Select
              value={graphType}
              onValueChange={(value) => setGraphType(value as GraphType)}
            >
              <SelectTrigger id="graphType">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="directed">Orienté</SelectItem>
                <SelectItem value="undirected">Non orienté</SelectItem>
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
                <SelectItem value="addNode">Ajouter un nœud</SelectItem>
                <SelectItem value="addEdge">Ajouter une arête</SelectItem>
                <SelectItem value="removeNode">Supprimer un nœud</SelectItem>
                <SelectItem value="removeEdge">Supprimer une arête</SelectItem>
                <SelectItem value="bfs">Parcours en largeur (BFS)</SelectItem>
                <SelectItem value="dfs">
                  Parcours en profondeur (DFS)
                </SelectItem>
                <SelectItem value="dijkstra">
                  Plus court chemin (Dijkstra)
                </SelectItem>
                <SelectItem value="clear">Vider le graphe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Champs d'entrée conditionnels */}
          {operation === "addNode" && (
            <div className="space-y-2">
              <Label htmlFor="nodeLabel">Étiquette du nœud</Label>
              <Input
                id="nodeLabel"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="Entrez une étiquette"
              />
            </div>
          )}

          {(operation === "addEdge" || operation === "removeEdge") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sourceNode">Nœud source</Label>
                <Select value={sourceNode} onValueChange={setSourceNode}>
                  <SelectTrigger id="sourceNode">
                    <SelectValue placeholder="Sélectionner un nœud" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetNode">Nœud cible</Label>
                <Select value={targetNode} onValueChange={setTargetNode}>
                  <SelectTrigger id="targetNode">
                    <SelectValue placeholder="Sélectionner un nœud" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {operation === "addEdge" && (
                <div className="space-y-2">
                  <Label htmlFor="edgeWeight">Poids de l&apos;arête</Label>
                  <Input
                    id="edgeWeight"
                    type="number"
                    min={1}
                    value={edgeWeight}
                    onChange={(e) => setEdgeWeight(e.target.value)}
                    placeholder="Entrez un poids"
                  />
                </div>
              )}
            </>
          )}

          {(operation === "removeNode" ||
            operation === "bfs" ||
            operation === "dfs" ||
            operation === "dijkstra") && (
            <div className="space-y-2">
              <Label htmlFor="startNode">Nœud de départ</Label>
              <Select value={sourceNode} onValueChange={setSourceNode}>
                <SelectTrigger id="startNode">
                  <SelectValue placeholder="Sélectionner un nœud" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {operation === "dijkstra" && (
            <div className="space-y-2">
              <Label htmlFor="endNode">Nœud d&apos;arrivée</Label>
              <Select value={targetNode} onValueChange={setTargetNode}>
                <SelectTrigger id="endNode">
                  <SelectValue placeholder="Sélectionner un nœud" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              onClick={() => {
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
              }}
            >
              Exécuter
            </Button>
            <Button variant="outline" onClick={initializeGraph}>
              Réinitialiser
            </Button>
          </div>
        </div>

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
          stats={getStats()}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full h-[400px] border border-gray-200 rounded-md bg-gray-50 relative overflow-hidden">
              {/* Rendu des arêtes */}
              <svg className="absolute inset-0 w-full h-full">
                {currentStep.edges.map((edge) => {
                  const sourceNode = currentStep.nodes.find(
                    (n) => n.id === edge.source
                  );
                  const targetNode = currentStep.nodes.find(
                    (n) => n.id === edge.target
                  );

                  if (!sourceNode || !targetNode) return null;

                  const isActive = currentStep.activeEdgeIds.includes(edge.id);

                  // Calculer les points de départ et d'arrivée
                  const x1 = sourceNode.x;
                  const y1 = sourceNode.y;
                  const x2 = targetNode.x;
                  const y2 = targetNode.y;

                  // Calculer l'angle pour la flèche (si dirigée)
                  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

                  return (
                    <g key={edge.id}>
                      {/* Ligne de l'arête */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isActive ? "#3b82f6" : "#9ca3af"}
                        strokeWidth={isActive ? 3 : 2}
                        strokeLinecap="round"
                      />

                      {/* Flèche pour les graphes dirigés */}
                      {edge.directed && (
                        <polygon
                          points="0,-4 8,0 0,4"
                          transform={`translate(${x2},${y2}) rotate(${angle})`}
                          fill={isActive ? "#3b82f6" : "#9ca3af"}
                        />
                      )}

                      {/* Poids de l'arête */}
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 10}
                        textAnchor="middle"
                        fill={isActive ? "#3b82f6" : "#4b5563"}
                        fontSize="12"
                        fontWeight={isActive ? "bold" : "normal"}
                        className="select-none"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Rendu des nœuds */}
              <div className="absolute inset-0">
                {currentStep.nodes.map((node) => {
                  const isActive = currentStep.activeNodeIds.includes(node.id);
                  const isVisited = currentStep.visitedNodeIds.includes(
                    node.id
                  );

                  return (
                    <motion.div
                      key={node.id}
                      className={`absolute w-12 h-12 rounded-full flex items-center justify-center select-none
                        ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : isVisited
                            ? "bg-green-500 text-white"
                            : "bg-linear-to-br from-gray-100 to-gray-300 text-gray-800"
                        }
                        shadow-md border-2 ${
                          isActive
                            ? "border-blue-600"
                            : isVisited
                            ? "border-green-600"
                            : "border-gray-400"
                        }`}
                      style={{
                        left: `${node.x - 24}px`,
                        top: `${node.y - 24}px`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <span className="font-bold">{node.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Message si aucun nœud */}
              {currentStep.nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Ajoutez des nœuds pour commencer
                </div>
              )}
            </div>
          </div>
        </VisualizationContainer>
      </div>
    </div>
  );
}
