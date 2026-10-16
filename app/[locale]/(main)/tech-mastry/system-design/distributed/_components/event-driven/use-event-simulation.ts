import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getServiceByType } from "./broker-helpers";
import {
  createEvent,
  getConsumerServices,
  getEventInterval,
  pickEventAndProducer,
} from "./event-generation";
import type { EventScenario } from "./event-generation";
import type {
  Event,
  EventBroker,
  EventStatus,
  Service,
  Stats,
} from "./types";

interface UseEventSimulationParams {
  isRunning: boolean;
  events: Event[];
  scenario: EventScenario;
  services: Service[];
  eventBroker: EventBroker;
  setEvents: Dispatch<SetStateAction<Event[]>>;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setEventBroker: Dispatch<SetStateAction<EventBroker>>;
  setStats: Dispatch<SetStateAction<Stats>>;
}

// Drives the event animation loop and the scenario-dependent service status
export function useEventSimulation({
  isRunning,
  events,
  scenario,
  services,
  eventBroker,
  setEvents,
  setServices,
  setEventBroker,
  setStats,
}: UseEventSimulationParams) {
  // Refs for animation
  const eventIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastEventTimeRef = useRef(0);
  const processingTimesRef = useRef<number[]>([]);

  // The animation loop reads and writes the event list through a ref, so that the
  // state updater stays pure: updaters run twice in StrictMode, while the stats /
  // broker side effects must run once per frame.
  const eventsRef = useRef<Event[]>(events);
  const ownEventLists = useRef(new WeakSet<Event[]>());
  useEffect(() => {
    // A list that did not come from the loop (e.g. "Reset") replaces the ref
    if (!ownEventLists.current.has(events)) eventsRef.current = events;
  }, [events]);
  const commitEvents = useCallback(
    (next: Event[]) => {
      ownEventLists.current.add(next);
      eventsRef.current = next;
      setEvents(next);
    },
    [setEvents],
  );

  // Wrap functions in useCallback to prevent recreation on every render
  const generateEvent = useCallback(() => {
    const { eventType, producerType } = pickEventAndProducer();
    const consumerServices = getConsumerServices(eventType);

    // Get producer service position
    const producer = getServiceByType(producerType, services);
    if (!producer) return;

    const newEvent = createEvent({
      id: eventIdRef.current++,
      eventType,
      producer,
      producerType,
      consumerServices,
      services,
      eventBroker,
      scenario,
    });

    // Add the event to the list
    commitEvents([...eventsRef.current, newEvent]);

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
  }, [services, eventBroker, scenario, commitEvents, setServices, setStats]);

  // Process existing events
  const processEvents = useCallback(
    (timestamp: number) => {
      const nextEvents = ((prev: Event[]) => {
        // Process each event
        const updatedEvents = prev.map((stateEvent) => {
          // Work on a copy: the list held in state is never mutated
          const event = { ...stateEvent };
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
      })(eventsRef.current);
      commitEvents(nextEvents);
    },
    [services, eventBroker, commitEvents, setEventBroker, setServices, setStats]
  );

  // Animation logic
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      // Generate new events based on scenario
      if (timestamp - lastEventTimeRef.current > getEventInterval(scenario)) {
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
  }, [scenario, setServices]);
}
