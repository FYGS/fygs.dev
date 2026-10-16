import type { EventBroker, Service } from "./types";

// Initial services of the simulated system
export const INITIAL_SERVICES: Service[] = [
  {
    type: "order",
    status: "online",
    position: { x: 100, y: 150 },
    events: 0,
    color: "#3b82f6", // blue
  },
  {
    type: "payment",
    status: "online",
    position: { x: 100, y: 250 },
    events: 0,
    color: "#f59e0b", // amber
  },
  {
    type: "inventory",
    status: "online",
    position: { x: 100, y: 350 },
    events: 0,
    color: "#8b5cf6", // purple
  },
  {
    type: "shipping",
    status: "online",
    position: { x: 700, y: 200 },
    events: 0,
    color: "#10b981", // green
  },
  {
    type: "notification",
    status: "online",
    position: { x: 700, y: 300 },
    events: 0,
    color: "#ec4899", // pink
  },
];

// Initial event broker
export const INITIAL_EVENT_BROKER: EventBroker = {
  position: { x: 400, y: 250 },
  events: 0,
  maxEvents: 20,
  type: "kafka",
  partitions: 3,
  topics: ["orders", "payments", "inventory", "shipping", "notifications"],
  deadLetterQueue: true,
  retryEnabled: true,
  maxRetries: 3,
};
