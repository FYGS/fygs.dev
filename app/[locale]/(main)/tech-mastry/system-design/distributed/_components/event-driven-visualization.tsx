"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { EventDrivenExplanation } from "./event-driven/event-driven-explanation";
import { EventSimulationControls } from "./event-driven/event-simulation-controls";
import { EventFlowCanvas } from "./event-driven/event-flow-canvas";
import {
  getBrokerColor,
  getBrokerName,
  getServiceByType,
  renderBrokerIcon,
} from "./event-driven/broker-helpers";
import { INITIAL_EVENT_BROKER, INITIAL_SERVICES } from "./event-driven/data";
import { useEventSimulation } from "./event-driven/use-event-simulation";
import type { BrokerType, Event, EventBroker, Service, Stats } from "./event-driven/types";

export function EventDrivenVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");

  // Initialize services
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);

  // Initialize event broker
  const [eventBroker, setEventBroker] = useState<EventBroker>(INITIAL_EVENT_BROKER);

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


  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<"normal" | "high-load" | "failure">(
    "normal"
  );

  useEventSimulation({
    isRunning,
    scenario,
    events,
    services,
    eventBroker,
    setEvents,
    setServices,
    setEventBroker,
    setStats,
  });

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
