import { StrictMode } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup } from "@testing-library/react";
import { useMicroservicesSimulation } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices/architecture/use-microservices-simulation";
import type { ArchitectureStats } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices/architecture/types";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function Harness({ onRender }: { onRender: (stats: ArchitectureStats) => void }) {
  const { stats } = useMicroservicesSimulation("normal");
  onRender(stats);
  return null;
}

function runSimulation(strict: boolean) {
  vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
  let seed = 7;
  vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  });
  let stats: ArchitectureStats | null = null;
  const ui = <Harness onRender={(s) => (stats = s)} />;
  render(strict ? <StrictMode>{ui}</StrictMode> : ui);
  for (let i = 0; i < 600; i++) act(() => void vi.advanceTimersByTime(50));
  const result = { ...stats! };
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  return result;
}

describe("microservices simulation loop", () => {
  it("runs and completes requests", () => {
    const r = runSimulation(false);
    expect(r.totalRequests).toBeGreaterThan(5);
    expect(r.completedRequests + r.failedRequests).toBeGreaterThan(0);
  });

  it("gives the same stats under StrictMode (state updaters are pure)", () => {
    expect(runSimulation(true)).toEqual(runSimulation(false));
  });
});
