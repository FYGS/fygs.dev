import { motion } from "framer-motion";
import type { ReactElement } from "react";
import type { TreeNode } from "./types";

// Render a tree node and, recursively, its subtree
export const renderTreeNode = (
  node: TreeNode | null,
  centerX: number = 0,
  centerY: number = 0
): ReactElement | null => {
  if (!node) return null;

  const nodeSize = 40;
  const nodeX = centerX + node.x;
  const nodeY = centerY + node.y;

  return (
    <g key={`node-${node.value}`}>
      {/* Edges to children */}
      {node.left && (
        <motion.line
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          x1={nodeX}
          y1={nodeY}
          x2={centerX + node.left.x}
          y2={centerY + node.left.y}
          stroke={node.left.visited ? "#6366f1" : "#64748b"}
          strokeWidth={2.5}
          strokeOpacity={0.8}
        />
      )}
      {node.right && (
        <motion.line
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          x1={nodeX}
          y1={nodeY}
          x2={centerX + node.right.x}
          y2={centerY + node.right.y}
          stroke={node.right.visited ? "#6366f1" : "#64748b"}
          strokeWidth={2.5}
          strokeOpacity={0.8}
        />
      )}

      {/* Node circle */}
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
        transition={{ duration: 0.5, delay: 0.3 + node.y * 0.05 }}
        cx={nodeX}
        cy={nodeY}
        r={nodeSize / 2}
        strokeWidth={2.5}
      />

      {/* Node value */}
      <motion.text
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 + node.y * 0.05 }}
        x={nodeX}
        y={nodeY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight="bold"
        fill={node.highlighted ? "white" : "currentColor"}
      >
        {node.value}
      </motion.text>

      {/* Render children */}
      {renderTreeNode(node.left, centerX, centerY)}
      {renderTreeNode(node.right, centerX, centerY)}
    </g>
  );
};
