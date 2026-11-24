import type { Request, RequestStatus, Scenario } from "../types";

// Create a new request travelling user -> monolith -> database and back
export function createMicroserviceRequest(id: number, scenario: Scenario): Request {
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
    id,
    type,
    status: "pending",
    position: { ...path[0] },
    startTime: Date.now(),
    path,
    currentPathIndex: 0,
    speed: scenario === "high-load" ? 1.5 : 1,
  };

  return newRequest;
}

// Advance one request along its path by one animation frame
export function advanceRequest(request: Request, timestamp: number): Request {
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
        newStatus = "completed" as RequestStatus;
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
    const step = request.speed * 2; // Pixels per frame
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
}
