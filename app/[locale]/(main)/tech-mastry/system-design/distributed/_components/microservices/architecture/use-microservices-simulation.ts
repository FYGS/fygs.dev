import { useEffect, useRef, useState } from "react";
import type { Request, Scenario } from "../types";
import { getRequestInterval } from "../request-interval";
import { INITIAL_SERVICES, INITIAL_STATS } from "./data";
import { advanceRequest, createMicroserviceRequest } from "./request-simulation";
import type { ArchitectureStats, ServicesState } from "./types";

// Drives the request animation loop and the scenario-dependent service status
export function useMicroservicesSimulation(scenario: Scenario) {
  const [services, setServices] = useState<ServicesState>(INITIAL_SERVICES);

  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<ArchitectureStats>(INITIAL_STATS);
  const [isOverloaded] = useState(false);
  const [isFailed] = useState(false);

  const requestIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastRequestTimeRef = useRef(0);
  const responseTimes = useRef<number[]>([]);

  // Set up the animation loop
  useEffect(() => {
    // Generate a new request
    const generateRequest = () => {
      // Don't generate new requests if the system has failed
      if (isFailed) return;

      // Randomly select a request type
      const newRequest = createMicroserviceRequest(requestIdRef.current++, scenario);

      // Add the request to the list
      setRequests((prev) => [...prev, newRequest]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    };

    // Process existing requests
    const processRequests = (timestamp: number) => {
      setRequests((prev) => {
        // Process each request
        const updatedRequests = prev.map((request) =>
          advanceRequest(request, timestamp, isFailed, isOverloaded)
        );

        // Calculate stats
        const newCompletedRequests = updatedRequests.filter(
          (r) =>
            r.status === "completed" &&
            !prev.find((p) => p.id === r.id && p.status === "completed")
        );
        const newFailedRequests = updatedRequests.filter(
          (r) =>
            r.status === "failed" &&
            !prev.find((p) => p.id === r.id && p.status === "failed")
        );

        // Update response times
        newCompletedRequests.forEach((request) => {
          if (request.completionTime && request.startTime) {
            responseTimes.current.push(
              request.completionTime - request.startTime
            );
          }
        });

        // Calculate average response time
        if (responseTimes.current.length > 0) {
          const avgTime =
            responseTimes.current.reduce((sum, time) => sum + time, 0) /
            responseTimes.current.length;
          setStats((prev) => ({
            ...prev,
            completedRequests:
              prev.completedRequests + newCompletedRequests.length,
            failedRequests: prev.failedRequests + newFailedRequests.length,
            averageResponseTime: Math.round(avgTime),
          }));
        }

        // Remove completed or failed requests after they've been displayed for a while
        return updatedRequests.filter((r) => {
          if (r.status === "completed" || r.status === "failed") {
            return timestamp - (r.completionTime || 0) < 2000; // Keep for 2 seconds
          }
          return true;
        });
      });
    };

    const animate = (timestamp: number) => {
      // Generate new requests based on scenario
      if (
        timestamp - lastRequestTimeRef.current >
        getRequestInterval(scenario)
      ) {
        generateRequest();
        lastRequestTimeRef.current = timestamp;
      }

      // Process existing requests
      processRequests(timestamp);

      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scenario, isFailed, isOverloaded]);

  // Update service status based on scenario
  useEffect(() => {
    if (scenario === "high-load") {
      const timer = setTimeout(() => {
        setServices((prev) => ({
          ...prev,
          orders: { ...prev.orders, status: "overloaded" },
        }));
      }, 3000);
      return () => clearTimeout(timer);
    } else if (scenario === "failure") {
      const timer = setTimeout(() => {
        setServices((prev) => ({
          ...prev,
          payments: { ...prev.payments, status: "offline" },
        }));
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Reset all services to online
      setServices({
        users: { status: "online", load: 0 },
        orders: { status: "online", load: 0 },
        payments: { status: "online", load: 0 },
        inventory: { status: "online", load: 0 },
        notifications: { status: "online", load: 0 },
      });
    }
  }, [scenario]);

  return { services, requests, stats };
}
