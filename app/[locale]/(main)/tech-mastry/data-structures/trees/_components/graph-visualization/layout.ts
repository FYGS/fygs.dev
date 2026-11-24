import type { Graph, GraphNode } from "./types";

// Calculate positions for graph visualization using optimized force-directed layout
export const calculatePositions = (graph: Graph): Graph => {
  // Create a deep clone to avoid mutating the original
  const nodes = [...graph.nodes.map((node) => ({ ...node }))];
  const edges = [...graph.edges.map((edge) => ({ ...edge }))];

  // Create a node lookup map for faster edge processing
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  // Set initial positions in a circle
  const radius = 150;
  const centerX = 0;
  const centerY = 0;

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });

  // Optimized force-directed layout simulation
  const iterations = 50;
  const repulsionForce = 5000;
  const attractionForce = 0.05;
  const dampingFactor = 0.95; // Add damping to improve stability

  // Pre-calculate edge connections for faster lookup
  const edgeConnections = edges.map((edge) => ({
    source: nodeMap.get(edge.source)!,
    target: nodeMap.get(edge.target)!,
    edge,
  }));

  for (let iter = 0; iter < iterations; iter++) {
    // Calculate repulsion forces between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared) || 1;

        // Apply inverse square law with minimum distance to prevent extreme forces
        const force = repulsionForce / Math.max(distanceSquared, 10);

        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;

        nodes[i].x -= forceX;
        nodes[i].y -= forceY;
        nodes[j].x += forceX;
        nodes[j].y += forceY;
      }
    }

    // Calculate attraction forces along edges using the pre-calculated connections
    for (const { source, target } of edgeConnections) {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      // Apply Hooke's law with optimal distance
      const optimalDistance = 100;
      const force = (distance - optimalDistance) * attractionForce;

      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      source.x += forceX * dampingFactor;
      source.y += forceY * dampingFactor;
      target.x -= forceX * dampingFactor;
      target.y -= forceY * dampingFactor;
    }
  }

  return { nodes, edges };
};
