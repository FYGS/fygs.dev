import type { Request } from "../types";
import type { ServiceStatus } from "./types";

// Get color for a request based on its type and status
export const getRequestColor = (request: Request): string => {
  if (request.status === "failed") return "#ef4444";

  switch (request.type) {
    case "user":
      return "#3b82f6";
    case "order":
      return "#10b981";
    case "payment":
      return "#f59e0b";
    case "inventory":
      return "#8b5cf6";
    case "notification":
      return "#ec4899";
    default:
      return "#6b7280";
  }
};

// Get color for a service based on its status
export const getServiceColor = (
  status: ServiceStatus
): { bg: string; border: string; text: string } => {
  switch (status) {
    case "online":
      return { bg: "#f1f5f9", border: "#94a3b8", text: "#1e293b" };
    case "offline":
      return { bg: "#fee2e2", border: "#ef4444", text: "#ef4444" };
    case "overloaded":
      return { bg: "#fef3c7", border: "#f59e0b", text: "#f59e0b" };
    default:
      return { bg: "#f1f5f9", border: "#94a3b8", text: "#1e293b" };
  }
};
