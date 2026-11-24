import type { Service } from "./types";

// Initial services of the simulated mesh
export const INITIAL_SERVICES: Service[] = [
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
];
