import { Database, FileEdit, RotateCw } from "lucide-react";
import { getNodeColors } from "./lib";
import type { DatabaseNode } from "./types";

interface ReplicationNodeProps {
  node: DatabaseNode;
  handleNodeFailure: (nodeId: string) => void;
}

export function ReplicationNode({
  node,
  handleNodeFailure,
}: ReplicationNodeProps) {
  const { bgColor, borderColor, textColor } = getNodeColors(node);

  return (
    <div
      className={`absolute w-32 h-32 ${bgColor} rounded-full border-2 ${borderColor} flex flex-col items-center justify-center cursor-pointer transition-all duration-300`}
      style={{
        left: node.position.x - 64,
        top: node.position.y - 64,
        transform:
          node.status === "down" ? "scale(0.9)" : "scale(1)",
        opacity: node.status === "down" ? 0.7 : 1,
      }}
      onClick={() => handleNodeFailure(node.id)}
    >
      <Database className={`h-8 w-8 ${textColor} mb-1`} />
      <div className={`text-xs font-medium ${textColor}`}>
        {node.type === "master" ? "Master" : "Slave"}
      </div>
      <div className="text-xs text-muted-foreground">
        {node.id}
      </div>

      {/* Operation indicators */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {node.operations.includes("write") && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
            <FileEdit className="w-3 h-3 text-white" />
          </div>
        )}
        {node.operations.includes("read") && (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 12h20M2 18h20" />
            </svg>
          </div>
        )}
        {node.operations.includes("sync") && (
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
            <RotateCw className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        {node.status === "active" && (
          <div className="px-2 py-0.5 bg-green-900/30 border border-green-800 rounded-full">
            <span className="text-[10px] text-green-300 font-medium">
              Active
            </span>
          </div>
        )}
        {node.status === "syncing" && (
          <div className="px-2 py-0.5 bg-amber-900/30 border border-amber-800 rounded-full">
            <span className="text-[10px] text-amber-300 font-medium">
              Syncing
            </span>
          </div>
        )}
        {node.status === "down" && (
          <div className="px-2 py-0.5 bg-red-900/30 border border-red-800 rounded-full">
            <span className="text-[10px] text-red-300 font-medium">
              Down
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
