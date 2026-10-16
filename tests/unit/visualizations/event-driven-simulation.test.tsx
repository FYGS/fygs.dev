import { StrictMode, useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup } from "@testing-library/react";
import { useEventSimulation } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/use-event-simulation";
import {
  INITIAL_EVENT_BROKER,
  INITIAL_SERVICES,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/data";
import type {
  Event,
  EventBroker,
  Service,
  Stats,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/event-driven/types";

const INITIAL_STATS: Stats = { totalEvents: 0, processedEvents: 0, failedEvents: 0, averageProcessingTime: 0 };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function Harness({ onRender }: { onRender: (stats: Stats, broker: EventBroker, events: Event[]) => void }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [eventBroker, setEventBroker] = useState<EventBroker>(INITIAL_EVENT_BROKER);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  useEventSimulation({
    isRunning: true,
    scenario: "failure",
    events,
    services,
    eventBroker,
    setEvents,
    setServices,
    setEventBroker,
    setStats,
  });
  onRender(stats, eventBroker, events);
  return null;
}

function runSimulation(strict: boolean) {
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
  let seed = 4242;
  vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  });
  let stats = INITIAL_STATS;
  let broker = INITIAL_EVENT_BROKER;
  const ui = <Harness onRender={(s, b) => ((stats = s), (broker = b))} />;
  render(strict ? <StrictMode>{ui}</StrictMode> : ui);
  for (let i = 0; i < 400; i++) act(() => void vi.advanceTimersByTime(50));
  const result = { ...stats, brokerEvents: broker.events };
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  return result;
}

describe("event-driven simulation loop", () => {
  it("runs and produces events", () => {
    const r = runSimulation(false);
    expect(r.totalEvents).toBeGreaterThan(5);
    expect(r.processedEvents + r.failedEvents).toBeGreaterThan(0);
  });

  it("gives the same stats under StrictMode (state updaters are pure)", () => {
    expect(runSimulation(true)).toEqual(runSimulation(false));
  });
});
