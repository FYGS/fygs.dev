// Types for the visualization
export type ReplicationType = "master-slave" | "master-master" | "multi-master";
export type ConsistencyModel = "sync" | "async" | "semi-sync";
export type Operation = "read" | "write" | "sync" | "none";
export type NodeStatus = "active" | "syncing" | "down";

export interface DatabaseNode {
  id: string;
  type: "master" | "slave";
  status: NodeStatus;
  operations: Operation[];
  lastUpdated: number;
  position: { x: number; y: number };
}

export interface ReplicationLink {
  source: string;
  target: string;
  status: "active" | "syncing" | "down";
  lastSync: number;
}
