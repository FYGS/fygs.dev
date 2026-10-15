"use client";

import {
  CreditCard,
  Database,
  Layers,
  Mail,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Scenario, RequestStatus, Request } from "./types";
import { getRequestInterval } from "./request-interval";

// Microservices Architecture Component
export function MicroservicesArchitecture({ scenario }: { scenario: Scenario }) {
  const [services, setServices] = useState<{
    users: { status: "online" | "offline" | "overloaded"; load: number };
    orders: { status: "online" | "offline" | "overloaded"; load: number };
    payments: { status: "online" | "offline" | "overloaded"; load: number };
    inventory: { status: "online" | "offline" | "overloaded"; load: number };
    notifications: {
      status: "online" | "offline" | "overloaded";
      load: number;
    };
  }>({
    users: { status: "online", load: 0 },
    orders: { status: "online", load: 0 },
    payments: { status: "online", load: 0 },
    inventory: { status: "online", load: 0 },
    notifications: { status: "online", load: 0 },
  });

  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  });
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
      const requestTypes = [
        "user",
        "order",
        "payment",
        "inventory",
        "notification",
      ];
      const type = requestTypes[
        Math.floor(Math.random() * requestTypes.length)
      ] as Request["type"];

      // Create a path for the request
      // Start at the left side (user)
      // Go to the monolith in the center
      // Then to the database on the right
      // Then back to the monolith
      // Then back to the user
      const path = [
        { x: 50, y: 250 }, // Start (user)
        { x: 400, y: 250 }, // Monolith
        { x: 700, y: 250 }, // Database
        { x: 400, y: 250 }, // Back to monolith
        { x: 50, y: 250 }, // Back to user
      ];

      // Create the new request
      const newRequest: Request = {
        id: requestIdRef.current++,
        type,
        status: "pending",
        position: { ...path[0] },
        startTime: Date.now(),
        path,
        currentPathIndex: 0,
        speed: scenario === "high-load" ? 1.5 : 1,
      };

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
        const updatedRequests = prev.map((request) => {
          // If the system has failed, mark all processing requests as failed
          if (isFailed && request.status === "processing") {
            return {
              ...request,
              status: "failed" as RequestStatus,
              completionTime: timestamp,
            };
          }

          // Move the request along its path
          if (request.currentPathIndex < request.path.length - 1) {
            // const currentPoint = request.path[request.currentPathIndex]; // Not used
            const nextPoint = request.path[request.currentPathIndex + 1];

            // Calculate direction and distance
            const dx = nextPoint.x - request.position.x;
            const dy = nextPoint.y - request.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If we've reached the next point (or close enough)
            if (distance < 5) {
              // Move to the next point in the path
              const newIndex = request.currentPathIndex + 1;

              // Update status based on position in the path
              let newStatus = request.status;
              if (newIndex === 1) {
                // Reached the monolith
                newStatus = "processing" as RequestStatus;
              } else if (newIndex === request.path.length - 1) {
                // Completed the full path
                newStatus = isOverloaded
                  ? Math.random() < 0.3
                    ? ("failed" as RequestStatus)
                    : ("completed" as RequestStatus)
                  : ("completed" as RequestStatus);
              }

              return {
                ...request,
                position: { ...nextPoint },
                currentPathIndex: newIndex,
                status: newStatus,
                processingTime:
                  newStatus === "processing" && !request.processingTime
                    ? timestamp
                    : request.processingTime,
                completionTime:
                  newStatus === "completed" || newStatus === "failed"
                    ? timestamp
                    : request.completionTime,
              };
            }

            // Otherwise, move towards the next point
            const speed = request.speed * (isOverloaded ? 0.5 : 1); // Slow down if overloaded
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

  // Get color for a request based on its type and status
  const getRequestColor = (request: Request): string => {
    if (request.status === "failed") return "#ef4444";

    switch (request.type) {
      case "user":
        return "#3b82f6";
      case "order":
        return "#10b981";
      case "payment":
        return "#f59e0b";
      case "inventory":
        return "#8b5cf6";
      case "notification":
        return "#ec4899";
      default:
        return "#6b7280";
    }
  };

  // Get color for a service based on its status
  const getServiceColor = (
    status: "online" | "offline" | "overloaded"
  ): { bg: string; border: string; text: string } => {
    switch (status) {
      case "online":
        return { bg: "#f1f5f9", border: "#94a3b8", text: "#1e293b" };
      case "offline":
        return { bg: "#fee2e2", border: "#ef4444", text: "#ef4444" };
      case "overloaded":
        return { bg: "#fef3c7", border: "#f59e0b", text: "#f59e0b" };
      default:
        return { bg: "#f1f5f9", border: "#94a3b8", text: "#1e293b" };
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Background Elements */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        className="absolute inset-0"
      >
        {/* User */}
        <g transform="translate(50, 250)">
          <circle r="30" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <Users className="w-6 h-6 text-slate-500" x="-12" y="-12" />
          <text x="0" y="40" textAnchor="middle" fontSize="14" fill="#1e293b">
            Utilisateurs
          </text>
        </g>

        {/* API Gateway */}
        <g transform="translate(200, 250)">
          <rect
            x="-50"
            y="-40"
            width="100"
            height="80"
            rx="5"
            fill="#f1f5f9"
            stroke="#6366f1"
            strokeWidth="2"
          />
          <foreignObject x="-15" y="-15" width="30" height="30">
            <div className="flex items-center justify-center w-full h-full">
              <Layers className="w-6 h-6 text-indigo-500" />
            </div>
          </foreignObject>
          <text x="0" y="20" textAnchor="middle" fontSize="12" fill="#1e293b">
            API Gateway
          </text>
        </g>

        {/* Microservices */}
        {/* Users Service */}
        <g transform="translate(400, 100)">
          <rect
            x="-60"
            y="-30"
            width="120"
            height="60"
            rx="5"
            fill={getServiceColor(services.users.status).bg}
            stroke={getServiceColor(services.users.status).border}
            strokeWidth="2"
          />
          <foreignObject x="-12" y="-25" width="24" height="24">
            <div className="flex items-center justify-center w-full h-full">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </foreignObject>
          <rect
            x="-60"
            y="0"
            width="120"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
            Service Utilisateurs
          </text>
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fill={getServiceColor(services.users.status).text}
          >
            {services.users.status === "online"
              ? `Charge: ${services.users.load}`
              : services.users.status === "overloaded"
              ? "Surcharge"
              : "Hors ligne"}
          </text>
        </g>

        {/* Orders Service */}
        <g transform="translate(400, 175)">
          <rect
            x="-60"
            y="-30"
            width="120"
            height="60"
            rx="5"
            fill={getServiceColor(services.orders.status).bg}
            stroke={getServiceColor(services.orders.status).border}
            strokeWidth="2"
          />
          <foreignObject x="-12" y="-25" width="24" height="24">
            <div className="flex items-center justify-center w-full h-full">
              <ShoppingCart className="w-5 h-5 text-green-500" />
            </div>
          </foreignObject>
          <rect
            x="-60"
            y="0"
            width="120"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
            Service Commandes
          </text>
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fill={getServiceColor(services.orders.status).text}
          >
            {services.orders.status === "online"
              ? `Charge: ${services.orders.load}`
              : services.orders.status === "overloaded"
              ? "Surcharge"
              : "Hors ligne"}
          </text>
        </g>

        {/* Payments Service */}
        <g transform="translate(400, 250)">
          <rect
            x="-60"
            y="-30"
            width="120"
            height="60"
            rx="5"
            fill={getServiceColor(services.payments.status).bg}
            stroke={getServiceColor(services.payments.status).border}
            strokeWidth="2"
          />
          <foreignObject x="-12" y="-25" width="24" height="24">
            <div className="flex items-center justify-center w-full h-full">
              <CreditCard className="w-5 h-5 text-amber-500" />
            </div>
          </foreignObject>
          <rect
            x="-60"
            y="0"
            width="120"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
            Service Paiements
          </text>
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fill={getServiceColor(services.payments.status).text}
          >
            {services.payments.status === "online"
              ? `Charge: ${services.payments.load}`
              : services.payments.status === "overloaded"
              ? "Surcharge"
              : "Hors ligne"}
          </text>
        </g>

        {/* Inventory Service */}
        <g transform="translate(400, 325)">
          <rect
            x="-60"
            y="-30"
            width="120"
            height="60"
            rx="5"
            fill={getServiceColor(services.inventory.status).bg}
            stroke={getServiceColor(services.inventory.status).border}
            strokeWidth="2"
          />
          <foreignObject x="-12" y="-25" width="24" height="24">
            <div className="flex items-center justify-center w-full h-full">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
          </foreignObject>
          <rect
            x="-60"
            y="0"
            width="120"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
            Service Inventaire
          </text>
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fill={getServiceColor(services.inventory.status).text}
          >
            {services.inventory.status === "online"
              ? `Charge: ${services.inventory.load}`
              : services.inventory.status === "overloaded"
              ? "Surcharge"
              : "Hors ligne"}
          </text>
        </g>

        {/* Notifications Service */}
        <g transform="translate(400, 400)">
          <rect
            x="-60"
            y="-30"
            width="120"
            height="60"
            rx="5"
            fill={getServiceColor(services.notifications.status).bg}
            stroke={getServiceColor(services.notifications.status).border}
            strokeWidth="2"
          />
          <foreignObject x="-12" y="-25" width="24" height="24">
            <div className="flex items-center justify-center w-full h-full">
              <Mail className="w-5 h-5 text-pink-500" />
            </div>
          </foreignObject>
          <rect
            x="-60"
            y="0"
            width="120"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text x="0" y="13" textAnchor="middle" fontSize="12" fill="#1e293b">
            Service Notifications
          </text>
          <text
            x="0"
            y="25"
            textAnchor="middle"
            fontSize="10"
            fill={getServiceColor(services.notifications.status).text}
          >
            {services.notifications.status === "online"
              ? `Charge: ${services.notifications.load}`
              : services.notifications.status === "overloaded"
              ? "Surcharge"
              : "Hors ligne"}
          </text>
        </g>

        {/* Database */}
        <g transform="translate(600, 250)">
          <rect
            x="-50"
            y="-40"
            width="100"
            height="80"
            rx="5"
            fill="#f0fdfa"
            stroke="#14b8a6"
            strokeWidth="2"
          />
          <foreignObject x="-15" y="-15" width="30" height="30">
            <div className="flex items-center justify-center w-full h-full">
              <Database className="w-6 h-6 text-teal-500" />
            </div>
          </foreignObject>
          <rect
            x="-50"
            y="10"
            width="100"
            height="20"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text x="0" y="23" textAnchor="middle" fontSize="12" fill="#1e293b">
            Base de Données
          </text>
        </g>

        {/* Connection lines */}
        {/* User to API Gateway */}
        <path
          d="M 80,250 L 150,250"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* API Gateway to Services */}
        <path
          d="M 250,250 L 340,100"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 250,250 L 340,175"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 250,250 L 340,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 250,250 L 340,325"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 250,250 L 340,400"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Services to Database */}
        <path
          d="M 460,100 L 550,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 460,175 L 550,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 460,250 L 550,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 460,325 L 550,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <path
          d="M 460,400 L 550,250"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        {/* Requests */}
        {requests.map((request) => (
          <g
            key={request.id}
            transform={`translate(${request.position.x}, ${request.position.y})`}
          >
            <circle
              r="6"
              fill={getRequestColor(request)}
              opacity={
                request.status === "completed" || request.status === "failed"
                  ? 0.5
                  : 1
              }
            />
          </g>
        ))}
      </svg>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 right-4 bg-gray-800/80 p-3 rounded-lg shadow-xs border text-xs space-y-1">
        <div className="flex justify-between gap-4">
          <span>Requêtes totales:</span>
          <span className="font-medium">{stats.totalRequests}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Requêtes complétées:</span>
          <span className="font-medium text-green-500">
            {stats.completedRequests}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Requêtes échouées:</span>
          <span className="font-medium text-red-500">
            {stats.failedRequests}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Temps moyen:</span>
          <span className="font-medium">{stats.averageResponseTime} ms</span>
        </div>
      </div>
    </div>
  );
}
