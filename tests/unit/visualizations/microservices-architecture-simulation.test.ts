import { describe, it, expect, vi, afterEach } from "vitest";
import {
  advanceRequest,
  createMicroserviceRequest,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices/architecture/request-simulation";
import {
  getRequestColor,
  getServiceColor,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices/architecture/colors";
import type { Request } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/microservices/types";

afterEach(() => vi.restoreAllMocks());

const make = (patch: Partial<Request> = {}): Request => ({
  ...createMicroserviceRequest(1, "normal"),
  ...patch,
});

describe("microservices architecture simulation", () => {
  it("creates a pending request at the user position", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const normal = createMicroserviceRequest(7, "normal");
    expect(normal).toMatchObject({
      id: 7,
      type: "payment",
      status: "pending",
      position: { x: 50, y: 250 },
      startTime: 1234,
      currentPathIndex: 0,
      speed: 1,
    });
    expect(normal.path).toHaveLength(5);
    expect(createMicroserviceRequest(8, "high-load").speed).toBe(1.5);
  });

  it("moves a request towards its next point", () => {
    const moved = advanceRequest(make(), 100, false, false);
    expect(moved.position.x).toBeCloseTo(52);
    expect(moved.position.y).toBe(250);
    const slowed = advanceRequest(make(), 100, false, true);
    expect(slowed.position.x).toBeCloseTo(51);
  });

  it("switches to processing when the monolith is reached", () => {
    const arrived = advanceRequest(make({ position: { x: 398, y: 250 }, currentPathIndex: 0, path: [{ x: 50, y: 250 }, { x: 400, y: 250 }, { x: 700, y: 250 }] }), 500, false, false);
    expect(arrived).toMatchObject({ currentPathIndex: 1, status: "processing", processingTime: 500, position: { x: 400, y: 250 } });
  });

  it("completes at the end of the path, or fails randomly when overloaded", () => {
    const base = make({ currentPathIndex: 3, position: { x: 52, y: 250 } });
    const done = advanceRequest(base, 900, false, false);
    expect(done).toMatchObject({ status: "completed", completionTime: 900, currentPathIndex: 4 });
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(advanceRequest(base, 900, false, true).status).toBe("failed");
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    expect(advanceRequest(base, 900, false, true).status).toBe("completed");
  });

  it("fails processing requests when the system has failed", () => {
    expect(advanceRequest(make({ status: "processing" }), 42, true, false)).toMatchObject({
      status: "failed",
      completionTime: 42,
    });
  });

  it("colours requests and services", () => {
    expect(getRequestColor(make({ status: "failed" }))).toBe("#ef4444");
    expect(getRequestColor(make({ type: "payment" }))).toBe("#f59e0b");
    expect(getServiceColor("offline")).toEqual({ bg: "#fee2e2", border: "#ef4444", text: "#ef4444" });
    expect(getServiceColor("online").bg).toBe("#f1f5f9");
  });
});
