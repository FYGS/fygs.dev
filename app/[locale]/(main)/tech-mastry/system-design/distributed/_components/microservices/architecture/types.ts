export type ServiceStatus = "online" | "offline" | "overloaded";

export interface ServiceState {
  status: ServiceStatus;
  load: number;
}

export interface ServicesState {
  users: ServiceState;
  orders: ServiceState;
  payments: ServiceState;
  inventory: ServiceState;
  notifications: ServiceState;
}

export interface ArchitectureStats {
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}
