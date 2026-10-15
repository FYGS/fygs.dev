"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceMeshComparison } from "./service-mesh/service-mesh-comparison";
import { ServiceMeshExplanation } from "./service-mesh/service-mesh-explanation";
import { SimulationControls } from "./service-mesh/simulation-controls";
import { MeshTypeSelector } from "./service-mesh/mesh-type-selector";
import { MeshCanvas } from "./service-mesh/mesh-canvas";
import { FeatureSelector } from "./service-mesh/feature-selector";
import type {
  Service,
  Proxy,
  Request,
  Stats,
  ServiceMeshType,
} from "./service-mesh/types";

export function ServiceMeshVisualization() {
  const [activeTab, setActiveTab] = useState("visualization");
  const [activeFeature, setActiveFeature] = useState<
    "traffic" | "security" | "observability" | "control-plane"
  >("traffic");
  const [serviceMeshType, setServiceMeshType] =
    useState<ServiceMeshType>("istio");

  // Initialize services
  const [services, setServices] = useState<Service[]>([
    {
      id: "frontend",
      name: "Frontend",
      position: { x: 150, y: 150 },
      status: "healthy",
      requests: 0,
      errors: 0,
    },
    {
      id: "auth",
      name: "Auth Service",
      position: { x: 400, y: 100 },
      status: "healthy",
      requests: 0,
      errors: 0,
    },
    {
      id: "users",
      name: "User Service",
      position: { x: 400, y: 250 },
      status: "healthy",
      requests: 0,
      errors: 0,
    },
    {
      id: "products",
      name: "Product Service",
      position: { x: 650, y: 150 },
      status: "healthy",
      requests: 0,
      errors: 0,
    },
    {
      id: "orders",
      name: "Order Service",
      position: { x: 650, y: 300 },
      status: "healthy",
      requests: 0,
      errors: 0,
    },
  ]);

  // Initialize proxies (sidecars)
  const [proxies] = useState<Proxy[]>(
    services.map((service) => ({
      id: `${service.id}-proxy`,
      serviceId: service.id,
      position: {
        x: service.position.x + 40,
        y: service.position.y,
      },
    }))
  );

  // Initialize requests
  const [requests, setRequests] = useState<Request[]>([]);

  // Initialize stats
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
  });

  // Refs for animation
  const requestIdRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastRequestTimeRef = useRef(0);
  const latenciesRef = useRef<number[]>([]);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<"normal" | "high-load" | "failure">(
    "normal"
  );

  // Define payload types for different services
  interface AuthPayload {
    username?: string;
    password?: string;
    rememberMe?: boolean;
    token?: string;
    expiresIn?: number;
  }

  interface UserPayload {
    userId?: string;
    includeOrders?: boolean;
    name?: string;
    email?: string;
    role?: string;
    fields?: string[];
  }

  interface ProductPayload {
    category?: string;
    limit?: number;
    sort?: string;
    name?: string;
    price?: number;
    description?: string;
    inStock?: boolean;
    productId?: string;
    fields?: string[];
  }

  interface OrderPayload {
    userId?: string;
    status?: string;
    limit?: number;
    items?: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: {
      street: string;
      city: string;
      zipCode: string;
    };
    paymentMethod?: string;
    orderId?: string;
  }

  interface DefaultPayload {
    timestamp?: string;
    requestId?: string;
  }

  // Union type for all possible payloads
  type RequestPayload =
    | AuthPayload
    | UserPayload
    | ProductPayload
    | OrderPayload
    | DefaultPayload;

  // Helper function to generate request payload based on method and target service wrapped in useCallback
  const generateRequestPayload = useCallback(
    (
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      targetService: string
    ): RequestPayload => {
      switch (targetService) {
        case "auth":
          if (method === "POST") {
            return {
              username: `user${Math.floor(Math.random() * 1000)}`,
              password: "********",
              rememberMe: Math.random() > 0.5,
            };
          } else {
            return {
              token: `jwt-${Math.random().toString(36).substring(2, 15)}`,
              expiresIn: 3600,
            };
          }
        case "users":
          if (method === "GET") {
            return {
              userId: `usr-${Math.floor(Math.random() * 10000)}`,
              includeOrders: Math.random() > 0.5,
            };
          } else if (method === "POST") {
            return {
              name: `User ${Math.floor(Math.random() * 1000)}`,
              email: `user${Math.floor(Math.random() * 1000)}@example.com`,
              role: Math.random() > 0.8 ? "admin" : "user",
            };
          } else {
            return {
              userId: `usr-${Math.floor(Math.random() * 10000)}`,
              fields: ["name", "email", "preferences"],
            };
          }
        case "products":
          if (method === "GET") {
            return {
              category: ["electronics", "clothing", "books", "home"][
                Math.floor(Math.random() * 4)
              ],
              limit: Math.floor(Math.random() * 50) + 10,
              sort: Math.random() > 0.5 ? "price" : "popularity",
            };
          } else if (method === "POST") {
            return {
              name: `Product ${Math.floor(Math.random() * 1000)}`,
              price: Math.floor(Math.random() * 10000) / 100,
              description: "A new product description",
              category: ["electronics", "clothing", "books", "home"][
                Math.floor(Math.random() * 4)
              ],
              inStock: Math.random() > 0.2,
            };
          } else {
            return {
              productId: `prod-${Math.floor(Math.random() * 10000)}`,
              fields: ["price", "inStock", "description"],
            };
          }
        case "orders":
          if (method === "GET") {
            return {
              userId: `usr-${Math.floor(Math.random() * 10000)}`,
              status: ["pending", "processing", "shipped", "delivered"][
                Math.floor(Math.random() * 4)
              ],
              limit: Math.floor(Math.random() * 10) + 5,
            };
          } else if (method === "POST") {
            return {
              userId: `usr-${Math.floor(Math.random() * 10000)}`,
              items: Array(Math.floor(Math.random() * 5) + 1)
                .fill(0)
                .map(() => ({
                  productId: `prod-${Math.floor(Math.random() * 10000)}`,
                  quantity: Math.floor(Math.random() * 5) + 1,
                  price: Math.floor(Math.random() * 10000) / 100,
                })),
              shippingAddress: {
                street: "123 Main St",
                city: "Anytown",
                zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
              },
              paymentMethod: ["credit_card", "paypal", "bank_transfer"][
                Math.floor(Math.random() * 3)
              ],
            };
          } else {
            return {
              orderId: `ord-${Math.floor(Math.random() * 10000)}`,
              status: ["processing", "shipped", "delivered"][
                Math.floor(Math.random() * 3)
              ],
            };
          }
        default:
          return {
            timestamp: new Date().toISOString(),
            requestId: `req-${Math.floor(Math.random() * 1000000)}`,
          };
      }
    },
    []
  );

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

  // Animation logic
  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Get request interval based on scenario - moved inside useEffect
    const getRequestInterval = (): number => {
      switch (scenario) {
        case "normal":
          return 1000; // 1 request per second
        case "high-load":
          return 300; // ~3 requests per second
        case "failure":
          return 800; // ~1.25 requests per second
        default:
          return 1000;
      }
    };

    // Generate a new request - moved inside useEffect
    const generateRequest = () => {
      // Define possible request paths
      const requestPaths = [
        { source: "frontend", target: "auth" },
        { source: "frontend", target: "users" },
        { source: "frontend", target: "products" },
        { source: "auth", target: "users" },
        { source: "users", target: "products" },
        { source: "users", target: "orders" },
        { source: "products", target: "orders" },
      ];

      // Apply service mesh specific routing patterns
      let requestPath: {
        source: string;
        target: string;
        canary?: boolean;
        autoRetry?: boolean;
        dynamicDiscovery?: boolean;
        weightedRouting?: boolean;
      };

      // Initialize with a default path to avoid uninitialized variable
      requestPath = { ...requestPaths[0] };

      if (serviceMeshType === "istio") {
        // Istio supports traffic splitting/canary deployments
        // For products service, we'll simulate a canary deployment with 20% traffic to a new version
        if (Math.random() < 0.2 && scenario !== "failure") {
          // Simulate canary routing to a "new version" of products
          requestPath = {
            source: "frontend",
            target: "products",
            canary: true,
          };
        } else {
          const basePath =
            requestPaths[Math.floor(Math.random() * requestPaths.length)];
          requestPath = { ...basePath };
        }
      } else if (serviceMeshType === "linkerd") {
        // Linkerd is known for its automatic retries and latency-aware load balancing
        const basePath =
          requestPaths[Math.floor(Math.random() * requestPaths.length)];
        requestPath = { ...basePath };
        // Increase chance of retry for Linkerd
        if (Math.random() < 0.3 && activeFeature === "traffic") {
          requestPath.autoRetry = true;
        }
      } else if (serviceMeshType === "consul") {
        // Consul Connect is known for service discovery and intention-based access control
        const basePath =
          requestPaths[Math.floor(Math.random() * requestPaths.length)];
        requestPath = { ...basePath };
        // Simulate service discovery with occasional connection to new services
        if (Math.random() < 0.15) {
          requestPath.dynamicDiscovery = true;
        }
      } else if (serviceMeshType === "app-mesh") {
        // AWS App Mesh focuses on application-level traffic control
        // Simulate weighted routing
        const weights = [
          { path: { source: "frontend", target: "auth" }, weight: 0.3 },
          { path: { source: "frontend", target: "users" }, weight: 0.3 },
          { path: { source: "frontend", target: "products" }, weight: 0.4 },
        ];

        const rand = Math.random();
        let cumulativeWeight = 0;

        for (const entry of weights) {
          cumulativeWeight += entry.weight;
          if (rand <= cumulativeWeight) {
            requestPath = entry.path;
            break;
          }
        }

        // If no weighted path was selected, use a random one
        if (!requestPath) {
          const basePath =
            requestPaths[Math.floor(Math.random() * requestPaths.length)];
          requestPath = { ...basePath };
        }
      } else {
        // Default random selection
        const basePath =
          requestPaths[Math.floor(Math.random() * requestPaths.length)];
        requestPath = { ...basePath };
      }

      // Get source and target services
      const sourceService = getServiceById(requestPath.source);
      const targetService = getServiceById(requestPath.target);

      if (!sourceService || !targetService) return;

      // Get source and target proxies
      const sourceProxy = getProxyByServiceId(requestPath.source);
      const targetProxy = getProxyByServiceId(requestPath.target);

      if (!sourceProxy || !targetProxy) return;

      // Create path for the request
      const path: { x: number; y: number }[] = [];

      // Start at the source service
      path.push({ ...sourceService.position });

      // Go to the source proxy
      path.push({ ...sourceProxy.position });

      // Go to the target proxy
      path.push({ ...targetProxy.position });

      // End at the target service
      path.push({ ...targetService.position });

      // Determine if the request will be secured (for security feature)
      const secured =
        activeFeature === "security" ? Math.random() > 0.2 : false;

      // Determine request type (for traffic management feature)
      let requestType: "regular" | "retry" | "timeout" | "circuit-broken" =
        "regular";
      if (activeFeature === "traffic") {
        const rand = Math.random();
        if (rand > 0.9) requestType = "timeout";
        else if (rand > 0.8) requestType = "retry";
        else if (rand > 0.7) requestType = "circuit-broken";
      }

      // Generate request method based on source and target
      const methods: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH"> = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
      ];
      let method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

      // Determine method based on service types
      if (requestPath.source === "frontend" && requestPath.target === "auth") {
        method = "POST"; // Login/authentication requests
      } else if (requestPath.target === "products") {
        method = Math.random() > 0.7 ? "POST" : "GET"; // Product creation or retrieval
      } else if (requestPath.target === "orders") {
        method = Math.random() > 0.3 ? "POST" : "GET"; // Order creation or retrieval
      } else {
        method = methods[Math.floor(Math.random() * methods.length)];
      }

      // Generate protocol based on service mesh type
      const protocol =
        serviceMeshType === "istio" || serviceMeshType === "app-mesh"
          ? Math.random() > 0.3
            ? "HTTP/2"
            : "gRPC"
          : "HTTP/1.1";

      // Generate priority
      const priorities: Array<"high" | "medium" | "low"> = [
        "high",
        "medium",
        "low",
      ];
      const priority =
        priorities[Math.floor(Math.random() * priorities.length)];

      // Generate headers
      const headers: { [key: string]: string } = {
        "Content-Type":
          method === "GET" ? "application/json" : "application/json",
        "User-Agent": "ServiceMesh-Demo/1.0",
        "X-Request-ID": `req-${Math.floor(Math.random() * 1000000)}`,
      };

      // Add service mesh specific headers
      if (serviceMeshType === "istio") {
        headers["x-b3-traceid"] = `${Date.now().toString(16)}${Math.floor(
          Math.random() * 1000000
        ).toString(16)}`;
        headers["x-b3-spanid"] = Math.floor(Math.random() * 1000000).toString(
          16
        );
      } else if (serviceMeshType === "linkerd") {
        headers[
          "l5d-dst-service"
        ] = `${requestPath.target}.default.svc.cluster.local`;
      }

      // Generate payload based on method and target service
      const payload = generateRequestPayload(method, requestPath.target);

      // Generate trace ID for distributed tracing
      const traceId = `trace-${Date.now().toString(16)}-${Math.floor(
        Math.random() * 1000000
      ).toString(16)}`;

      // Simulate request size based on payload complexity
      const size =
        method === "GET"
          ? Math.floor(100 + Math.random() * 200)
          : Math.floor(200 + Math.random() * 800);

      // Create the new request
      const newRequest: Request = {
        id: requestIdRef.current++,
        source: requestPath.source,
        target: requestPath.target,
        status: "pending",
        type: requestType,
        position: { ...path[0] },
        path,
        currentPathIndex: 0,
        timestamp: Date.now(),
        secured,
        // New fields
        method,
        protocol,
        priority,
        headers,
        payload,
        size,
        traceId,
      };

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
      if (timestamp - lastRequestTimeRef.current > getRequestInterval()) {
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
    generateRequestPayload,
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
  }, [scenario]);

  // getRequestInterval function moved inside useEffect

  // generateRequest function moved inside useEffect

  // processRequests function moved inside useEffect

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Architecture Service Mesh
        </CardTitle>
        <CardDescription>
          Découvrez comment un maillage de services gère la communication, la
          sécurité et l&apos;observabilité entre microservices
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="explanation">Explication</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-6">
            {/* Feature Selection */}
            <FeatureSelector activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

            {/* Visualization Canvas */}
            <MeshCanvas activeFeature={activeFeature} proxies={proxies} requests={requests} scenario={scenario} serviceMeshType={serviceMeshType} services={services} stats={stats} />

            {/* Service Mesh Type Selector */}
            <MeshTypeSelector serviceMeshType={serviceMeshType} setServiceMeshType={setServiceMeshType} />

            {/* Controls */}
            <SimulationControls isRunning={isRunning} scenario={scenario} services={services} setIsRunning={setIsRunning} setRequests={setRequests} setScenario={setScenario} setServices={setServices} setStats={setStats} />
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <ServiceMeshExplanation serviceMeshType={serviceMeshType} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <ServiceMeshComparison />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Comparaison des Implémentations
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left border">Critère</th>
                      <th className="p-2 text-left border text-blue-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Istio
                        </div>
                      </th>
                      <th className="p-2 text-left border text-green-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Linkerd
                        </div>
                      </th>
                      <th className="p-2 text-left border text-amber-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          Consul Connect
                        </div>
                      </th>
                      <th className="p-2 text-left border text-pink-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          AWS App Mesh
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">Architecture</td>
                      <td className="p-2 border">Istiod (monolithique)</td>
                      <td className="p-2 border">Microservices</td>
                      <td className="p-2 border">Agent + serveur central</td>
                      <td className="p-2 border">Service AWS géré</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Langage</td>
                      <td className="p-2 border">Go</td>
                      <td className="p-2 border">
                        Rust (data plane), Go (control plane)
                      </td>
                      <td className="p-2 border">Go</td>
                      <td className="p-2 border">N/A (service géré)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Proxy</td>
                      <td className="p-2 border">Envoy</td>
                      <td className="p-2 border">linkerd-proxy (custom)</td>
                      <td className="p-2 border">Envoy</td>
                      <td className="p-2 border">Envoy</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">Environnements</td>
                      <td className="p-2 border">Kubernetes</td>
                      <td className="p-2 border">Kubernetes</td>
                      <td className="p-2 border">K8s, VMs, bare metal</td>
                      <td className="p-2 border">ECS, EKS, EC2</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Complexité</td>
                      <td className="p-2 border">Élevée</td>
                      <td className="p-2 border">Faible</td>
                      <td className="p-2 border">Moyenne</td>
                      <td className="p-2 border">
                        Moyenne (simplifiée par AWS)
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-2 border font-medium">
                        Empreinte mémoire
                      </td>
                      <td className="p-2 border">~50MB par proxy</td>
                      <td className="p-2 border">~10MB par proxy</td>
                      <td className="p-2 border">~40MB par proxy</td>
                      <td className="p-2 border">~45MB par proxy</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Extensibilité</td>
                      <td className="p-2 border">WebAssembly</td>
                      <td className="p-2 border">Limitée</td>
                      <td className="p-2 border">Plugins Envoy</td>
                      <td className="p-2 border">Limitée</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Résultats et Performances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-blue-900/20 border-blue-800">
                    <h4 className="font-medium text-blue-400 mb-2">
                      Latence
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sans Service Mesh</span>
                        <span className="font-medium text-sm">~1ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Linkerd</span>
                        <span className="font-medium text-sm">+0.9ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Istio</span>
                        <span className="font-medium text-sm">+3-5ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Consul Connect</span>
                        <span className="font-medium text-sm">+2-4ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AWS App Mesh</span>
                        <span className="font-medium text-sm">+3-5ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-green-900/20 border-green-800">
                    <h4 className="font-medium text-green-400 mb-2">
                      Utilisation CPU
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sans Service Mesh</span>
                        <span className="font-medium text-sm">Référence</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Linkerd</span>
                        <span className="font-medium text-sm">+5-10%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Istio</span>
                        <span className="font-medium text-sm">+15-30%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Consul Connect</span>
                        <span className="font-medium text-sm">+10-20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AWS App Mesh</span>
                        <span className="font-medium text-sm">+15-25%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-amber-900/20 border-amber-800">
                    <h4 className="font-medium text-amber-400 mb-2">
                      Mémoire
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sans Service Mesh</span>
                        <span className="font-medium text-sm">Référence</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Linkerd</span>
                        <span className="font-medium text-sm">+10MB/pod</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Istio</span>
                        <span className="font-medium text-sm">
                          +40-50MB/pod
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Consul Connect</span>
                        <span className="font-medium text-sm">
                          +30-40MB/pod
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AWS App Mesh</span>
                        <span className="font-medium text-sm">
                          +35-45MB/pod
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg border bg-slate-900/20">
                  <h4 className="font-medium mb-2">Conclusions</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      <strong>Linkerd</strong> offre les meilleures performances
                      mais moins de fonctionnalités
                    </li>
                    <li>
                      <strong>Istio</strong> a l&apos;empreinte la plus lourde
                      mais le plus de fonctionnalités
                    </li>
                    <li>
                      <strong>Consul Connect</strong> est un bon compromis avec
                      une meilleure compatibilité multi-environnement
                    </li>
                    <li>
                      <strong>AWS App Mesh</strong> offre une intégration native
                      avec les services AWS et une expérience simplifiée
                    </li>
                    <li>
                      L&apos;impact sur la latence est généralement acceptable
                      pour la plupart des applications
                    </li>
                    <li>
                      Le coût en ressources doit être pris en compte dans le
                      dimensionnement du cluster
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
