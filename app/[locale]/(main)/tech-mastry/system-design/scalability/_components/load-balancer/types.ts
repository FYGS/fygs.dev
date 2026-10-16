export type Algorithm = "round-robin" | "least-connections" | "ip-hash";

export interface Request {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  position: { x: number; y: number };
  targetServer?: number;
  startTime: number;
  processingTime?: number;
  completionTime?: number;
}

export interface Server {
  id: number;
  load: number;
  status: "online" | "offline" | "overloaded";
  position: { x: number; y: number };
  requests: number;
  failureChance: number;
}

export interface LoadBalancerState {
  algorithm: Algorithm;
  servers: Server[];
  requests: Request[];
  nextServerId: number;
  stats: {
    totalRequests: number;
    completedRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}
