"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Bell,
  CreditCard,
  MessageSquare,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for the visualization
type EventType =
  | "order_placed"
  | "payment_processed"
  | "inventory_updated"
  | "shipment_created"
  | "notification_sent";
type ServiceType =
  | "order"
  | "payment"
  | "inventory"
  | "shipping"
  | "notification"
  | "analytics";
type EventStatus =
  | "created"
  | "published"
  | "processing"
  | "processed"
  | "failed";

interface Event {
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

interface Service {
  type: ServiceType;
  status: "online" | "offline" | "overloaded";
  position: { x: number; y: number };
  events: number;
  color: string;
}

type BrokerType = "kafka" | "rabbitmq" | "nats" | "activemq" | "redis";

interface EventBroker {
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

interface Stats {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  averageProcessingTime: number;
}

export function EventDrivenVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");

  // Initialize services
  const [services, setServices] = useState<Service[]>([
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
  ]);

  // Initialize event broker
  const [eventBroker, setEventBroker] = useState<EventBroker>({
    position: { x: 400, y: 250 },
    events: 0,
    maxEvents: 20,
    type: "kafka",
    partitions: 3,
    topics: ["orders", "payments", "inventory", "shipping", "notifications"],
    deadLetterQueue: true,
    retryEnabled: true,
    maxRetries: 3,
  });

  // State for selected broker type
  const [, setSelectedBrokerType] = useState<BrokerType>("kafka");

  // Initialize events
  const [events, setEvents] = useState<Event[]>([]);

