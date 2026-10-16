export type ComponentType =
  | "database"
  | "server"
  | "client"
  | "api"
  | "cache"
  | "loadBalancer"
  | "cdn"
  | "queue"
  | "messageBroker"
  | "microservice";

export interface DiagramComponent {
  id: string;
  type: ComponentType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[]; // IDs of connected components
  visible: boolean;
  locked: boolean;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: "direct" | "bidirectional" | "message";
  visible: boolean;
}

export interface SystemDesignTemplate {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  components: DiagramComponent[];
  connections: Connection[];
}
