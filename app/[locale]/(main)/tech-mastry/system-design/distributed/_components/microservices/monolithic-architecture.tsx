"use client";

import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Scenario, Request } from "./types";
import { stepMonolithRequests } from "./monolith-step";
import { getRequestInterval } from "./request-interval";

export function MonolithicArchitecture({ scenario }: { scenario: Scenario }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  });

  // The loop reads and writes the request list through a ref so that no state
  // updater has side effects or draws random numbers (StrictMode runs updaters twice)
  const requestsRef = useRef<Request[]>([]);
  const commitRequests = useCallback((next: Request[]) => {
    requestsRef.current = next;
    setRequests(next);
  }, []);
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
      commitRequests([...requestsRef.current, newRequest]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    };

    // Process existing requests
    const processRequests = (timestamp: number) => {
      const { requests: nextRequests, newlyCompleted, newlyFailed } = stepMonolithRequests(
        requestsRef.current,
        { timestamp, isFailed, isOverloaded }
      );

      // Update response times
      newlyCompleted.forEach((request) => {
        if (request.completionTime && request.startTime) {
          responseTimes.current.push(request.completionTime - request.startTime);
        }
      });

      // Calculate average response time
      if (responseTimes.current.length > 0) {
        const avgTime =
          responseTimes.current.reduce((sum, time) => sum + time, 0) /
          responseTimes.current.length;
        setStats((prev) => ({
          ...prev,
          completedRequests: prev.completedRequests + newlyCompleted.length,
          failedRequests: prev.failedRequests + newlyFailed.length,
          averageResponseTime: Math.round(avgTime),
        }));
      }

      commitRequests(nextRequests);
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
  }, [scenario, isFailed, isOverloaded, commitRequests]);

  // Update overloaded state based on scenario
  useEffect(() => {
    if (scenario !== "high-load") return;
    const timer = setTimeout(() => {
      setIsOverloaded(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
      setIsOverloaded(false);
    };
  }, [scenario]);

  // Update failed state based on scenario
  useEffect(() => {
    if (scenario !== "failure") return;
    const timer = setTimeout(() => {
      setIsFailed(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
      setIsFailed(false);
    };
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
          <foreignObject x="-15" y="-15" width="30" height="30">
            <div className="flex items-center justify-center w-full h-full">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
          </foreignObject>
          <text x="0" y="40" textAnchor="middle" fontSize="14" fill="#1e293b">
            Utilisateurs
          </text>
        </g>

        {/* Monolith */}
        <g transform="translate(400, 250)">
          <rect
            x="-80"
            y="-100"
            width="160"
            height="200"
            rx="5"
            fill={isFailed ? "#fee2e2" : isOverloaded ? "#fef3c7" : "#f1f5f9"}
            stroke={isFailed ? "#ef4444" : isOverloaded ? "#f59e0b" : "#94a3b8"}
            strokeWidth="2"
          />
          <rect
            x="-100"
            y="-65"
            width="200"
            height="25"
            rx="3"
            fill="#f8fafc"
            stroke="none"
          />
          <text
            x="0"
            y="-50"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#1e293b"
          >
            Application Monolithique
          </text>
          <foreignObject x="-20" y="-110" width="40" height="40">
            <div className="flex items-center justify-center w-full h-full">
              <Server
                className={`w-8 h-8 ${
                  isFailed
                    ? "text-red-500"
                    : isOverloaded
                    ? "text-amber-500"
                    : "text-slate-500"
                }`}
              />
            </div>
          </foreignObject>

          {/* Modules inside monolith */}
          <g transform="translate(0, -20)">
            <rect
              x="-60"
              y="-10"
              width="120"
              height="20"
              rx="3"
              fill="#dbeafe"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#1e293b">
              Gestion Utilisateurs
            </text>
          </g>

          <g transform="translate(0, 10)">
            <rect
              x="-60"
              y="-10"
              width="120"
              height="20"
              rx="3"
              fill="#dcfce7"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#1e293b">
              Gestion Commandes
            </text>
          </g>

          <g transform="translate(0, 40)">
            <rect
              x="-60"
              y="-10"
              width="120"
              height="20"
              rx="3"
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="1"
            />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#1e293b">
              Gestion Paiements
            </text>
          </g>

          <g transform="translate(0, 70)">
            <rect
              x="-60"
              y="-10"
              width="120"
              height="20"
              rx="3"
              fill="#f3e8ff"
              stroke="#8b5cf6"
              strokeWidth="1"
            />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#1e293b">
              Gestion Inventaire
            </text>
          </g>

          {/* Status indicator */}
          <g transform="translate(0, 120)">
            {isFailed ? (
              <>
                <circle
                  r="10"
                  fill="#fee2e2"
                  stroke="#ef4444"
                  strokeWidth="1"
                />
                <foreignObject x="-10" y="-10" width="20" height="20">
                  <div className="flex items-center justify-center w-full h-full">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                </foreignObject>
                <text
                  x="0"
                  y="25"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#ef4444"
                >
                  Défaillance
                </text>
              </>
            ) : isOverloaded ? (
              <>
                <circle
                  r="10"
                  fill="#fef3c7"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <foreignObject x="-10" y="-10" width="20" height="20">
                  <div className="flex items-center justify-center w-full h-full">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                </foreignObject>
                <text
                  x="0"
                  y="25"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#f59e0b"
                >
                  Surcharge
                </text>
              </>
            ) : (
              <>
                <circle
                  r="10"
                  fill="#dcfce7"
                  stroke="#10b981"
                  strokeWidth="1"
                />
                <foreignObject x="-10" y="-10" width="20" height="20">
                  <div className="flex items-center justify-center w-full h-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </foreignObject>
                <text
                  x="0"
                  y="25"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#10b981"
                >
                  Normal
                </text>
              </>
            )}
          </g>
        </g>

        {/* Database */}
        <g transform="translate(700, 250)">
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
          <text x="0" y="60" textAnchor="middle" fontSize="14" fill="#1e293b">
            Base de Données
          </text>
        </g>

        {/* Connection lines */}
        <path
          d="M 80,250 L 320,250"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <path
          d="M 480,250 L 650,250"
          stroke="#94a3b8"
          strokeWidth="2"
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
