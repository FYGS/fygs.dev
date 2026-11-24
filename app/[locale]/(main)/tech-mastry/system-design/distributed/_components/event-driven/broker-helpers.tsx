import { Activity } from "lucide-react";
import type { BrokerType, Service, ServiceType } from "./types";

// Helper function to get a service by type
export const getServiceByType = (
  type: ServiceType,
  services: Service[]
): Service | undefined => {
  return services.find((service) => service.type === type);
};

// Helper function to get broker color based on type
export const getBrokerColor = (type: BrokerType): string => {
  switch (type) {
    case "kafka":
      return "#6366f1"; // indigo
    case "rabbitmq":
      return "#ec4899"; // pink
    case "nats":
      return "#0ea5e9"; // sky blue
    case "activemq":
      return "#84cc16"; // lime
    case "redis":
      return "#ef4444"; // red
    default:
      return "#6366f1"; // indigo
  }
};

// Helper function to get broker name based on type
export const getBrokerName = (type: BrokerType): string => {
  switch (type) {
    case "kafka":
      return "Apache Kafka";
    case "rabbitmq":
      return "RabbitMQ";
    case "nats":
      return "NATS";
    case "activemq":
      return "ActiveMQ";
    case "redis":
      return "Redis Pub/Sub";
    default:
      return "Event Broker";
  }
};

// Helper function to render broker icon based on type
export const renderBrokerIcon = (type: BrokerType) => {
  switch (type) {
    case "kafka":
      return <Activity className="w-10 h-10 text-indigo-500" />;
    case "rabbitmq":
      return <Activity className="w-10 h-10 text-pink-500" />;
    case "nats":
      return <Activity className="w-10 h-10 text-sky-500" />;
    case "activemq":
      return <Activity className="w-10 h-10 text-lime-500" />;
    case "redis":
      return <Activity className="w-10 h-10 text-red-500" />;
    default:
      return <Activity className="w-10 h-10 text-indigo-500" />;
  }
};
