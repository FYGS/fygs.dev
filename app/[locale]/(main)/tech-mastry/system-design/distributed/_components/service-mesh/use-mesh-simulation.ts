import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  createRequest,
  getRequestInterval,
  selectRequestPath,
} from "./request-generation";
import type { MeshFeature, MeshScenario } from "./request-generation";
import type {
  Proxy,
  Request,
  Service,
  ServiceMeshType,
  Stats,
} from "./types";

interface UseMeshSimulationParams {
  isRunning: boolean;
  scenario: MeshScenario;
  activeFeature: MeshFeature;
  serviceMeshType: ServiceMeshType;
  services: Service[];
  proxies: Proxy[];
  setRequests: Dispatch<SetStateAction<Request[]>>;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setStats: Dispatch<SetStateAction<Stats>>;
}

// Drives the request animation loop and the scenario-dependent service status
export function useMeshSimulation({
  isRunning,
  scenario,
  activeFeature,
  serviceMeshType,
  services,
  proxies,
  setRequests,
  setServices,
  setStats,
}: UseMeshSimulationParams) {
  // Refs for animation
  const requestIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastRequestTimeRef = useRef(0);
  const latenciesRef = useRef<number[]>([]);

  // Helper function to get a service by ID wrapped in useCallback
  const getServiceById = useCallback(
    (id: string): Service | undefined => {
      return services.find((service) => service.id === id);
    },
    [services]
  );

  // Helper function to get a proxy by service ID wrapped in useCallback
  const getProxyByServiceId = useCallback(
    (serviceId: string): Proxy | undefined => {
      return proxies.find((proxy) => proxy.serviceId === serviceId);
    },
    [proxies]
  );

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Generate a new request - moved inside useEffect
    const generateRequest = () => {
      const requestPath = selectRequestPath(serviceMeshType, scenario, activeFeature);

      // Get source and target services
      const sourceService = getServiceById(requestPath.source);
      const targetService = getServiceById(requestPath.target);

      if (!sourceService || !targetService) return;

      // Get source and target proxies
      const sourceProxy = getProxyByServiceId(requestPath.source);
      const targetProxy = getProxyByServiceId(requestPath.target);

      if (!sourceProxy || !targetProxy) return;

      const newRequest = createRequest({
        id: requestIdRef.current++,
        requestPath,
        sourceService,
        targetService,
        sourceProxy,
        targetProxy,
        activeFeature,
        serviceMeshType,
      });

      // Add the request to the list
      setRequests((prev) => [...prev, newRequest]);

      // Update source service requests count
      setServices((prev) =>
        prev.map((service) =>
          service.id === requestPath.source
            ? { ...service, requests: service.requests + 1 }
            : service
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    };

    // Process existing requests - moved inside useEffect
    const processRequests = (timestamp: number) => {
      setRequests((prev) => {
        // Process each request
        const updatedRequests = prev.map((request) => {
          // Get the current service if at a service point
          let currentService: Service | undefined;
          if (request.currentPathIndex < request.path.length) {
            const currentPosition = request.path[request.currentPathIndex];

            // Check if at a service position
            currentService = services.find(
              (service) =>
                service.position.x === currentPosition.x &&
                service.position.y === currentPosition.y
            );
          }

          // Apply service mesh specific behaviors
          let shouldRetry = false;

          // Linkerd automatic retry capability
          if (
            serviceMeshType === "linkerd" &&
            request.autoRetry &&
            Math.random() < 0.8
          ) {
            shouldRetry = true;
          }

          // Istio circuit breaking in high load scenario
          if (
            serviceMeshType === "istio" &&
            activeFeature === "traffic" &&
            scenario === "high-load" &&
            request.currentPathIndex === 1 && // At the proxy
            Math.random() < 0.1 &&
            request.status === "pending"
          ) {
            return {
              ...request,
              status: "rejected" as
                | "pending"
                | "success"
                | "error"
                | "rejected",
              type: "circuit-broken" as
                | "regular"
                | "retry"
                | "timeout"
                | "circuit-broken",
            };
          }

          // If at a service that's unhealthy, mark request as error
          if (
            currentService &&
            currentService.status === "unhealthy" &&
            request.status !== "error"
          ) {
            // For Linkerd with auto-retry, sometimes recover from errors
            if (shouldRetry && Math.random() < 0.7) {
              // Create a retry request
              setTimeout(() => {
                setRequests((prevRequests) => [
                  ...prevRequests,
                  {
                    ...request,
                    id: requestIdRef.current++,
                    type: "retry" as
                      | "regular"
                      | "retry"
                      | "timeout"
                      | "circuit-broken",
                    status: "pending" as
                      | "pending"
                      | "success"
                      | "error"
                      | "rejected",
                    currentPathIndex: 0,
                    position: { ...request.path[0] },
                    timestamp: Date.now(),
                  },
                ]);
              }, 300);

              return {
                ...request,
                status: "error" as "pending" | "success" | "error" | "rejected",
              };
            }

            // Update target service errors count
            if (currentService.id === request.target) {
              setServices((prevServices) =>
                prevServices.map((service) =>
                  service.id === request.target
                    ? { ...service, errors: service.errors + 1 }
                    : service
                )
              );
            }

            return {
              ...request,
              status: "error" as "pending" | "success" | "error" | "rejected",
            };
          }

          // If at a service that's degraded, slow down the request
          const speed = currentService?.status === "degraded" ? 0.5 : 1;

          // Move the request along its path
          if (request.currentPathIndex < request.path.length - 1) {
            const nextPoint = request.path[request.currentPathIndex + 1];

            // Calculate direction and distance
            const dx = nextPoint.x - request.position.x;
            const dy = nextPoint.y - request.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If we've reached the next point (or close enough)
            if (distance < 5) {
              // Move to the next point in the path
              const newIndex = request.currentPathIndex + 1;

              // If we've reached the target service, mark as success
              if (newIndex === request.path.length - 1) {
                // Record latency
                const latency = timestamp - request.timestamp;
                latenciesRef.current.push(latency);

                // Update stats
                setStats((prev) => {
                  const avgLatency =
                    latenciesRef.current.reduce((sum, time) => sum + time, 0) /
                    latenciesRef.current.length;

                  return {
                    ...prev,
                    successfulRequests: prev.successfulRequests + 1,
                    averageLatency: Math.round(avgLatency),
                  };
                });

                return {
                  ...request,
                  position: { ...nextPoint },
                  currentPathIndex: newIndex,
                  status: "success" as
                    | "pending"
                    | "success"
                    | "error"
                    | "rejected",
                };
              }

              return {
                ...request,
                position: { ...nextPoint },
                currentPathIndex: newIndex,
              };
            }

            // Otherwise, move towards the next point
            const step = speed * 2; // Pixels per frame
            const moveRatio = step / distance;

            return {
              ...request,
              position: {
                x: request.position.x + dx * moveRatio,
                y: request.position.y + dy * moveRatio,
              },
            };
          }

          return request;
        });

        // Check for newly failed requests
        const newFailedRequests = updatedRequests.filter(
          (r) =>
            r.status === "error" &&
            !prev.find((p) => p.id === r.id && p.status === "error")
        );

        // Update stats for failed requests
        if (newFailedRequests.length > 0) {
          setStats((prev) => ({
            ...prev,
            failedRequests: prev.failedRequests + newFailedRequests.length,
          }));
        }

        // Handle circuit breaking for traffic management
        if (activeFeature === "traffic" && scenario === "failure") {
          // Find requests that should be circuit-broken
          const circuitBrokenRequests = updatedRequests.filter(
            (r) =>
              r.target === "products" &&
              r.status === "pending" &&
              r.currentPathIndex === 1
          );

          // Update these requests to be rejected by the circuit breaker
          const updatedCircuitBrokenRequests = circuitBrokenRequests.map(
            (r) => ({
              ...r,
              status: "rejected" as
                | "pending"
                | "success"
                | "error"
                | "rejected",
              type: "circuit-broken" as
                | "regular"
                | "retry"
                | "timeout"
                | "circuit-broken",
            })
          );

          // Replace the original requests with the updated ones
          updatedRequests.forEach((request, index) => {
            const matchingUpdated = updatedCircuitBrokenRequests.find(
              (u) => u.id === request.id
            );
            if (matchingUpdated) {
              updatedRequests[index] = matchingUpdated;
            }
          });

          // Update stats for rejected requests
          if (circuitBrokenRequests.length > 0) {
            setStats((prev) => ({
              ...prev,
              failedRequests:
                prev.failedRequests + circuitBrokenRequests.length,
            }));
          }
        }

        // Remove completed requests after they've been displayed for a while
        return updatedRequests.filter((r) => {
          if (
            r.status === "success" ||
            r.status === "error" ||
            r.status === "rejected"
          ) {
            return timestamp - r.timestamp < 2000; // Keep for 2 seconds
          }
          return true;
        });
      });
    };

    const animate = (timestamp: number) => {
      // Generate new requests based on scenario
      if (timestamp - lastRequestTimeRef.current > getRequestInterval(scenario)) {
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

    // Clean up on unmount or when isRunning changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isRunning,
    scenario,
    activeFeature,
    services,
    serviceMeshType,
    getServiceById,
    getProxyByServiceId,
    setRequests,
    setServices,
    setStats,
  ]);

  // Update service status based on scenario
  useEffect(() => {
    if (scenario === "high-load") {
      const timer = setTimeout(() => {
        setServices((prev) =>
          prev.map((service) =>
            service.id === "auth" ? { ...service, status: "degraded" } : service
          )
        );
      }, 3000);
      return () => clearTimeout(timer);
    } else if (scenario === "failure") {
      const timer = setTimeout(() => {
        setServices((prev) =>
          prev.map((service) =>
            service.id === "products"
              ? { ...service, status: "unhealthy" }
              : service
          )
        );
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Reset all services to healthy
      setServices((prev) =>
        prev.map((service) => ({ ...service, status: "healthy" }))
      );
    }
  }, [scenario, setServices]);
}
