import { getServiceByType } from "./broker-helpers";
import { generateEventPayload } from "./event-payload";
import type {
  Event,
  EventBroker,
  EventType,
  Service,
  ServiceType,
} from "./types";

export type EventScenario = "normal" | "high-load" | "failure";

// Get event interval based on scenario
export function getEventInterval(scenario: EventScenario): number {
  switch (scenario) {
    case "normal":
      return 1000; // 1 event per second
    case "high-load":
      return 300; // ~3 events per second
    case "failure":
      return 800; // ~1.25 events per second
    default:
      return 1000;
  }
}

// Randomly select an event type and producer service
export function pickEventAndProducer(): {
  eventType: EventType;
  producerType: ServiceType;
} {
const eventTypes: EventType[] = [
  "order_placed",
  "payment_processed",
  "inventory_updated",
  "shipment_created",
  "notification_sent",
];
const producerTypes: ServiceType[] = ["order", "payment", "inventory"];

const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
const producerType =
  producerTypes[Math.floor(Math.random() * producerTypes.length)];

  return { eventType, producerType };
}

// Determine consumer services based on event type
export function getConsumerServices(eventType: EventType): ServiceType[] {
let consumerServices: ServiceType[] = [];

switch (eventType) {
  case "order_placed":
    consumerServices = ["payment", "inventory"];
    break;
  case "payment_processed":
    consumerServices = ["shipping", "notification"];
    break;
  case "inventory_updated":
    consumerServices = ["shipping"];
    break;
  case "shipment_created":
    consumerServices = ["notification"];
    break;
  case "notification_sent":
    consumerServices = [];
    break;
}

  return consumerServices;
}

interface CreateEventParams {
  id: number;
  eventType: EventType;
  producer: Service;
  producerType: ServiceType;
  consumerServices: ServiceType[];
  services: Service[];
  eventBroker: EventBroker;
  scenario: EventScenario;
}

// Build a new event travelling producer -> broker -> consumers
export function createEvent({
  id,
  eventType,
  producer,
  producerType,
  consumerServices,
  services,
  eventBroker,
  scenario,
}: CreateEventParams): Event {
const path: { x: number; y: number }[] = [];

// Start at the producer service
path.push({ ...producer.position });

// Go to the event broker
path.push({ ...eventBroker.position });

// Then to each consumer service
for (const consumerType of consumerServices) {
  const consumer = getServiceByType(consumerType, services);
  if (consumer) {
    path.push({ ...consumer.position });
    path.push({ ...eventBroker.position }); // Return to broker after each consumer
  }
}

// Generate event payload based on event type
const payload = generateEventPayload(eventType, producerType);

// Determine event topic based on event type
const topic = eventType.split("_")[0];

// Generate a correlation ID (simulated UUID)
const correlationId = `${Date.now()}-${Math.floor(
  Math.random() * 1000000
)}`;

// Determine event priority (random for demo purposes)
const priorities: Array<"low" | "medium" | "high"> = [
  "low",
  "medium",
  "high",
];
const priority = priorities[Math.floor(Math.random() * priorities.length)];

// Simulate event size based on payload complexity
const size = Math.floor(100 + Math.random() * 900); // 100-1000 bytes

// Create the new event
const newEvent: Event = {
  id,
  type: eventType,
  status: "created",
  position: { ...path[0] },
  createdAt: Date.now(),
  path,
  currentPathIndex: 0,
  speed: scenario === "high-load" ? 1.5 : 1,
  producerService: producerType,
  consumerServices,
  currentConsumerIndex: 0,
  // New fields
  payload,
  correlationId,
  priority,
  size,
  topic,
  retryCount: 0,
};

  return newEvent;
}
