import type { Graph } from "./types";

// Create a sample graph
export const createSampleGraph = (): Graph => {
  return {
    nodes: [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 0, y: 0 },
      { id: "C", x: 0, y: 0 },
      { id: "D", x: 0, y: 0 },
      { id: "E", x: 0, y: 0 },
      { id: "F", x: 0, y: 0 },
      { id: "G", x: 0, y: 0 },
    ],
    edges: [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "A", target: "E" },
      { source: "B", target: "D" },
      { source: "C", target: "F" },
      { source: "E", target: "F" },
      { source: "F", target: "G" },
    ],
  };
};
