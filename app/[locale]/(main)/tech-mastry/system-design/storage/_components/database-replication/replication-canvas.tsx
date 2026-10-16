"use client";

import { Legend } from "./legend";
import { ReplicationLinkPath } from "./replication-link-path";
import { ReplicationNode } from "./replication-node";
import type { DatabaseNode, ReplicationLink } from "./types";

interface ReplicationCanvasProps {
  nodes: DatabaseNode[];
  links: ReplicationLink[];
  handleNodeFailure: (nodeId: string) => void;
}

export function ReplicationCanvas({
  nodes,
  links,
  handleNodeFailure,
}: ReplicationCanvasProps) {
  return (
    <div className="relative w-full h-[400px] border rounded-lg bg-background/50 overflow-auto">
      <div className="p-4 h-full flex flex-col">
        {/* Replication Visualization */}
        <div className="relative h-full">
          {/* Render links first so they appear behind nodes */}
          {links.map((link, index) => {
            const sourceNode = nodes.find((n) => n.id === link.source);
            const targetNode = nodes.find((n) => n.id === link.target);

            if (!sourceNode || !targetNode) return null;

            return (
              <ReplicationLinkPath
                key={`link-${index}`}
                link={link}
                sourceNode={sourceNode}
                targetNode={targetNode}
              />
            );
          })}

          {/* SVG Definitions */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  className="fill-slate-500"
                />
              </marker>
            </defs>
          </svg>

          {/* Render nodes */}
          {nodes.map((node) => (
            <ReplicationNode
              key={node.id}
              node={node}
              handleNodeFailure={handleNodeFailure}
            />
          ))}

          {/* Legend */}
          <Legend />
        </div>
      </div>
    </div>
  );
}
