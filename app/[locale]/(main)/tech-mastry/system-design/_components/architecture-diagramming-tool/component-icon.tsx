import {
  Activity,
  Cloud,
  Database,
  GitBranch,
  Globe,
  HardDrive,
  MessageSquare,
  Monitor,
  Network,
  Server,
} from "lucide-react";
import type { ComponentType } from "./types";

// Get icon for component type
export const getComponentIcon = (type: ComponentType) => {
  switch (type) {
    case "database":
      return <Database className="h-6 w-6" />;
    case "server":
      return <Server className="h-6 w-6" />;
    case "client":
      return <Monitor className="h-6 w-6" />;
    case "api":
      return <Globe className="h-6 w-6" />;
    case "cache":
      return <HardDrive className="h-6 w-6" />;
    case "loadBalancer":
      return <Activity className="h-6 w-6" />;
    case "cdn":
      return <Cloud className="h-6 w-6" />;
    case "queue":
      return <MessageSquare className="h-6 w-6" />;
    case "messageBroker":
      return <Network className="h-6 w-6" />;
    case "microservice":
      return <GitBranch className="h-6 w-6" />;
    default:
      return <Server className="h-6 w-6" />;
  }
};
