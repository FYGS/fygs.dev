import { getLinkGeometry, getLinkStyle } from "./lib";
import type { DatabaseNode, ReplicationLink } from "./types";

interface ReplicationLinkPathProps {
  link: ReplicationLink;
  sourceNode: DatabaseNode;
  targetNode: DatabaseNode;
}

export function ReplicationLinkPath({
  link,
  sourceNode,
  targetNode,
}: ReplicationLinkPathProps) {
  const { startX, startY, endX, endY, controlX, controlY } = getLinkGeometry(
    sourceNode,
    targetNode
  );
  const { strokeColor, strokeWidth } = getLinkStyle(link.status);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <path
        d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
        fill="none"
        className={`${strokeColor} ${strokeWidth}`}
        strokeDasharray={
          link.status === "down" ? "5,5" : "none"
        }
        markerEnd={
          link.status !== "down" ? "url(#arrowhead)" : ""
        }
      />

      {/* Animated circle for syncing status */}
      {link.status === "syncing" && (
        <circle
          cx="0"
          cy="0"
          r="4"
          fill="#3b82f6"
          className="animate-pulse"
        >
          <animateMotion
            dur="1s"
            repeatCount="indefinite"
            path={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
          />
        </circle>
      )}
    </svg>
  );
}
