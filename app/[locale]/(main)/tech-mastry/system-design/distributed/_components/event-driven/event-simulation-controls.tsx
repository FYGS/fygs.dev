"use client";

import { Button } from "@/components/ui/button";
import type { Dispatch, SetStateAction } from "react";
import type { Event, Service, BrokerType, EventBroker, Stats } from "./types";

export function EventSimulationControls({ eventBroker, isRunning, scenario, services, setEventBroker, setEvents, setIsRunning, setScenario, setSelectedBrokerType, setServices, setStats }: {
  eventBroker: EventBroker;
  isRunning: boolean;
  scenario: "normal" | "high-load" | "failure";
  services: Service[];
  setEventBroker: Dispatch<SetStateAction<EventBroker>>;
  setEvents: Dispatch<SetStateAction<Event[]>>;
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setScenario: Dispatch<SetStateAction<"normal" | "high-load" | "failure">>;
  setSelectedBrokerType: Dispatch<SetStateAction<BrokerType>>;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setStats: Dispatch<SetStateAction<Stats>>;
}) {
  return (
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
  );
}
