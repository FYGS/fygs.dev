// Types for the visualization
export interface Service {
  id: string;
  name: string;
  position: { x: number; y: number };
  status: "healthy" | "degraded" | "unhealthy";
  requests: number;
  errors: number;
}

export interface Proxy {
  id: string;
  serviceId: string;
  position: { x: number; y: number };
}

// Define payload types for different services
export interface AuthPayload {
  username?: string;
  password?: string;
  rememberMe?: boolean;
  token?: string;
  expiresIn?: number;
}

export interface UserPayload {
  userId?: string;
  includeOrders?: boolean;
  name?: string;
  email?: string;
  role?: string;
  fields?: string[];
}

export interface ProductPayload {
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

export interface OrderPayload {
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

export interface DefaultPayload {
  timestamp?: string;
  requestId?: string;
}

// Union type for all possible payloads
export type RequestPayload =
  | AuthPayload
  | UserPayload
  | ProductPayload
  | OrderPayload
  | DefaultPayload;

export interface Request {
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

export interface Stats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
}

// Define service mesh types
export type ServiceMeshType = "istio" | "linkerd" | "consul" | "app-mesh";
