"use client";

import { motion } from "framer-motion";

import type { GraphStep } from "./types";

interface GraphCanvasProps {
  currentStep: GraphStep;
}

export function GraphCanvas({ currentStep }: GraphCanvasProps) {
  return (
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
  );
}
