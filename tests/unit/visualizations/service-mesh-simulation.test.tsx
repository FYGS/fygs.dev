import { StrictMode, useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup } from "@testing-library/react";
import { useMeshSimulation } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/use-mesh-simulation";
import { INITIAL_SERVICES } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/data";
import {
  createRequest,
  selectRequestPath,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/request-generation";
import type { Request, Service, Stats } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/types";

const INITIAL_STATS: Stats = { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageLatency: 0 };
const INITIAL_PROXIES = INITIAL_SERVICES.map((service) => ({
  id: `${service.id}-proxy`,
  serviceId: service.id,
  position: { x: service.position.x + 40, y: service.position.y },
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("service mesh request flags", () => {
  const frontend = INITIAL_SERVICES[0];
  const auth = INITIAL_SERVICES[1];
  const proxy = (s: Service) => ({ id: `${s.id}-p`, serviceId: s.id, position: { x: s.position.x + 40, y: s.position.y } });
  const make = (requestPath: Parameters<typeof createRequest>[0]["requestPath"]) =>
    createRequest({
      id: 1,
      requestPath,
      sourceService: frontend,
      targetService: auth,
      sourceProxy: proxy(frontend),
      targetProxy: proxy(auth),
      activeFeature: "traffic",
      serviceMeshType: "istio",
    });

  it("carries the canary, auto-retry and discovery flags chosen for the path", () => {
    expect(make({ source: "frontend", target: "auth", canary: true }).canary).toBe(true);
    expect(make({ source: "frontend", target: "auth", autoRetry: true }).autoRetry).toBe(true);
    expect(make({ source: "frontend", target: "auth", dynamicDiscovery: true }).dynamicDiscovery).toBe(true);
    expect(make({ source: "frontend", target: "auth" })).not.toHaveProperty("canary");
  });

  it("selectRequestPath's flags reach the request end to end", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1); // < 0.2: Istio picks the canary path
    const path = selectRequestPath("istio", "normal", "traffic");
    expect(make(path).canary).toBe(true);
  });
});

function Harness({ onRender }: { onRender: (requests: Request[], stats: Stats) => void }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  useMeshSimulation({
    isRunning: true,
    scenario: "failure",
    activeFeature: "traffic",
    serviceMeshType: "consul",
    requests,
    services,
    proxies: INITIAL_PROXIES,
    setRequests,
    setServices,
    setStats,
  });
  onRender(requests, stats);
  return null;
}

function runSimulation(strict: boolean) {
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
  let seed = 99;
  vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  });
  const failedIds = new Set<number>();
  let last: Stats = INITIAL_STATS;
  const onRender = (requests: Request[], stats: Stats) => {
    last = stats;
    requests.forEach((r) => (r.status === "error" || r.status === "rejected") && failedIds.add(r.id));
  };
  const ui = <Harness onRender={onRender} />;
  render(strict ? <StrictMode>{ui}</StrictMode> : ui);
  for (let i = 0; i < 400; i++) act(() => void vi.advanceTimersByTime(50));
  const result = { total: last.totalRequests, failed: last.failedRequests, ok: last.successfulRequests, failedSeen: failedIds.size };
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  return result;
}

describe("service mesh simulation loop", () => {
  it("runs and counts requests", () => {
    const r = runSimulation(false);
    expect(r.total).toBeGreaterThan(5);
    expect(r.ok + r.failed).toBeGreaterThan(0);
  });

  it("does not double count under StrictMode (state updaters are pure)", () => {
    const normal = runSimulation(false);
    const strict = runSimulation(true);
    // Stats are bumped once per frame, not once per updater call
    expect(strict.failed).toBe(normal.failed);
    expect(strict.ok).toBe(normal.ok);
    expect(strict.total).toBe(normal.total);
  });
});
