"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Ban,
  BarChart,
  CheckCircle,
  Eye,
  Layers,
  Lock,
  RefreshCw,
  Repeat,
  Search,
  Server,
  Settings,
  Shield,
  GitBranch as Split,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for the visualization
interface Service {
  id: string;
  name: string;
  position: { x: number; y: number };
  status: "healthy" | "degraded" | "unhealthy";
  requests: number;
  errors: number;
}

interface Proxy {
  id: string;
  serviceId: string;
  position: { x: number; y: number };
}

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

interface Request {
  id: number;
  source: string;
  target: string;
  status: "pending" | "success" | "error" | "rejected";
  type: "regular" | "retry" | "timeout" | "circuit-broken";
  position: { x: number; y: number };
  path: { x: number; y: number }[];
  currentPathIndex: number;
  timestamp: number;
  secured: boolean;
  // New fields for enhanced request information
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  protocol: "HTTP/1.1" | "HTTP/2" | "gRPC";
  priority: "high" | "medium" | "low";
  headers: { [key: string]: string };
  payload: RequestPayload;
  size: number; // Size in bytes (simulated)
  latency?: number; // Response time in ms
  traceId: string; // For distributed tracing
  // Service mesh specific properties
  canary?: boolean; // For Istio canary deployments
  autoRetry?: boolean; // For Linkerd automatic retries
  dynamicDiscovery?: boolean; // For Consul service discovery
  weightedRouting?: boolean; // For App Mesh weighted routing
}

interface Stats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
}

