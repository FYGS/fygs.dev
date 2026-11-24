import type {
  DatabaseNode,
  ReplicationLink,
  ReplicationType,
} from "./types";

// Create nodes and links based on replication type
export function createTopology(replicationType: ReplicationType) {
  const newNodes: DatabaseNode[] = [];
  const newLinks: ReplicationLink[] = [];

  if (replicationType === "master-slave") {
    // Master node
    newNodes.push({
      id: "master",
      type: "master",
      status: "active",
      operations: [],
      lastUpdated: Date.now(),
      position: { x: 400, y: 100 },
    });

    // Slave nodes
    for (let i = 0; i < 3; i++) {
      newNodes.push({
        id: `slave-${i}`,
        type: "slave",
        status: "active",
        operations: [],
        lastUpdated: Date.now(),
        position: {
          x: 200 + i * 200,
          y: 250,
        },
      });

      // Link from master to slave
      newLinks.push({
        source: "master",
        target: `slave-${i}`,
        status: "active",
        lastSync: Date.now(),
      });
    }
  } else if (replicationType === "master-master") {
    // Two master nodes
    for (let i = 0; i < 2; i++) {
      newNodes.push({
        id: `master-${i}`,
        type: "master",
        status: "active",
        operations: [],
        lastUpdated: Date.now(),
        position: {
          x: 250 + i * 300,
          y: 150,
        },
      });
    }

    // Bi-directional links between masters
    newLinks.push({
      source: "master-0",
      target: "master-1",
      status: "active",
      lastSync: Date.now(),
    });

    newLinks.push({
      source: "master-1",
      target: "master-0",
      status: "active",
      lastSync: Date.now(),
    });
  } else if (replicationType === "multi-master") {
    // Multiple master nodes in a ring
    const nodeCount = 4;
    const centerX = 400;
    const centerY = 200;
    const radius = 150;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      newNodes.push({
        id: `master-${i}`,
        type: "master",
        status: "active",
        operations: [],
        lastUpdated: Date.now(),
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        },
      });
    }

    // Create links in a ring topology
    for (let i = 0; i < nodeCount; i++) {
      const nextNode = (i + 1) % nodeCount;
      newLinks.push({
        source: `master-${i}`,
        target: `master-${nextNode}`,
        status: "active",
        lastSync: Date.now(),
      });
    }
  }

  return { nodes: newNodes, links: newLinks };
}

export const getLinkGeometry = (
  sourceNode: DatabaseNode,
  targetNode: DatabaseNode
) => {
  // Calculate the path for the link
  const startX = sourceNode.position.x;
  const startY = sourceNode.position.y;
  const endX = targetNode.position.x;
  const endY = targetNode.position.y;

  // Calculate control points for curved lines
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const dx = endX - startX;
  const dy = endY - startY;
  const normalX = (-dy / Math.sqrt(dx * dx + dy * dy)) * 30;
  const normalY = (dx / Math.sqrt(dx * dx + dy * dy)) * 30;

  // Adjust control point for multi-master to avoid overlapping curves
  const controlX = midX + normalX;
  const controlY = midY + normalY;

  return { startX, startY, endX, endY, controlX, controlY };
};

// Determine link color based on status
export const getLinkStyle = (status: ReplicationLink["status"]) => {
  let strokeColor = "stroke-slate-600";
  let strokeWidth = "stroke-[2px]";

  if (status === "syncing") {
    strokeColor = "stroke-blue-500";
    strokeWidth = "stroke-[3px]";
  } else if (status === "down") {
    strokeColor = "stroke-red-500";
    strokeWidth = "stroke-[2px]";
  }

  return { strokeColor, strokeWidth };
};

// Determine node color based on type and status
export const getNodeColors = (node: DatabaseNode) => {
  let bgColor = "bg-blue-900/30";
  let borderColor = "border-blue-800";
  let textColor = "text-blue-300";

  if (node.type === "master") {
    bgColor = "bg-indigo-900/30";
    borderColor = "border-indigo-800";
    textColor = "text-indigo-300";
  }

  if (node.status === "down") {
    bgColor = "bg-red-900/30";
    borderColor = "border-red-800";
    textColor = "text-red-300";
  }

  return { bgColor, borderColor, textColor };
};
