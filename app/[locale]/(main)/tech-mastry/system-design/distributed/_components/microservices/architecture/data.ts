import type { ArchitectureStats, ServicesState } from "./types";

export const INITIAL_SERVICES: ServicesState = {
  users: { status: "online", load: 0 },
  orders: { status: "online", load: 0 },
  payments: { status: "online", load: 0 },
  inventory: { status: "online", load: 0 },
  notifications: { status: "online", load: 0 },
};

export const INITIAL_STATS: ArchitectureStats = {
  totalRequests: 0,
  completedRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
};
