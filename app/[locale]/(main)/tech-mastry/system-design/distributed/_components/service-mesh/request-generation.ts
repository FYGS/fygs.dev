import { generateRequestPayload } from "./request-payload";
import type { Proxy, Request, Service, ServiceMeshType } from "./types";

export type MeshScenario = "normal" | "high-load" | "failure";
export type MeshFeature = "traffic" | "security" | "observability" | "control-plane";

export interface RequestPathChoice {
  source: string;
  target: string;
  canary?: boolean;
  autoRetry?: boolean;
  dynamicDiscovery?: boolean;
  weightedRouting?: boolean;
}

// Get request interval based on scenario
export function getRequestInterval(scenario: MeshScenario): number {
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
}

// Choose the source/target of a new request, applying service mesh specific routing patterns
export function selectRequestPath(
  serviceMeshType: ServiceMeshType,
  scenario: MeshScenario,
  activeFeature: MeshFeature
): RequestPathChoice {
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

    // The weights sum to 1 and Math.random() is below 1, so a path is always selected
    const rand = Math.random();
    let cumulativeWeight = 0;

    for (const entry of weights) {
      cumulativeWeight += entry.weight;
      if (rand <= cumulativeWeight) {
        requestPath = entry.path;
        break;
      }
    }
  } else {
    // Default random selection
    const basePath =
      requestPaths[Math.floor(Math.random() * requestPaths.length)];
    requestPath = { ...basePath };
  }

  return requestPath;
}

export interface CreateRequestParams {
  id: number;
  requestPath: RequestPathChoice;
  sourceService: Service;
  targetService: Service;
  sourceProxy: Proxy;
  targetProxy: Proxy;
  activeFeature: MeshFeature;
  serviceMeshType: ServiceMeshType;
}

// Build a new request travelling service -> proxy -> proxy -> service
export function createRequest({
  id,
  requestPath,
  sourceService,
  targetService,
  sourceProxy,
  targetProxy,
  activeFeature,
  serviceMeshType,
}: CreateRequestParams): Request {
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
    id,
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
    // Mesh-specific routing flags chosen by selectRequestPath
    ...(requestPath.canary && { canary: true }),
    ...(requestPath.autoRetry && { autoRetry: true }),
    ...(requestPath.dynamicDiscovery && { dynamicDiscovery: true }),
  };

  return newRequest;
}
