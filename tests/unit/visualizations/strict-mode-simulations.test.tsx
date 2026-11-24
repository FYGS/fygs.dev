import { StrictMode, type ReactElement } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, cleanup, fireEvent, screen } from "@testing-library/react";
import { CachingVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/caching-visualization";
import { MonolithicArchitecture } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices/monolithic-architecture";
import { DatabaseReplicationVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/storage/_components/database-replication-visualization";
import { LoadBalancerVisualization } from "@/app/[locale]/(main)/tech-mastry/system-design/scalability/_components/load-balancer-visualization";
import { withNeutralMatchMedia } from "./match-media";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * Runs a simulation with a fake clock and a seeded Math.random, and returns
 * the markup after each stretch of simulated time. State updaters that draw
 * random numbers or have side effects run twice under StrictMode, which
 * desynchronises the random sequence and double counts the statistics: a pure
 * simulation renders the very same markup with and without StrictMode.
 */
function run(ui: ReactElement, strict: boolean, afterMount?: () => void, frames = 160) {
  return withNeutralMatchMedia(() => {
    vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
    let seed = 4242;
    vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    });
    const { container } = render(strict ? <StrictMode>{ui}</StrictMode> : ui);
    afterMount?.();
    const snapshots: string[] = [];
    for (let i = 0; i < frames; i++) {
      act(() => void vi.advanceTimersByTime(100));
      if (i % 20 === 19) {
        snapshots.push(container.innerHTML.replace(/_r_[0-9a-z]+_/g, "_r_X_").replace(/id="glow-[^"]*"/g, "")
            // framer-motion animates its own height/opacity on a clock StrictMode does not share
            .replace(/opacity: [0-9.e-]+; height: [^;"]+;/g, ""));
      }
    }
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    return snapshots;
  });
}

// Reports where the first diverging snapshot starts to differ, not the whole markup
function expectSame(strict: string[], normal: string[]) {
  expect(strict.length).toBe(normal.length);
  for (let i = 0; i < normal.length; i++) {
    if (strict[i] === normal[i]) continue;
    let k = 0;
    while (strict[i][k] === normal[i][k]) k++;
    expect({ snapshot: i, strict: strict[i].slice(Math.max(0, k - 80), k + 120) }).toEqual({
      snapshot: i,
      strict: normal[i].slice(Math.max(0, k - 80), k + 120),
    });
  }
}

describe("simulations are StrictMode-safe", () => {
  it("caching: same markup with and without StrictMode", () => {
    const start = () => fireEvent.click(screen.getByText("Démarrer"));
    const normal = run(<CachingVisualization />, false, start);
    const strict = run(<CachingVisualization />, true, start);
    expect(normal.length).toBeGreaterThan(0);
    expectSame(strict, normal);
  });

  it("monolithic architecture (high load): same markup with and without StrictMode", () => {
    const normal = run(<MonolithicArchitecture scenario="high-load" />, false, undefined, 200);
    const strict = run(<MonolithicArchitecture scenario="high-load" />, true, undefined, 200);
    expect(normal.length).toBeGreaterThan(0);
    expectSame(strict, normal);
  });

  it("database replication: same markup with and without StrictMode", () => {
    const sync = () => fireEvent.click(screen.getByText("Synchrone").closest("button") as Element);
    const normal = run(<DatabaseReplicationVisualization />, false, sync, 200);
    const strict = run(<DatabaseReplicationVisualization />, true, sync, 200);
    expect(normal.length).toBeGreaterThan(0);
    expectSame(strict, normal);
  });

  it("load balancer: same markup with and without StrictMode", () => {
    const start = () => {
      // IP Hash picks its server at random: the draw happens when a request is dispatched
      fireEvent.click(screen.getByText("IP Hash"));
      fireEvent.click(screen.getByText("Démarrer"));
    };
    const normal = run(<LoadBalancerVisualization />, false, start, 200);
    const strict = run(<LoadBalancerVisualization />, true, start, 200);
    expect(normal.length).toBeGreaterThan(0);
    expectSame(strict, normal);
  });
});

describe("caching statistics", () => {
  it("count the cache hits and misses of the running simulation", () => {
    // 0.1 makes every key a popular one, so the same few keys come back and hit the cache
    vi.useFakeTimers({ now: new Date("2025-01-01T00:00:00Z") });
    let seed = 99;
    vi.spyOn(Math, "random").mockImplementation(() => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    });
    render(<CachingVisualization />);
    fireEvent.click(screen.getByText("Démarrer"));
    for (let i = 0; i < 300; i++) act(() => void vi.advanceTimersByTime(100));
    const valueOf = (label: string) => Number(screen.getByText(label).parentElement?.parentElement?.querySelector("p.text-xl")?.textContent);
    expect(valueOf("Cache Misses")).toBeGreaterThan(0);
    expect(valueOf("Cache Hits")).toBeGreaterThan(0);
  });
});
