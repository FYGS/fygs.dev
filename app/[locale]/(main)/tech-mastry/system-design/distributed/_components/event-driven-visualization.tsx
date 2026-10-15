"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EventDrivenExplanation } from "./event-driven/event-driven-explanation";
import { EventSimulationControls } from "./event-driven/event-simulation-controls";
import { EventFlowCanvas } from "./event-driven/event-flow-canvas";
import type { EventType, ServiceType, EventStatus, Event, Service, BrokerType, EventBroker, Stats } from "./event-driven/types";

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
            <EventFlowCanvas eventBroker={eventBroker} events={events} getBrokerColor={getBrokerColor} getBrokerName={getBrokerName} getServiceByType={getServiceByType} renderBrokerIcon={renderBrokerIcon} services={services} stats={stats} />

            {/* Controls */}
            <EventSimulationControls eventBroker={eventBroker} isRunning={isRunning} scenario={scenario} services={services} setEventBroker={setEventBroker} setEvents={setEvents} setIsRunning={setIsRunning} setScenario={setScenario} setSelectedBrokerType={setSelectedBrokerType} setServices={setServices} setStats={setStats} />
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <EventDrivenExplanation />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
