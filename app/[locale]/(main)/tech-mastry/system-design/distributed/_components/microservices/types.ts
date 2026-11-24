// Types for the visualization components
export type Scenario = "normal" | "high-load" | "failure";

export type RequestStatus = "pending" | "processing" | "completed" | "failed";

export interface Request {
  id: number;
  type: "user" | "order" | "payment" | "inventory" | "notification";
  status: RequestStatus;
  position: { x: number; y: number };
  startTime: number;
  processingTime?: number;
  completionTime?: number;
  path: { x: number; y: number }[];
  currentPathIndex: number;
  speed: number;
}
