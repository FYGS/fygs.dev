// Types for the visualization
export type EventType =
  | "order_placed"
  | "payment_processed"
  | "inventory_updated"
  | "shipment_created"
  | "notification_sent";

export type ServiceType =
  | "order"
  | "payment"
  | "inventory"
  | "shipping"
  | "notification"
  | "analytics";

export type EventStatus =
  | "created"
  | "published"
  | "processing"
  | "processed"
  | "failed";

export interface Event {
  id: number;
  type: EventType;
  status: EventStatus;
  position: { x: number; y: number };
  createdAt: number;
  processedAt?: number;
  path: { x: number; y: number }[];
  currentPathIndex: number;
  speed: number;
  producerService: ServiceType;
  consumerServices: ServiceType[];
  currentConsumerIndex: number;
  // New fields for enhanced event information
  payload: { [key: string]: unknown }; // Event data
  correlationId?: string; // For tracking related events
  priority: "low" | "medium" | "high"; // Event priority
  size: number; // Size in bytes (simulated)
  topic?: string; // For pub/sub pattern
  retryCount: number; // Number of retry attempts
}

export interface Service {
  type: ServiceType;
  status: "online" | "offline" | "overloaded";
  position: { x: number; y: number };
  events: number;
  color: string;
}

export type BrokerType = "kafka" | "rabbitmq" | "nats" | "activemq" | "redis";

export interface EventBroker {
  position: { x: number; y: number };
  events: number;
  maxEvents: number;
  type: BrokerType;
  // Broker-specific properties
  partitions?: number; // For Kafka
  topics: string[];
  queues?: string[]; // For RabbitMQ
  exchanges?: string[]; // For RabbitMQ
  channels?: number; // For NATS
  deadLetterQueue: boolean;
  retryEnabled: boolean;
  maxRetries: number;
}

export interface Stats {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
}
