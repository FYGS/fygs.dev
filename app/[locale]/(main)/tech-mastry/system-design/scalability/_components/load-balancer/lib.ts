import type { Algorithm, LoadBalancerState, Request, Server } from "./types";

export function layoutServers(servers: Server[]): Server[] {
  const centerX = 400;
  const centerY = 200;
  const radius = 150;

  // Position servers in a semi-circle
  return servers.map((server, index) => {
    const angle =
      Math.PI * (0.2 + (index / Math.max(1, servers.length - 1)) * 0.6);
    return {
      ...server,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });
}

// Select a server based on the current algorithm
export const selectServer = (state: LoadBalancerState): Server | undefined => {
  const onlineServers = state.servers.filter((s) => s.status !== "offline");

  if (onlineServers.length === 0) return undefined;

  switch (state.algorithm) {
    case "round-robin":
      return (
        onlineServers.find((s) => s.id === state.nextServerId) ||
        onlineServers[0]
      );

    case "least-connections":
      return onlineServers.reduce(
        (min, server) => (server.load < min.load ? server : min),
        onlineServers[0]
      );

    case "ip-hash":
      // Simulate IP hash by using a random but consistent server for each request
      const randomIndex = Math.floor(Math.random() * onlineServers.length);
      return onlineServers[randomIndex];

    default:
      return onlineServers[0];
  }
};

// Get the next server ID for round-robin
export const getNextServerId = (
  algorithm: string,
  currentId: number,
  servers: Server[]
): number => {
  if (algorithm !== "round-robin") return currentId;

  const onlineServers = servers.filter((s) => s.status !== "offline");
  if (onlineServers.length === 0) return currentId;

  const currentIndex = onlineServers.findIndex((s) => s.id === currentId);
  const nextIndex = (currentIndex + 1) % onlineServers.length;
  return onlineServers[nextIndex].id;
};

// Assign a freshly generated request to a server, updating loads and stats
export function dispatchRequest(
  prev: LoadBalancerState,
  newRequest: Request
): LoadBalancerState {
  // Determine target server based on algorithm
  const targetServer = selectServer(prev);

  if (targetServer) {
    // Update server load
    const updatedServers = prev.servers.map((server) =>
      server.id === targetServer.id
        ? {
            ...server,
            load: server.load + 1,
            requests: server.requests + 1,
          }
        : server
    );

    // Update request with target server
    const updatedRequest = {
      ...newRequest,
      targetServer: targetServer.id,
      status: "processing" as const,
      processingTime: Date.now(),
    };

    // Update stats
    const updatedStats = {
      ...prev.stats,
      totalRequests: prev.stats.totalRequests + 1,
    };

    return {
      ...prev,
      requests: [...prev.requests, updatedRequest],
      servers: updatedServers,
      stats: updatedStats,
      nextServerId: getNextServerId(
        prev.algorithm,
        prev.nextServerId,
        updatedServers
      ),
    };
  }

  return prev;
}

// Complete or fail requests that are done processing, then refresh loads and stats
export function advanceRequests(
  prev: LoadBalancerState,
  timestamp: number,
  processingSpeed: number
): LoadBalancerState {
  const updatedRequests = prev.requests.map((request) => {
    if (request.status === "processing") {
      // Check if request should complete
      const processingDuration =
        (timestamp - (request.processingTime || 0)) * processingSpeed;
      const targetServer = prev.servers.find(
        (s) => s.id === request.targetServer
      );

      if (processingDuration > 2000) {
        // Determine if request succeeds or fails
        const success = targetServer
          ? Math.random() > targetServer.failureChance
          : true;

        return {
          ...request,
          status: success ? ("completed" as const) : ("failed" as const),
          completionTime: timestamp,
        };
      }
    }
    return request;
  });

  // Update server loads
  const updatedServers = prev.servers.map((server) => {
    const activeRequests = updatedRequests.filter(
      (r) => r.targetServer === server.id && r.status === "processing"
    ).length;

    // Update server status based on load
    let status = "online";
    if (activeRequests > 10) {
      status = "overloaded";
    } else if (Math.random() < 0.001) {
      status = "offline";
    }

    return {
      ...server,
      load: activeRequests,
      status: status as "online" | "offline" | "overloaded",
    };
  });

  // Calculate stats
  const completedRequests = updatedRequests.filter(
    (r) => r.status === "completed"
  );
  const failedRequests = updatedRequests.filter(
    (r) => r.status === "failed"
  );

  // Calculate average response time
  const responseTimes = completedRequests
    .filter((r) => r.completionTime && r.startTime)
    .map((r) => (r.completionTime || 0) - r.startTime);

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length
      : 0;

  // Clean up old completed/failed requests
  const currentRequests = updatedRequests.filter((r) => {
    if (r.status === "completed" || r.status === "failed") {
      return timestamp - (r.completionTime || 0) < 2000; // Keep for 2 seconds
    }
    return true;
  });

  return {
    ...prev,
    requests: currentRequests,
    servers: updatedServers,
    stats: {
      ...prev.stats,
      completedRequests: completedRequests.length,
      failedRequests: failedRequests.length,
      averageResponseTime: averageResponseTime,
    },
  };
}

// Get explanation text based on the algorithm
export const getAlgorithmExplanation = (algorithm: Algorithm): string => {
  switch (algorithm) {
    case "round-robin":
      return "L'algorithme Round Robin distribue les requêtes de manière séquentielle à chaque serveur à tour de rôle. Simple et efficace pour des charges uniformes, mais ne tient pas compte de la charge actuelle des serveurs.";
    case "least-connections":
      return "L'algorithme Least Connections dirige les requêtes vers le serveur ayant le moins de connexions actives. Idéal pour des requêtes de durée variable, car il équilibre dynamiquement la charge en fonction de la capacité disponible.";
    case "ip-hash":
      return "L'algorithme IP Hash utilise l'adresse IP du client pour déterminer quel serveur recevra la requête. Cela garantit que les requêtes d'un même client sont toujours dirigées vers le même serveur, ce qui est utile pour maintenir les sessions.";
    default:
      return "";
  }
};
