import type { ComponentType, DiagramComponent } from "./types";

interface Point {
  x: number;
  y: number;
}

interface CanvasRect {
  left: number;
  top: number;
}

// Zoom is kept between 50% and 200%
export const clampZoom = (zoom: number, delta: number) =>
  Math.min(Math.max(0.5, zoom + delta), 2);

// Offset between the pointer and the top-left corner of the grabbed component
export const getDragOffset = (
  pointer: Point,
  canvasRect: CanvasRect,
  component: Point,
  zoom: number,
  pan: Point
): Point => ({
  x: pointer.x - canvasRect.left - component.x * zoom - pan.x,
  y: pointer.y - canvasRect.top - component.y * zoom - pan.y,
});

// Canvas position of a component being dragged (never above/left of the origin)
export const getDraggedPosition = (
  pointer: Point,
  canvasRect: CanvasRect,
  dragOffset: Point,
  zoom: number,
  pan: Point
): Point => {
  const newX = (pointer.x - canvasRect.left - dragOffset.x - pan.x) / zoom;
  const newY = (pointer.y - canvasRect.top - dragOffset.y - pan.y) / zoom;
  return { x: Math.max(0, newX), y: Math.max(0, newY) };
};

// Build a new component of the given type, placed at a random position
export const createComponent = (
  type: ComponentType,
  existing: DiagramComponent[]
): DiagramComponent => ({
  id: `comp-${Date.now()}`,
  type,
  name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${existing.filter(c => c.type === type).length + 1}`,
  x: Math.random() * 600,
  y: Math.random() * 400,
  width: 120,
  height: 60,
  connections: [],
  visible: true,
  locked: false,
});

// Get color for component type
export const getComponentColor = (type: ComponentType) => {
  switch (type) {
    case "database":
      return "bg-blue-500/10 border-blue-500/30 text-blue-500";
    case "server":
      return "bg-purple-500/10 border-purple-500/30 text-purple-500";
    case "client":
      return "bg-green-500/10 border-green-500/30 text-green-500";
    case "api":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
    case "cache":
      return "bg-red-500/10 border-red-500/30 text-red-500";
    case "loadBalancer":
      return "bg-orange-500/10 border-orange-500/30 text-orange-500";
    case "cdn":
      return "bg-indigo-500/10 border-indigo-500/30 text-indigo-500";
    case "queue":
      return "bg-pink-500/10 border-pink-500/30 text-pink-500";
    case "messageBroker":
      return "bg-cyan-500/10 border-cyan-500/30 text-cyan-500";
    case "microservice":
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
    default:
      return "bg-gray-500/10 border-gray-500/30 text-gray-500";
  }
};
