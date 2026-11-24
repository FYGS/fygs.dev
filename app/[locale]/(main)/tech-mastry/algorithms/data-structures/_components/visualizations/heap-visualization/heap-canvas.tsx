"use client";

import { motion } from "framer-motion";

import { calculateNodePositions } from "./heap-layout";
import type { HeapNode, HeapStep } from "./types";

interface HeapCanvasProps {
  currentStep: HeapStep;
}

export function HeapCanvas({ currentStep }: HeapCanvasProps) {
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

  return (
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
  );
}