  // Initialize stats
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    processedEvents: 0,
    failedEvents: 0,
    averageProcessingTime: 0,
  });

  // Refs for animation
  const eventIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastEventTimeRef = useRef(0);
  const processingTimesRef = useRef<number[]>([]);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<"normal" | "high-load" | "failure">(
    "normal"
  );

  // Helper function to get a service by type
  const getServiceByType = (
    type: ServiceType,
    services: Service[]
  ): Service | undefined => {
    return services.find((service) => service.type === type);
  };

  // Helper function to get broker color based on type
  const getBrokerColor = (type: BrokerType): string => {
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
  const getBrokerName = (type: BrokerType): string => {
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
  const renderBrokerIcon = (type: BrokerType) => {
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

  // Wrap functions in useCallback to prevent recreation on every render
  const generateEvent = useCallback(() => {
    // Randomly select an event type and producer service
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

    // Determine consumer services based on event type
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

    // Get producer service position
    const producer = getServiceByType(producerType, services);
    if (!producer) return;

    // Create path for the event
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
      id: eventIdRef.current++,
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

    // Add the event to the list
    setEvents((prev) => [...prev, newEvent]);

    // Update producer service events count
    setServices((prev) =>
      prev.map((service) =>
        service.type === producerType
          ? { ...service, events: service.events + 1 }
          : service
      )
    );

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalEvents: prev.totalEvents + 1,
    }));
  }, [services, eventBroker, scenario]);

  // Process existing events
  const processEvents = useCallback(
    (timestamp: number) => {
      setEvents((prev) => {
        // Process each event
        const updatedEvents = prev.map((event) => {
          // Get the current service if at a service point
          let currentService: Service | undefined;
          if (
            event.currentPathIndex > 0 &&
            event.currentPathIndex < event.path.length
          ) {
            const currentPosition = event.path[event.currentPathIndex];

            // Check if at broker position
            if (
              currentPosition.x === eventBroker.position.x &&
              currentPosition.y === eventBroker.position.y
            ) {
              // At broker
            } else {
              // At a service, find which one
              currentService = services.find(
                (service) =>
                  service.position.x === currentPosition.x &&
                  service.position.y === currentPosition.y
              );
            }
          }

          // If at a service that's offline, mark event as failed
          if (
            currentService &&
            currentService.status === "offline" &&
            event.status !== "failed"
          ) {
            return {
              ...event,
              status: "failed" as EventStatus,
              processedAt: timestamp,
            };
          }

          // Move the event along its path
          if (event.currentPathIndex < event.path.length - 1) {
            // We don't need to use currentPoint, so we can remove it
            const nextPoint = event.path[event.currentPathIndex + 1];

            // Calculate direction and distance
            const dx = nextPoint.x - event.position.x;
            const dy = nextPoint.y - event.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If we've reached the next point (or close enough)
            if (distance < 5) {
              // Move to the next point in the path
              const newIndex = event.currentPathIndex + 1;

              // Update status based on position in the path
              let newStatus = event.status;
              let newConsumerIndex = event.currentConsumerIndex;

              // If we've reached the broker for the first time
              if (newIndex === 1) {
                newStatus = "published";

                // Update broker events count
                setEventBroker((prev) => ({
                  ...prev,
                  events: prev.events + 1,
                }));

                // Apply event transformation based on broker type
                if (eventBroker.type === "kafka") {
                  // Add Kafka-specific metadata
                  const partition = Math.floor(
                    Math.random() * (eventBroker.partitions || 3)
                  );
                  event.payload = {
                    ...event.payload,
                    _metadata: {
                      broker: "kafka",
                      partition,
                      offset: Math.floor(Math.random() * 10000),
                      timestamp: Date.now(),
                    },
                  };
                } else if (eventBroker.type === "rabbitmq") {
                  // Add RabbitMQ-specific metadata
                  const exchange =
                    eventBroker.exchanges?.[
                      Math.floor(
                        Math.random() * (eventBroker.exchanges?.length || 1)
                      )
                    ];
                  event.payload = {
                    ...event.payload,
                    _metadata: {
                      broker: "rabbitmq",
                      exchange,
                      routingKey: event.topic,
                      timestamp: Date.now(),
                    },
                  };
                }

                // Check if broker is overloaded
                if (
                  eventBroker.events >= eventBroker.maxEvents &&
                  Math.random() > 0.7
                ) {
                  // If retry is enabled and under max retries, retry the event
                  if (
                    eventBroker.retryEnabled &&
                    event.retryCount < eventBroker.maxRetries
                  ) {
                    return {
                      ...event,
                      status: "published" as EventStatus,
                      retryCount: event.retryCount + 1,
                      // Slow down retried events
                      speed: event.speed * 0.8,
                    };
                  }

                  // If dead letter queue is enabled, route to DLQ
                  if (eventBroker.deadLetterQueue) {
                    // Update event status to indicate it's in the DLQ
                    return {
                      ...event,
                      status: "failed" as EventStatus,
                      processedAt: timestamp,
                      // Add a note that it went to DLQ
                      payload: {
                        ...event.payload,
                        _dlq: true,
                        _error: "Broker overloaded",
                      },
                    };
                  }
                }
              }
              // If we've reached a consumer service
              else if (
                newIndex > 1 &&
                newIndex < event.path.length &&
                event.path[newIndex].x !== eventBroker.position.x
              ) {
                newStatus = "processing";

                // Find which consumer we're at
                const consumerService = services.find(
                  (service) =>
                    service.position.x === event.path[newIndex].x &&
                    service.position.y === event.path[newIndex].y
                );

                if (consumerService) {
                  // Update consumer service events count
                  setServices((prev) =>
                    prev.map((service) =>
                      service.type === consumerService.type
                        ? { ...service, events: service.events + 1 }
                        : service
                    )
                  );
                }
              }
              // If we've returned to the broker after visiting a consumer
              else if (
                newIndex > 1 &&
                newIndex < event.path.length &&
                event.path[newIndex].x === eventBroker.position.x &&
                event.currentConsumerIndex < event.consumerServices.length
              ) {
                // Move to the next consumer
                newConsumerIndex = event.currentConsumerIndex + 1;

                // If we've processed all consumers, mark as processed
                if (newConsumerIndex >= event.consumerServices.length) {
                  newStatus = "processed";

                  // Update broker events count
                  setEventBroker((prev) => ({
                    ...prev,
                    events: Math.max(0, prev.events - 1),
                  }));

                  // Update stats
                  setStats((prev) => ({
                    ...prev,
                    processedEvents: prev.processedEvents + 1,
                  }));

                  // Record processing time
                  processingTimesRef.current.push(timestamp - event.createdAt);

                  // Calculate average processing time
                  if (processingTimesRef.current.length > 0) {
                    const avgTime =
                      processingTimesRef.current.reduce(
                        (sum, time) => sum + time,
                        0
                      ) / processingTimesRef.current.length;
                    setStats((prev) => ({
                      ...prev,
                      averageProcessingTime: Math.round(avgTime),
                    }));
                  }
                }
              }

              return {
                ...event,
                position: { ...nextPoint },
                currentPathIndex: newIndex,
                status: newStatus as EventStatus,
                currentConsumerIndex: newConsumerIndex,
                processedAt:
                  newStatus === "processed" || newStatus === "failed"
                    ? timestamp
                    : event.processedAt,
              };
            }

            // Otherwise, move towards the next point
            const speed =
              event.speed * (currentService?.status === "overloaded" ? 0.5 : 1); // Slow down if service is overloaded
            const step = speed * 2; // Pixels per frame
            const moveRatio = step / distance;

            return {
              ...event,
              position: {
                x: event.position.x + dx * moveRatio,
                y: event.position.y + dy * moveRatio,
              },
            };
          }

          return event;
        });

        // Check for newly failed events
        const newFailedEvents = updatedEvents.filter(
          (e) =>
            e.status === "failed" &&
            !prev.find((p) => p.id === e.id && p.status === "failed")
        );

        // Update stats for failed events
        if (newFailedEvents.length > 0) {
          setStats((prev) => ({
            ...prev,
            failedEvents: prev.failedEvents + newFailedEvents.length,
          }));

          // Update broker events count
          setEventBroker((prev) => ({
            ...prev,
            events: Math.max(0, prev.events - newFailedEvents.length),
          }));
        }

        // Remove processed or failed events after they've been displayed for a while
        return updatedEvents.filter((e) => {
          if (e.status === "processed" || e.status === "failed") {
            return timestamp - (e.processedAt || 0) < 2000; // Keep for 2 seconds
          }
          return true;
        });
      });
    },
    [services, eventBroker]
  );

  // Animation logic
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Define this function inside the useEffect to avoid dependency issues
    const getIntervalForAnimation = (): number => {
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
    };

    const animate = (timestamp: number) => {
      // Generate new events based on scenario
      if (timestamp - lastEventTimeRef.current > getIntervalForAnimation()) {
        generateEvent();
        lastEventTimeRef.current = timestamp;
      }

      // Process existing events
      processEvents(timestamp);

      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Clean up on unmount or when isRunning changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, scenario, generateEvent, processEvents]);

  // Update service status based on scenario
  useEffect(() => {
    if (scenario === "high-load") {
      const timer = setTimeout(() => {
        setServices((prev) =>
          prev.map((service) =>
            service.type === "order"
              ? { ...service, status: "overloaded" }
              : service
          )
        );
      }, 3000);
      return () => clearTimeout(timer);
    } else if (scenario === "failure") {
      const timer = setTimeout(() => {
        setServices((prev) =>
          prev.map((service) =>
            service.type === "payment"
              ? { ...service, status: "offline" }
              : service
          )
        );
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Reset all services to online
      setServices((prev) =>
        prev.map((service) => ({ ...service, status: "online" }))
      );
    }
  }, [scenario]);

  // Helper function to generate event payload based on event type
  const generateEventPayload = (
    eventType: EventType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _producerType: ServiceType // Prefix with underscore to indicate it's not used
  ): { [key: string]: unknown } => {
    switch (eventType) {
      case "order_placed":
        return {
          orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
          customerId: `CUST-${Math.floor(Math.random() * 5000)}`,
          items: Array(Math.floor(Math.random() * 5) + 1)
            .fill(0)
            .map(() => ({
              productId: `PROD-${Math.floor(Math.random() * 1000)}`,
              quantity: Math.floor(Math.random() * 5) + 1,
              price: Math.floor(Math.random() * 10000) / 100,
            })),
          totalAmount: Math.floor(Math.random() * 100000) / 100,
          timestamp: new Date().toISOString(),
        };
      case "payment_processed":
        return {
          paymentId: `PAY-${Math.floor(Math.random() * 10000)}`,
          orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
          amount: Math.floor(Math.random() * 100000) / 100,
          method: ["credit_card", "paypal", "bank_transfer"][
            Math.floor(Math.random() * 3)
          ],
          status: "success",
          timestamp: new Date().toISOString(),
        };
      case "inventory_updated":
        return {
          inventoryId: `INV-${Math.floor(Math.random() * 10000)}`,
          productId: `PROD-${Math.floor(Math.random() * 1000)}`,
          quantityChanged: Math.floor(Math.random() * 10) - 5,
          newQuantity: Math.floor(Math.random() * 100),
          warehouseId: `WH-${Math.floor(Math.random() * 10)}`,
          timestamp: new Date().toISOString(),
        };
      case "shipment_created":
        return {
          shipmentId: `SHIP-${Math.floor(Math.random() * 10000)}`,
          orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
          carrier: ["DHL", "FedEx", "UPS"][Math.floor(Math.random() * 3)],
          trackingNumber: `TRK-${Math.floor(Math.random() * 1000000)}`,
          estimatedDelivery: new Date(
            Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          timestamp: new Date().toISOString(),
        };
      case "notification_sent":
        return {
          notificationId: `NOTIF-${Math.floor(Math.random() * 10000)}`,
          recipientId: `CUST-${Math.floor(Math.random() * 5000)}`,
          channel: ["email", "sms", "push"][Math.floor(Math.random() * 3)],
          subject: [
            "Order Confirmation",
            "Shipment Update",
            "Payment Received",
          ][Math.floor(Math.random() * 3)],
          status: "sent",
          timestamp: new Date().toISOString(),
        };
      default:
        return {
          id: `EVENT-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString(),
        };
    }
  };

  // This function is now defined as a useCallback above

  // This function is now defined as a useCallback above

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Architecture Event-Driven
        </CardTitle>
        <CardDescription>
          Découvrez comment les systèmes basés sur les événements permettent un
          découplage et une scalabilité améliorés
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Visualization Canvas */}
            <div className="relative w-full h-[500px] border rounded-lg bg-background/50 overflow-auto">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 500"
                className="absolute inset-0"
              >
                {/* Producer Services (Left side) */}
                {services.slice(0, 3).map((service) => (
                  <g
                    key={service.type}
                    transform={`translate(${service.position.x}, ${service.position.y})`}
                  >
                    <rect
                      x="-70"
                      y="-40"
                      width="140"
                      height="80"
                      rx="5"
                      fill={
                        service.status === "online"
                          ? "#f1f5f9"
                          : service.status === "overloaded"
                          ? "#fef3c7"
                          : "#fee2e2"
                      }
                      stroke={
                        service.status === "online"
                          ? "#94a3b8"
                          : service.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                      strokeWidth="2"
                    />
                    <foreignObject x="-20" y="-35" width="40" height="40">
                      <div className="flex items-center justify-center w-full h-full">
                        {service.type === "order" && (
                          <ShoppingCart className="w-7 h-7 text-blue-500" />
                        )}
                        {service.type === "payment" && (
                          <CreditCard className="w-7 h-7 text-amber-500" />
                        )}
                        {service.type === "inventory" && (
                          <Package className="w-7 h-7 text-purple-500" />
                        )}
                      </div>
                    </foreignObject>
                    <rect
                      x="-65"
                      y="10"
                      width="130"
                      height="20"
                      rx="3"
                      fill="#f8fafc"
                      stroke="none"
                    />
                    <text
                      x="0"
                      y="24"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#1e293b"
                    >
                      Service{" "}
                      {service.type.charAt(0).toUpperCase() +
                        service.type.slice(1)}
                    </text>
                    <rect
                      x="-40"
                      y="-15"
                      width="80"
                      height="15"
                      rx="3"
                      fill="#f8fafc"
                      stroke="none"
                    />
                    <text
                      x="0"
                      y="-5"
                      textAnchor="middle"
                      fontSize="10"
                      fill={
                        service.status === "online"
                          ? "#1e293b"
                          : service.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    >
                      {service.status === "online"
                        ? `Événements: ${service.events}`
                        : service.status === "overloaded"
                        ? "Surcharge"
                        : "Hors ligne"}
                    </text>
                  </g>
                ))}

                {/* Event Broker (Center) */}
                <g
                  transform={`translate(${eventBroker.position.x}, ${eventBroker.position.y})`}
                >
                  {/* Broker background */}
                  <rect
                    x="-90"
                    y="-70"
                    width="180"
                    height="140"
                    rx="5"
                    fill="#f1f5f9"
                    stroke={getBrokerColor(eventBroker.type)}
                    strokeWidth="2"
                  />

                  {/* Broker icon */}
                  <foreignObject x="-25" y="-65" width="50" height="50">
                    <div className="flex items-center justify-center w-full h-full">
                      {renderBrokerIcon(eventBroker.type)}
                    </div>
                  </foreignObject>

                  {/* Broker title */}
                  <rect
                    x="-70"
                    y="-20"
                    width="140"
                    height="25"
                    rx="3"
                    fill="#f8fafc"
                    stroke="none"
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#1e293b"
                  >
                    {getBrokerName(eventBroker.type)}
                  </text>

                  {/* Broker stats */}
                  <rect
                    x="-80"
                    y="20"
                    width="160"
                    height="20"
                    rx="3"
                    fill="#f8fafc"
                    stroke="none"
                  />
                  <text
                    x="0"
                    y="33"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#1e293b"
                  >
                    {eventBroker.type === "kafka"
                      ? `Partitions: ${eventBroker.partitions}`
                      : eventBroker.type === "rabbitmq"
                      ? `Exchanges: ${eventBroker.exchanges?.length}`
                      : `Événements: ${eventBroker.events}/${eventBroker.maxEvents}`}
                  </text>

                  {/* Event queue visualization - different for each broker type */}
                  {eventBroker.type === "kafka" ? (
                    // Kafka partitions
                    <g>
                      {Array.from({ length: eventBroker.partitions || 3 }).map(
                        (_, i) => (
                          <g key={i}>
                            <rect
                              x="-60"
                              y={30 + i * 12}
                              width="120"
                              height="8"
                              rx="2"
                              fill="#f1f5f9"
                              stroke="#94a3b8"
                              strokeWidth="1"
                            />
                            {Array.from({
                              length: Math.min(
                                Math.ceil(
                                  eventBroker.events /
                                    (eventBroker.partitions || 3)
                                ),
                                8
                              ),
                            }).map((_, j) => (
                              <rect
                                key={`${i}-${j}`}
                                x={-55 + j * 15}
                                y={30 + i * 12}
                                width="10"
                                height="8"
                                rx="1"
                                fill="#3b82f6"
                                opacity="0.7"
                              />
                            ))}
                          </g>
                        )
                      )}
                    </g>
                  ) : eventBroker.type === "rabbitmq" ? (
                    // RabbitMQ exchanges and queues
                    <g>
                      <rect
                        x="-60"
                        y="30"
                        width="120"
                        height="30"
                        rx="3"
                        fill="#f1f5f9"
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="45"
                        textAnchor="middle"
                        fontSize="8"
                        fill="#1e293b"
                      >
                        Exchange → Queues
                      </text>
                      {Array.from({
                        length: Math.min(eventBroker.events, 6),
                      }).map((_, i) => (
                        <circle
                          key={i}
                          cx={-40 + i * 16}
                          cy="55"
                          r="4"
                          fill="#ec4899"
                          opacity="0.7"
                        />
                      ))}
                    </g>
                  ) : (
                    // Default queue visualization
                    <g>
                      <rect
                        x="-60"
                        y="30"
                        width="120"
                        height="20"
                        rx="3"
                        fill="#f1f5f9"
                        stroke="#94a3b8"
                        strokeWidth="1"
                      />
                      {Array.from({
                        length: Math.min(eventBroker.events, 10),
                      }).map((_, i) => (
                        <rect
                          key={i}
                          x={-55 + i * 12}
                          y="33"
                          width="8"
                          height="14"
                          rx="2"
                          fill={
                            i < 5 ? "#3b82f6" : i < 8 ? "#f59e0b" : "#ef4444"
                          }
                          opacity="0.7"
                        />
                      ))}
                    </g>
                  )}
                </g>

                {/* Consumer Services (Right side) */}
                {services.slice(3).map((service) => (
                  <g
                    key={service.type}
                    transform={`translate(${service.position.x}, ${service.position.y})`}
                  >
                    <rect
                      x="-70"
                      y="-40"
                      width="140"
                      height="80"
                      rx="5"
                      fill={
                        service.status === "online"
                          ? "#f1f5f9"
                          : service.status === "overloaded"
                          ? "#fef3c7"
                          : "#fee2e2"
                      }
                      stroke={
                        service.status === "online"
                          ? "#94a3b8"
                          : service.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                      strokeWidth="2"
                    />
                    <foreignObject x="-20" y="-35" width="40" height="40">
                      <div className="flex items-center justify-center w-full h-full">
                        {service.type === "shipping" && (
                          <Truck className="w-7 h-7 text-green-500" />
                        )}
                        {service.type === "notification" && (
                          <Bell className="w-7 h-7 text-pink-500" />
                        )}
                      </div>
                    </foreignObject>
                    <rect
                      x="-65"
                      y="10"
                      width="130"
                      height="20"
                      rx="3"
                      fill="#f8fafc"
                      stroke="none"
                    />
                    <text
                      x="0"
                      y="24"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#1e293b"
                    >
                      Service{" "}
                      {service.type.charAt(0).toUpperCase() +
                        service.type.slice(1)}
                    </text>
                    <rect
                      x="-40"
                      y="-15"
                      width="80"
                      height="15"
                      rx="3"
                      fill="#f8fafc"
                      stroke="none"
                    />
                    <text
                      x="0"
                      y="-5"
                      textAnchor="middle"
                      fontSize="10"
                      fill={
                        service.status === "online"
                          ? "#1e293b"
                          : service.status === "overloaded"
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    >
                      {service.status === "online"
                        ? `Événements: ${service.events}`
                        : service.status === "overloaded"
                        ? "Surcharge"
                        : "Hors ligne"}
                    </text>
                  </g>
                ))}

                {/* Connection lines */}
                {/* Producer to Broker */}
                <path
                  d="M 160,150 L 320,250"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 160,250 L 320,250"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 160,350 L 320,250"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />

                {/* Broker to Consumer */}
                <path
                  d="M 480,250 L 640,200"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 480,250 L 640,300"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />

                {/* Events */}
                {events.map((event) => (
                  <g
                    key={event.id}
                    transform={`translate(${event.position.x}, ${event.position.y})`}
                    className="group"
                  >
                    {/* Event circle with priority indicator */}
                    <circle
                      r="8"
                      fill={
                        event.status === "failed"
                          ? "#ef4444"
                          : getServiceByType(event.producerService, services)
                              ?.color || "#6b7280"
                      }
                      opacity={
                        event.status === "processed" ||
                        event.status === "failed"
                          ? 0.5
                          : 1
                      }
                      strokeWidth={event.priority === "high" ? 2 : 0}
                      stroke={event.priority === "high" ? "#ef4444" : "none"}
                    />

                    {/* Event type indicator */}
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fill="white"
                      fontWeight="bold"
                    >
                      {event.type.charAt(0).toUpperCase()}
                    </text>

                    {/* Event tooltip */}
                    <foreignObject
                      x="-150"
                      y="-120"
                      width="300"
                      height="100"
                      style={{ pointerEvents: "none", opacity: 0 }}
                      className="group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border text-xs overflow-hidden">
                        <div className="font-semibold mb-1">{event.type}</div>
                        <div className="flex justify-between">
                          <span>ID:</span>
                          <span className="font-mono">{event.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span
                            className={`font-medium ${
                              event.status === "failed"
                                ? "text-red-500"
                                : event.status === "processed"
                                ? "text-green-500"
                                : "text-blue-500"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <span
                            className={`font-medium ${
                              event.priority === "high"
                                ? "text-red-500"
                                : event.priority === "medium"
                                ? "text-amber-500"
                                : "text-gray-500"
                            }`}
                          >
                            {event.priority}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{event.size} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Topic:</span>
                          <span className="font-medium">{event.topic}</span>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>

              {/* Stats Overlay */}
              <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-sm border text-xs space-y-1">
                <div className="flex justify-between gap-4">
                  <span>Événements totaux:</span>
                  <span className="font-medium">{stats.totalEvents}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Événements traités:</span>
                  <span className="font-medium text-green-500">
                    {stats.processedEvents}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Événements échoués:</span>
                  <span className="font-medium text-red-500">
                    {stats.failedEvents}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Temps moyen:</span>
                  <span className="font-medium">
                    {stats.averageProcessingTime} ms
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRunning(true)}
                disabled={isRunning}
              >
                Démarrer la Simulation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRunning(false)}
                disabled={!isRunning}
              >
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRunning(false);
                  setEvents([]);
                  setStats({
                    totalEvents: 0,
                    processedEvents: 0,
                    failedEvents: 0,
                    averageProcessingTime: 0,
                  });
                  setServices(
                    services.map((service) => ({ ...service, events: 0 }))
                  );
                  setEventBroker({ ...eventBroker, events: 0 });
                }}
              >
                Réinitialiser
              </Button>

              {/* Broker Type Selector */}
              <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                <span className="text-sm font-medium mr-2 self-center">
                  Type de Broker:
                </span>
                <Button
                  variant={eventBroker.type === "kafka" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventBroker((prev) => ({
                      ...prev,
                      type: "kafka",
                      partitions: 3,
                      topics: [
                        "orders",
                        "payments",
                        "inventory",
                        "shipping",
                        "notifications",
                      ],
                    }));
                    setSelectedBrokerType("kafka");
                  }}
                >
                  Kafka
                </Button>
                <Button
                  variant={
                    eventBroker.type === "rabbitmq" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setEventBroker((prev) => ({
                      ...prev,
                      type: "rabbitmq",
                      exchanges: ["direct", "fanout", "topic"],
                      queues: [
                        "orders",
                        "payments",
                        "inventory",
                        "shipping",
                        "notifications",
                      ],
                    }));
                    setSelectedBrokerType("rabbitmq");
                  }}
                >
                  RabbitMQ
                </Button>
                <Button
                  variant={eventBroker.type === "nats" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventBroker((prev) => ({
                      ...prev,
                      type: "nats",
                      channels: 5,
                      topics: [
                        "orders",
                        "payments",
                        "inventory",
                        "shipping",
                        "notifications",
                      ],
                    }));
                    setSelectedBrokerType("nats");
                  }}
                >
                  NATS
                </Button>
                <Button
                  variant={eventBroker.type === "redis" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventBroker((prev) => ({
                      ...prev,
                      type: "redis",
                      topics: [
                        "orders",
                        "payments",
                        "inventory",
                        "shipping",
                        "notifications",
                      ],
                    }));
                    setSelectedBrokerType("redis");
                  }}
                >
                  Redis
                </Button>
              </div>

              {/* Scenario Selector */}
              <div className="ml-auto flex gap-2">
                <Button
                  variant={scenario === "normal" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScenario("normal")}
                >
                  Charge Normale
                </Button>
                <Button
                  variant={scenario === "high-load" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScenario("high-load")}
                >
                  Charge Élevée
                </Button>
                <Button
                  variant={scenario === "failure" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScenario("failure")}
                >
                  Défaillance
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Qu&apos;est-ce que l&apos;Architecture Event-Driven?
              </h3>
              <p className="text-muted-foreground">
                L&apos;architecture event-driven (pilotée par les événements)
                est un modèle d&apos;architecture logicielle où la production,
                la détection, la consommation et la réaction aux événements
                constituent la base du système. Un événement peut être défini
                comme un changement d&apos;état significatif.
              </p>

              <h3 className="text-lg font-semibold mt-6">Composants Clés</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium">
                    Producteurs d&apos;événements
                  </span>{" "}
                  - Services qui génèrent des événements suite à des changements
                  d&apos;état
                </li>
                <li>
                  <span className="font-medium">Broker de messages</span> -
                  Middleware qui stocke et achemine les événements
                </li>
                <li>
                  <span className="font-medium">
                    Consommateurs d&apos;événements
                  </span>{" "}
                  - Services qui écoutent et réagissent aux événements
                </li>
                <li>
                  <span className="font-medium">Événements</span> - Messages qui
                  représentent des faits survenus dans le système
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Avantages</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Découplage fort entre les services</li>
                <li>Meilleure résilience et tolérance aux pannes</li>
                <li>Scalabilité améliorée</li>
                <li>
                  Flexibilité pour ajouter de nouveaux consommateurs sans
                  modifier les producteurs
                </li>
                <li>
                  Support naturel pour les modèles de communication asynchrone
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Défis</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Complexité accrue dans le suivi du flux d&apos;exécution
                </li>
                <li>Gestion de la cohérence des données</li>
                <li>Traitement des événements dupliqués ou manquants</li>
                <li>
                  Besoin d&apos;une infrastructure robuste pour le broker de
                  messages
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
