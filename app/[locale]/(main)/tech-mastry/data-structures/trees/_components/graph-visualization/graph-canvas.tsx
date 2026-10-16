"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import type { Graph } from "./types";
import { ZoomControls } from "./zoom-controls";

interface GraphCanvasProps {
  graph: Graph | null;
}

export function GraphCanvas({ graph }: GraphCanvasProps) {
  return (
    <div className="relative w-full h-[400px] border rounded-lg bg-background/50">
      <ZoomControls />

      <ScrollArea className="h-full w-full">
        <div className="h-full min-w-[800px]">
          <div
            id="graph-zoom"
            className="h-full w-full flex items-center justify-center"
            style={{
              transform: "scale(1)",
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
              overflow: "visible",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="-200 -200 400 400"
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: "visible" }}
            >
              {graph && (
                <g>
                  {/* Edges */}
                  {graph.edges.map((edge, index) => {
                    const source = graph!.nodes.find(
                      (n) => n.id === edge.source
                    )!;
                    const target = graph!.nodes.find(
                      (n) => n.id === edge.target
                    )!;

                    return (
                      <motion.line
                        key={`edge-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          stroke: edge.highlighted
                            ? "#6366f1"
                            : edge.visited
                            ? "#a5b4fc"
                            : "#64748b",
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        strokeWidth={edge.highlighted ? 3 : 2}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {graph.nodes.map((node) => (
                    <g key={`node-${node.id}`}>
                      <motion.circle
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          fill: node.highlighted
                            ? "#6366f1"
                            : node.visited
                            ? "#a5b4fc"
                            : "#f8fafc",
                          stroke: node.highlighted ? "#4f46e5" : "#64748b",
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        cx={node.x}
                        cy={node.y}
                        r={25}
                        strokeWidth={2}
                      />

                      <motion.text
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={14}
                        fontWeight="bold"
                        fill={node.highlighted ? "white" : "currentColor"}
                      >
                        {node.id}
                      </motion.text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