// Define service mesh types
type ServiceMeshType = "istio" | "linkerd" | "consul" | "app-mesh";

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
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={activeFeature === "traffic" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFeature("traffic")}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Gestion du Trafic
              </Button>
              <Button
                variant={activeFeature === "security" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFeature("security")}
                className="flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Sécurité
              </Button>
              <Button
                variant={
                  activeFeature === "observability" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setActiveFeature("observability")}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Observabilité
              </Button>
              <Button
                variant={
                  activeFeature === "control-plane" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setActiveFeature("control-plane")}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Plan de Contrôle
              </Button>
            </div>

            {/* Visualization Canvas */}
            <div className="relative w-full h-[500px] border rounded-lg bg-background/50 overflow-hidden">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 500"
                className="absolute inset-0"
              >
                {/* Control Plane (only visible when control-plane feature is active) */}
                {activeFeature === "control-plane" && (
                  <g>
                    {/* Control Plane Box */}
                    <rect
                      x="350"
                      y="50"
                      width="100"
                      height="60"
                      rx="5"
                      fill={
                        serviceMeshType === "istio"
                          ? "#e0f2fe"
                          : serviceMeshType === "linkerd"
                          ? "#f0fdf4"
                          : serviceMeshType === "consul"
                          ? "#fef3c7"
                          : "#fdf2f8"
                      }
                      stroke={
                        serviceMeshType === "istio"
                          ? "#3b82f6"
                          : serviceMeshType === "linkerd"
                          ? "#10b981"
                          : serviceMeshType === "consul"
                          ? "#f59e0b"
                          : "#ec4899"
                      }
                      strokeWidth="2"
                    />
                    <text
                      x="400"
                      y="75"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={
                        serviceMeshType === "istio"
                          ? "#3b82f6"
                          : serviceMeshType === "linkerd"
                          ? "#10b981"
                          : serviceMeshType === "consul"
                          ? "#f59e0b"
                          : "#ec4899"
                      }
                    >
                      {serviceMeshType === "istio"
                        ? "Istiod"
                        : serviceMeshType === "linkerd"
                        ? "Linkerd CP"
                        : serviceMeshType === "consul"
                        ? "Consul Server"
                        : "App Mesh CP"}
                    </text>
                    <text
                      x="400"
                      y="95"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                    >
                      Plan de Contrôle
                    </text>
                    <foreignObject x="385" y="55" width="30" height="30">
                      <div className="flex items-center justify-center w-full h-full">
                        <Settings className="w-6 h-6 text-slate-600" />
                      </div>
                    </foreignObject>

                    {/* Configuration Update Lines */}
                    {services.map((service) => {
                      const proxy = proxies.find(
                        (p) => p.serviceId === service.id
                      );
                      if (!proxy) return null;
                      return (
                        <g key={`config-${service.id}`}>
                          <path
                            d={`M 400,110 L ${proxy.position.x},${
                              proxy.position.y - 25
                            }`}
                            stroke={
                              serviceMeshType === "istio"
                                ? "#3b82f6"
                                : serviceMeshType === "linkerd"
                                ? "#10b981"
                                : serviceMeshType === "consul"
                                ? "#f59e0b"
                                : "#ec4899"
                            }
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            className="animate-pulse"
                          />
                          {/* Configuration Update Indicator */}
                          <circle
                            cx={proxy.position.x}
                            cy={proxy.position.y - 25}
                            r="3"
                            fill={
                              serviceMeshType === "istio"
                                ? "#3b82f6"
                                : serviceMeshType === "linkerd"
                                ? "#10b981"
                                : serviceMeshType === "consul"
                                ? "#f59e0b"
                                : "#ec4899"
                            }
                            className="animate-ping"
                          />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Services and their proxies */}
                {services.map((service) => {
                  const proxy = proxies.find((p) => p.serviceId === service.id);
                  return (
                    <g key={service.id}>
                      {/* Service */}
                      <rect
                        x={service.position.x - 70}
                        y={service.position.y - 40}
                        width="140"
                        height="80"
                        rx="5"
                        fill={
                          service.status === "healthy"
                            ? "#f1f5f9"
                            : service.status === "degraded"
                            ? "#fef3c7"
                            : "#fee2e2"
                        }
                        stroke={
                          service.status === "healthy"
                            ? "#94a3b8"
                            : service.status === "degraded"
                            ? "#f59e0b"
                            : "#ef4444"
                        }
                        strokeWidth="2"
                      />
                      <foreignObject
                        x={service.position.x - 20}
                        y={service.position.y - 35}
                        width="40"
                        height="40"
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          <Server className="w-7 h-7 text-slate-600" />
                        </div>
                      </foreignObject>
                      <rect
                        x={service.position.x - 65}
                        y={service.position.y + 10}
                        width="130"
                        height="20"
                        rx="3"
                        fill="#f8fafc"
                        stroke="none"
                      />
                      <text
                        x={service.position.x}
                        y={service.position.y + 24}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#1e293b"
                      >
                        {service.name}
                      </text>
                      <rect
                        x={service.position.x - 40}
                        y={service.position.y - 15}
                        width="80"
                        height="15"
                        rx="3"
                        fill="#f8fafc"
                        stroke="none"
                      />
                      <text
                        x={service.position.x}
                        y={service.position.y - 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill={
                          service.status === "healthy"
                            ? "#1e293b"
                            : service.status === "degraded"
                            ? "#f59e0b"
                            : "#ef4444"
                        }
                      >
                        {service.status === "healthy"
                          ? `Requêtes: ${service.requests}`
                          : service.status === "degraded"
                          ? "Dégradé"
                          : "Défaillant"}
                      </text>

                      {/* Proxy (Sidecar) */}
                      {proxy && (
                        <>
                          {/* Different proxy visualization based on service mesh type */}
                          {serviceMeshType === "istio" && (
                            <>
                              <rect
                                x={proxy.position.x - 25}
                                y={proxy.position.y - 25}
                                width="50"
                                height="50"
                                rx="5"
                                fill="#e0f2fe"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeDasharray={
                                  activeFeature === "security" ? "0" : "5,5"
                                }
                              />
                              <text
                                x={proxy.position.x}
                                y={proxy.position.y - 30}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#3b82f6"
                                fontWeight="bold"
                              >
                                Istio Envoy
                              </text>
                            </>
                          )}

                          {serviceMeshType === "linkerd" && (
                            <>
                              <rect
                                x={proxy.position.x - 25}
                                y={proxy.position.y - 25}
                                width="50"
                                height="50"
                                rx="25"
                                fill="#f0fdf4"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray={
                                  activeFeature === "security" ? "0" : "5,5"
                                }
                              />
                              <text
                                x={proxy.position.x}
                                y={proxy.position.y - 30}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#10b981"
                                fontWeight="bold"
                              >
                                Linkerd Proxy
                              </text>
                            </>
                          )}

                          {serviceMeshType === "consul" && (
                            <>
                              <polygon
                                points={`${proxy.position.x},${
                                  proxy.position.y - 25
                                } ${proxy.position.x + 25},${
                                  proxy.position.y
                                } ${proxy.position.x},${
                                  proxy.position.y + 25
                                } ${proxy.position.x - 25},${proxy.position.y}`}
                                fill="#fef3c7"
                                stroke="#f59e0b"
                                strokeWidth="2"
                                strokeDasharray={
                                  activeFeature === "security" ? "0" : "5,5"
                                }
                              />
                              <text
                                x={proxy.position.x}
                                y={proxy.position.y - 30}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#f59e0b"
                                fontWeight="bold"
                              >
                                Consul Proxy
                              </text>
                            </>
                          )}

                          {serviceMeshType === "app-mesh" && (
                            <>
                              <rect
                                x={proxy.position.x - 25}
                                y={proxy.position.y - 25}
                                width="50"
                                height="50"
                                rx="5"
                                fill="#fdf2f8"
                                stroke="#ec4899"
                                strokeWidth="2"
                                strokeDasharray={
                                  activeFeature === "security" ? "0" : "5,5"
                                }
                              />
                              <text
                                x={proxy.position.x}
                                y={proxy.position.y - 30}
                                textAnchor="middle"
                                fontSize="8"
                                fill="#ec4899"
                                fontWeight="bold"
                              >
                                App Mesh Envoy
                              </text>
                            </>
                          )}

                          <foreignObject
                            x={proxy.position.x - 12}
                            y={proxy.position.y - 12}
                            width="24"
                            height="24"
                          >
                            <div className="flex items-center justify-center w-full h-full">
                              {activeFeature === "traffic" && (
                                <RefreshCw className="w-5 h-5 text-blue-500" />
                              )}
                              {activeFeature === "security" && (
                                <Shield className="w-5 h-5 text-blue-500" />
                              )}
                              {activeFeature === "observability" && (
                                <Eye className="w-5 h-5 text-blue-500" />
                              )}
                              {activeFeature === "control-plane" && (
                                <Settings className="w-5 h-5 text-purple-500" />
                              )}
                            </div>
                          </foreignObject>
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Connection lines between services */}
                <path
                  d="M 190,150 L 360,100"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 190,150 L 360,250"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 440,100 L 610,150"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 440,250 L 610,150"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <path
                  d="M 440,250 L 610,300"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />

                {/* Requests */}
                {requests.map((request) => (
                  <g
                    key={request.id}
                    transform={`translate(${request.position.x}, ${request.position.y})`}
                    className="group"
                  >
                    {/* Request circle with method indicator */}
                    <circle
                      r="6"
                      fill={
                        request.status === "success"
                          ? "#10b981"
                          : request.status === "error"
                          ? "#ef4444"
                          : request.status === "rejected"
                          ? "#f59e0b"
                          : "#3b82f6"
                      }
                      opacity={
                        request.status === "success" ||
                        request.status === "error" ||
                        request.status === "rejected"
                          ? 0.5
                          : 1
                      }
                      strokeWidth={request.priority === "high" ? 1.5 : 0}
                      stroke={request.priority === "high" ? "#ef4444" : "none"}
                    />

                    {/* Method indicator */}
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="6"
                      fill="white"
                      fontWeight="bold"
                    >
                      {request.method.charAt(0)}
                    </text>

                    {/* Security indicator */}
                    {activeFeature === "security" && request.secured && (
                      <circle
                        r="9"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* Traffic management indicators */}
                    {activeFeature === "traffic" &&
                      request.type === "retry" && (
                        <circle
                          r="9"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1"
                        />
                      )}
                    {activeFeature === "traffic" &&
                      request.type === "circuit-broken" && (
                        <circle
                          r="9"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      )}

                    {/* Request tooltip */}
                    <foreignObject
                      x="-150"
                      y="-120"
                      width="300"
                      height="120"
                      style={{ pointerEvents: "none", opacity: 0 }}
                      className="group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border text-xs overflow-hidden">
                        <div className="font-semibold mb-1 flex justify-between">
                          <span>
                            {request.method} {request.target}
                          </span>
                          <span
                            className={`font-medium ${
                              request.status === "error"
                                ? "text-red-500"
                                : request.status === "success"
                                ? "text-green-500"
                                : request.status === "rejected"
                                ? "text-amber-500"
                                : "text-blue-500"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protocol:</span>
                          <span className="font-mono">{request.protocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{request.size} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <span
                            className={`font-medium ${
                              request.priority === "high"
                                ? "text-red-500"
                                : request.priority === "medium"
                                ? "text-amber-500"
                                : "text-gray-500"
                            }`}
                          >
                            {request.priority}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trace ID:</span>
                          <span className="font-mono text-[8px] truncate">
                            {request.traceId}
                          </span>
                        </div>
                        {request.secured && (
                          <div className="flex justify-between">
                            <span>Security:</span>
                            <span className="text-green-500">mTLS Enabled</span>
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>

              {/* Feature-specific overlays */}
              {activeFeature === "observability" && (
                <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
                  <div className="flex justify-between gap-4">
                    <span>Requêtes totales:</span>
                    <span className="font-medium">{stats.totalRequests}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Requêtes réussies:</span>
                    <span className="font-medium text-green-500">
                      {stats.successfulRequests}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Requêtes échouées:</span>
                    <span className="font-medium text-red-500">
                      {stats.failedRequests}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Latence moyenne:</span>
                    <span className="font-medium">
                      {stats.averageLatency} ms
                    </span>
                  </div>
                </div>
              )}

              {activeFeature === "security" && (
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>Communication sécurisée par mTLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Politiques d&apos;autorisation appliquées</span>
                  </div>
                </div>
              )}

              {activeFeature === "traffic" && (
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span>Équilibrage de charge actif</span>
                  </div>

                  {/* Service mesh specific traffic features */}
                  {serviceMeshType === "istio" && (
                    <div className="flex items-center gap-2">
                      <Split className="w-4 h-4 text-blue-500" />
                      <span>Canary Deployments</span>
                    </div>
                  )}

                  {serviceMeshType === "linkerd" && (
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-green-500" />
                      <span>Nouvelles tentatives automatiques</span>
                    </div>
                  )}

                  {serviceMeshType === "consul" && (
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-500" />
                      <span>Découverte de services dynamique</span>
                    </div>
                  )}

                  {serviceMeshType === "app-mesh" && (
                    <div className="flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-pink-500" />
                      <span>Routage pondéré</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Circuit breakers configurés</span>
                  </div>

                  {scenario === "high-load" && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>Charge élevée détectée</span>
                    </div>
                  )}

                  {scenario === "failure" && (
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-500" />
                      <span>Circuit breaker activé</span>
                    </div>
                  )}
                </div>
              )}

              {activeFeature === "control-plane" && (
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-500" />
                    <span>Plan de contrôle actif</span>
                  </div>

                  {/* Service mesh specific control plane features */}
                  {serviceMeshType === "istio" && (
                    <div className="flex items-center gap-2">
                      <Split className="w-4 h-4 text-blue-500" />
                      <span>Istiod - Configuration centralisée</span>
                    </div>
                  )}

                  {serviceMeshType === "linkerd" && (
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-green-500" />
                      <span>Linkerd Control Plane</span>
                    </div>
                  )}

                  {serviceMeshType === "consul" && (
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-500" />
                      <span>Consul Server</span>
                    </div>
                  )}

                  {serviceMeshType === "app-mesh" && (
                    <div className="flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-pink-500" />
                      <span>AWS App Mesh Control Plane</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Propagation des politiques</span>
                  </div>
                </div>
              )}
            </div>

            {/* Service Mesh Type Selector */}
            <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
              <span className="text-sm font-medium mr-2 self-center">
                Service Mesh Type:
              </span>
              <Button
                variant={serviceMeshType === "istio" ? "default" : "outline"}
                size="sm"
                onClick={() => setServiceMeshType("istio")}
                className="flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Istio
              </Button>
              <Button
                variant={serviceMeshType === "linkerd" ? "default" : "outline"}
                size="sm"
                onClick={() => setServiceMeshType("linkerd")}
                className="flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Linkerd
              </Button>
              <Button
                variant={serviceMeshType === "consul" ? "default" : "outline"}
                size="sm"
                onClick={() => setServiceMeshType("consul")}
                className="flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                Consul Connect
              </Button>
              <Button
                variant={serviceMeshType === "app-mesh" ? "default" : "outline"}
                size="sm"
                onClick={() => setServiceMeshType("app-mesh")}
                className="flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                AWS App Mesh
              </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 mt-4">
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
                  setRequests([]);
                  setStats({
                    totalRequests: 0,
                    successfulRequests: 0,
                    failedRequests: 0,
                    averageLatency: 0,
                  });
                  setServices(
                    services.map((service) => ({
                      ...service,
                      requests: 0,
                      errors: 0,
                    }))
                  );
                }}
              >
                Réinitialiser
              </Button>

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
          </TabsContent>

          <TabsContent value="explanation" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Qu&apos;est-ce qu&apos;un Service Mesh?
              </h3>
              <p className="text-muted-foreground">
                Un Service Mesh est une couche d&apos;infrastructure dédiée qui
                gère la communication entre les services dans une architecture
                de microservices. Il déplace la logique de communication du code
                de l&apos;application vers une couche d&apos;infrastructure,
                permettant aux développeurs de se concentrer sur la logique
                métier.
              </p>

              <h3 className="text-lg font-semibold mt-6">Composants Clés</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium">Proxies (Sidecars)</span> -
                  Petits serveurs proxy qui s&apos;exécutent à côté de chaque
                  service
                </li>
                <li>
                  <span className="font-medium">Plan de données</span> -
                  Ensemble des proxies qui gèrent le trafic réseau
                </li>
                <li>
                  <span className="font-medium">Plan de contrôle</span> -
                  Composant central qui configure et coordonne les proxies
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Plan de Contrôle</h3>
              <p className="text-muted-foreground">
                Le plan de contrôle est le cerveau du service mesh. Il gère la
                configuration, les politiques et la coordination de tous les
                proxies (sidecars) dans le plan de données.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "istio"
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700"
                  }`}
                >
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Istio (Istiod)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Istiod fournit la découverte de services, la configuration
                    et la gestion des certificats. Il convertit les règles de
                    haut niveau en configurations pour les proxies Envoy.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "linkerd"
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700"
                  }`}
                >
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Linkerd Control Plane
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Composé de plusieurs microservices spécialisés, il gère
                    l&apos;identité, les politiques de trafic et fournit une API
                    pour la configuration des proxies.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "consul"
                      ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700"
                  }`}
                >
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    Consul Server
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Fournit un registre de services, une configuration KV et des
                    règles d&apos;intention qui définissent quels services
                    peuvent communiquer entre eux.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "app-mesh"
                      ? "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700"
                  }`}
                >
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    AWS App Mesh
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Service géré par AWS qui configure les proxies Envoy,
                    s&apos;intègre avec les services AWS et fournit une gestion
                    centralisée du trafic.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                Fonctionnalités Principales
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <span className="font-medium">Gestion du trafic</span> -
                  Équilibrage de charge, routage, découverte de services,
                  contrôle de débit
                </li>
                <li>
                  <span className="font-medium">Sécurité</span> -
                  Authentification mutuelle TLS, autorisation, chiffrement
                </li>
                <li>
                  <span className="font-medium">Observabilité</span> -
                  Métriques, traces, journaux pour surveiller le comportement du
                  système
                </li>
                <li>
                  <span className="font-medium">Résilience</span> -
                  Disjoncteurs, nouvelles tentatives, délais d&apos;attente pour
                  améliorer la stabilité
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Avantages</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Séparation des préoccupations entre la logique métier et la
                  communication réseau
                </li>
                <li>
                  Cohérence des politiques de sécurité et de résilience dans
                  tout le système
                </li>
                <li>Visibilité accrue sur les interactions entre services</li>
                <li>
                  Facilité de mise à jour et de configuration sans modifier le
                  code des services
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">
                Implémentations Populaires
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "istio"
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-card border-border"
                  }`}
                >
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Istio
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Solution complète développée par Google, IBM et Lyft,
                    devenue un projet CNCF.
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
                    <li>Gestion avancée du trafic avec canary deployments</li>
                    <li>Sécurité robuste avec mTLS automatique</li>
                    <li>Observabilité intégrée avec Prometheus et Grafana</li>
                    <li>Circuit breaking et fault injection</li>
                    <li>
                      Support pour WebAssembly (Wasm) pour des extensions
                      personnalisées
                    </li>
                  </ul>
                  <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                    <span className="font-medium">Architecture:</span> Istiod
                    (plan de contrôle) + Envoy (proxies sidecar)
                    <br />
                    <span className="font-medium">Cas d&apos;usage:</span>{" "}
                    Grands clusters Kubernetes avec besoins avancés
                    <br />
                    <span className="font-medium">Complexité:</span> Élevée,
                    mais offre le plus de fonctionnalités
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "linkerd"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-card border-border"
                  }`}
                >
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Linkerd
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Solution légère et facile à utiliser par Buoyant, projet
                    CNCF gradué.
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
                    <li>
                      Faible empreinte mémoire et CPU (10x plus léger
                      qu&apos;Istio)
                    </li>
                    <li>
                      Retries automatiques basés sur la latence et le taux
                      d&apos;erreur
                    </li>
                    <li>Proxy écrit en Rust pour des performances optimales</li>
                    <li>Installation et configuration simplifiées</li>
                    <li>
                      Mesures de latence précises avec histogrammes haute
                      résolution
                    </li>
                  </ul>
                  <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                    <span className="font-medium">Architecture:</span> Control
                    plane multi-composants + linkerd-proxy (sidecar)
                    <br />
                    <span className="font-medium">Cas d&apos;usage:</span>{" "}
                    Clusters où la simplicité et les performances sont
                    prioritaires
                    <br />
                    <span className="font-medium">Complexité:</span> Faible,
                    facile à adopter et à maintenir
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "consul"
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      : "bg-card border-border"
                  }`}
                >
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    Consul Connect
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Solution par HashiCorp intégrée à Consul, fonctionne au-delà
                    de Kubernetes.
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
                    <li>
                      Découverte de services native et gestion de configuration
                    </li>
                    <li>
                      Contrôle d&apos;accès basé sur les intentions
                      (service-to-service)
                    </li>
                    <li>
                      Fonctionne dans des environnements multi-cloud et hybrides
                    </li>
                    <li>
                      Intégration avec l&apos;écosystème HashiCorp (Vault,
                      Nomad, etc.)
                    </li>
                    <li>Support pour les applications non-conteneurisées</li>
                  </ul>
                  <div className="text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-800">
                    <span className="font-medium">Architecture:</span> Consul
                    servers (control plane) + Envoy (data plane)
                    <br />
                    <span className="font-medium">Cas d&apos;usage:</span>{" "}
                    Environnements hétérogènes (VMs, K8s, bare metal)
                    <br />
                    <span className="font-medium">Complexité:</span> Moyenne,
                    plus complexe que Linkerd mais plus flexible
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    serviceMeshType === "app-mesh"
                      ? "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800"
                      : "bg-card border-border"
                  }`}
                >
                  <h4 className="font-medium text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    AWS App Mesh
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Solution native pour AWS basée sur Envoy, entièrement gérée
                    par AWS.
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 mb-3">
                    <li>
                      Intégration native avec les services AWS (ECS, EKS, EC2,
                      etc.)
                    </li>
                    <li>
                      Routage pondéré pour les déploiements progressifs
                      (blue/green, canary)
                    </li>
                    <li>Observabilité avec AWS X-Ray et CloudWatch</li>
                    <li>Configuration via AWS Cloud Formation ou CDK</li>
                    <li>Facturation basée sur les ressources utilisées</li>
                  </ul>
                  <div className="text-xs bg-pink-50 dark:bg-pink-900/20 p-2 rounded border border-pink-100 dark:border-pink-800">
                    <span className="font-medium">Architecture:</span> Service
                    AWS géré (control plane) + Envoy (sidecar)
                    <br />
                    <span className="font-medium">Cas d&apos;usage:</span>{" "}
                    Applications exécutées sur AWS uniquement
                    <br />
                    <span className="font-medium">Complexité:</span> Moyenne,
                    simplifiée par l&apos;intégration AWS
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                Comparaison des Implémentations
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="p-2 text-left border">Critère</th>
                      <th className="p-2 text-left border text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Istio
                        </div>
                      </th>
                      <th className="p-2 text-left border text-green-600 dark:text-green-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Linkerd
                        </div>
                      </th>
                      <th className="p-2 text-left border text-amber-600 dark:text-amber-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          Consul Connect
                        </div>
                      </th>
                      <th className="p-2 text-left border text-pink-600 dark:text-pink-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          AWS App Mesh
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium">Proxy utilisé</td>
                      <td className="p-2 border">Envoy</td>
                      <td className="p-2 border">linkerd-proxy (Rust)</td>
                      <td className="p-2 border">Envoy</td>
                      <td className="p-2 border">Envoy</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                      <td className="p-2 border font-medium">
                        Empreinte mémoire
                      </td>
                      <td className="p-2 border">Haute</td>
                      <td className="p-2 border">Très basse</td>
                      <td className="p-2 border">Moyenne</td>
                      <td className="p-2 border">Moyenne</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">
                        Facilité d&apos;installation
                      </td>
                      <td className="p-2 border">Complexe</td>
                      <td className="p-2 border">Simple</td>
                      <td className="p-2 border">Moyenne</td>
                      <td className="p-2 border">Simple (sur AWS)</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                      <td className="p-2 border font-medium">
                        Fonctionnalités
                      </td>
                      <td className="p-2 border">Très complètes</td>
                      <td className="p-2 border">Essentielles</td>
                      <td className="p-2 border">Complètes</td>
                      <td className="p-2 border">Limitées à AWS</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Environnements</td>
                      <td className="p-2 border">Kubernetes</td>
                      <td className="p-2 border">Kubernetes</td>
                      <td className="p-2 border">K8s, VMs, bare metal</td>
                      <td className="p-2 border">ECS, EKS, EC2</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                      <td className="p-2 border font-medium">Extensibilité</td>
                      <td className="p-2 border">Excellente (WebAssembly)</td>
                      <td className="p-2 border">Limitée</td>
                      <td className="p-2 border">Bonne</td>
                      <td className="p-2 border">Limitée</td>
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium">Communauté</td>
                      <td className="p-2 border">Très large</td>
                      <td className="p-2 border">Active</td>
                      <td className="p-2 border">Moyenne</td>
                      <td className="p-2 border">Limitée</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                Leçons Apprises et Bonnes Pratiques
              </h3>
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Déploiement et Adoption
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    L&apos;adoption d&apos;un service mesh doit être progressive
                    et planifiée avec soin.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
                    <pre className="text-xs">{`# Exemple d'installation d'Istio avec un profil de base
$ istioctl install --set profile=default

# Activation de l'injection automatique des sidecars pour un namespace
$ kubectl label namespace mon-app istio-injection=enabled

# Vérification du déploiement
$ istioctl analyze`}</pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Sécurisation du Trafic
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    La mise en place du mTLS est essentielle mais nécessite une
                    configuration appropriée.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
                    <pre className="text-xs">{`# Configuration mTLS pour Istio (PeerAuthentication)
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT  # Options: DISABLE, PERMISSIVE, STRICT`}</pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                    Gestion du Trafic Avancée
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Les déploiements canary et le traffic splitting permettent
                    des mises à jour sans risque.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
                    <pre className="text-xs">{`# VirtualService Istio pour un déploiement canary
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: mon-service
spec:
  hosts:
  - mon-service
  http:
  - route:
    - destination:
        host: mon-service
        subset: v1
      weight: 80
    - destination:
        host: mon-service
        subset: v2
      weight: 20`}</pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    Observabilité et Monitoring
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    L&apos;intégration avec des outils de monitoring est
                    cruciale pour tirer pleinement parti du service mesh.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-3 border text-xs font-mono overflow-x-auto">
                    <pre className="text-xs">{`# Exemple de requête Prometheus pour les métriques Istio
rate(istio_requests_total{destination_service="mon-service.mon-namespace.svc.cluster.local"}[5m])

# Exemple de requête pour le taux d'erreur
sum(rate(istio_requests_total{destination_service="mon-service.mon-namespace.svc.cluster.local",response_code=~"5.*"}[5m])) / sum(rate(istio_requests_total{destination_service="mon-service.mon-namespace.svc.cluster.local"}[5m]))`}</pre>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Pièges Courants à Éviter
                  </h4>
                  <ul className="text-sm space-y-2 list-disc pl-5 text-muted-foreground">
                    <li>
                      <span className="font-medium">
                        Surcharge de configuration
                      </span>{" "}
                      - Commencer simple et ajouter des fonctionnalités
                      progressivement
                    </li>
                    <li>
                      <span className="font-medium">
                        Overhead de performance
                      </span>{" "}
                      - Surveiller l&apos;impact des sidecars sur la latence et
                      les ressources
                    </li>
                    <li>
                      <span className="font-medium">Dépendance excessive</span>{" "}
                      - Avoir un plan de secours en cas de défaillance du
                      service mesh
                    </li>
                    <li>
                      <span className="font-medium">Manque de formation</span> -
                      S&apos;assurer que l&apos;équipe comprend bien le
                      fonctionnement du service mesh
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4 text-indigo-500" />
                    Études de Cas Réelles
                  </h4>
                  <div className="space-y-4">
                    <div className="rounded-md border p-3">
                      <h5 className="text-sm font-medium mb-1 text-indigo-600 dark:text-indigo-400">
                        Airbnb avec Istio
                      </h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        Airbnb a déployé Istio pour gérer plus de 1000
                        microservices. Ils ont utilisé une approche progressive:
                      </p>
                      <ul className="text-xs list-disc pl-4 text-muted-foreground">
                        <li>
                          Déploiement initial en mode PERMISSIVE pour le mTLS
                        </li>
                        <li>Migration progressive vers le mode STRICT</li>
                        <li>
                          Utilisation des Virtual Services pour le canary
                          testing
                        </li>
                        <li>
                          Intégration avec leur pipeline CI/CD pour automatiser
                          les déploiements
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-md border p-3">
                      <h5 className="text-sm font-medium mb-1 text-green-600 dark:text-green-400">
                        Nordstrom avec Linkerd
                      </h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        Nordstrom a choisi Linkerd pour sa légèreté et sa
                        simplicité. Résultats obtenus:
                      </p>
                      <ul className="text-xs list-disc pl-4 text-muted-foreground">
                        <li>
                          Réduction de 99.9% des erreurs grâce aux retries
                          automatiques
                        </li>
                        <li>
                          Amélioration de la latence de 10x dans certains cas
                        </li>
                        <li>
                          Visibilité accrue sur les dépendances entre services
                        </li>
                        <li>
                          Temps d&apos;adoption réduit grâce à la simplicité de
                          configuration
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-md border p-3">
                      <h5 className="text-sm font-medium mb-1 text-amber-600 dark:text-amber-400">
                        HashiCorp avec Consul Connect
                      </h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        HashiCorp utilise naturellement Consul Connect pour ses
                        propres services internes:
                      </p>
                      <ul className="text-xs list-disc pl-4 text-muted-foreground">
                        <li>
                          Environnement hybride combinant Kubernetes et VMs
                        </li>
                        <li>
                          Intégration avec Vault pour la gestion des secrets
                        </li>
                        <li>
                          Utilisation des intentions pour un contrôle
                          d&apos;accès granulaire
                        </li>
                        <li>
                          Découverte de services automatique entre différents
                          environnements
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Service Mesh vs API Gateway
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Service Mesh</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        Gère la communication <strong>service-à-service</strong>{" "}
                        interne
                      </li>
                      <li>Fonctionne comme une infrastructure invisible</li>
                      <li>Utilise des proxies sidecar pour chaque service</li>
                      <li>
                        Focus sur la résilience, l&apos;observabilité et la
                        sécurité
                      </li>
                      <li>Généralement déployé dans un cluster Kubernetes</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">API Gateway</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>
                        Gère la communication <strong>client-à-service</strong>{" "}
                        externe
                      </li>
                      <li>
                        Point d&apos;entrée unique pour les clients externes
                      </li>
                      <li>Fonctionne comme un reverse proxy centralisé</li>
                      <li>
                        Focus sur le routage, l&apos;authentification et la
                        limitation de débit
                      </li>
                      <li>Peut être déployé à la périphérie du réseau</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Service Mesh vs ESB</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Service Mesh</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Architecture décentralisée</li>
                      <li>Pas de transformation de données</li>
                      <li>Proxies légers et spécialisés</li>
                      <li>Conçu pour les microservices natifs cloud</li>
                      <li>Séparation du plan de données et de contrôle</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Enterprise Service Bus (ESB)
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Architecture centralisée (hub-and-spoke)</li>
                      <li>Transformation et orchestration des données</li>
                      <li>Composant monolithique lourd</li>
                      <li>Conçu pour les applications monolithiques</li>
                      <li>Point unique de défaillance potentiel</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                      <th className="p-2 text-left border text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Istio
                        </div>
                      </th>
                      <th className="p-2 text-left border text-green-600 dark:text-green-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Linkerd
                        </div>
                      </th>
                      <th className="p-2 text-left border text-amber-600 dark:text-amber-400">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          Consul Connect
                        </div>
                      </th>
                      <th className="p-2 text-left border text-pink-600 dark:text-pink-400">
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
                  <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
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

                  <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
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

                  <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
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

                <div className="mt-4 p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/20">
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
