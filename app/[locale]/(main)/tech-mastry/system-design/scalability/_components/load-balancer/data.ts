import type { LoadBalancerState } from "./types";

// Initial state
export const initialState: LoadBalancerState = {
  algorithm: "round-robin",
  servers: [
    {
      id: 1,
      load: 0,
      status: "online",
      position: { x: 0, y: 0 },
      requests: 0,
      failureChance: 0.05,
    },
    {
      id: 2,
      load: 0,
      status: "online",
      position: { x: 0, y: 0 },
      requests: 0,
      failureChance: 0.05,
    },
    {
      id: 3,
      load: 0,
      status: "online",
      position: { x: 0, y: 0 },
      requests: 0,
      failureChance: 0.05,
    },
  ],
  requests: [],
  nextServerId: 1,
  stats: {
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  },
};
