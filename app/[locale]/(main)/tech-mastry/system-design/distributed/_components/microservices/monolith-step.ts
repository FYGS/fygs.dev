import type { Request, RequestStatus } from "./types";

interface FrameInput {
  timestamp: number;
  isFailed: boolean;
  isOverloaded: boolean;
}

/**
 * Advances every request one frame. Pure apart from `Math.random`, which is
 * drawn here once per frame (never inside a state updater, which StrictMode
 * runs twice): the caller commits the result and derives the statistics.
 */
export function stepMonolithRequests(
  prev: Request[],
  { timestamp, isFailed, isOverloaded }: FrameInput
): { requests: Request[]; newlyCompleted: Request[]; newlyFailed: Request[] } {
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


  const hasStatus = (status: RequestStatus) => (r: Request) =>
    r.status === status && !prev.find((p) => p.id === r.id && p.status === status);
  const newlyCompleted = updatedRequests.filter(hasStatus("completed"));
  const newlyFailed = updatedRequests.filter(hasStatus("failed"));

  // Remove completed or failed requests after they've been displayed for a while
  const requests = updatedRequests.filter((r) => {
    if (r.status === "completed" || r.status === "failed") {
      return timestamp - (r.completionTime || 0) < 2000; // Keep for 2 seconds
    }
    return true;
  });

  return { requests, newlyCompleted, newlyFailed };
}
