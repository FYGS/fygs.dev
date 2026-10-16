"use client";

import { motion } from "framer-motion";
import React from "react";

import { calculateNodePositions } from "./tree-layout";
import type { BinaryTreeStep, TreeNode } from "./types";

interface TreeCanvasProps {
  currentStep: BinaryTreeStep;
}

export function TreeCanvas({ currentStep }: TreeCanvasProps) {
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

  return (
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
  );
}
