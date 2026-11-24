import { NextResponse } from "next/server";
import { logger } from "@/lib/structured-logger";
import { ReviewSearchUnavailableError } from "@/lib/services/review-search";

/** Seconds a client should wait before retrying a failed review search. */
export const REVIEW_SEARCH_RETRY_AFTER_SECONDS = 30;

/**
 * Maps a ReviewSearchUnavailableError to a 503 with Retry-After, logging the
 * outage through the structured logger. Only the error type and code are
 * logged: the underlying message can embed query parameters. Returns null for
 * any other error so the caller keeps its own handling.
 */
export function reviewSearchUnavailableResponse(
  error: unknown,
  operation: string,
): NextResponse | null {
  if (!(error instanceof ReviewSearchUnavailableError)) return null;

  logger.error("Review search unavailable", {
    metadata: {
      operation,
      causeName: error.cause instanceof Error ? error.cause.name : undefined,
      causeCode: error.code,
    },
  });

  return NextResponse.json(
    { error: "Le service d'avis est momentanément indisponible" },
    {
      status: 503,
      headers: { "Retry-After": String(REVIEW_SEARCH_RETRY_AFTER_SECONDS) },
    },
  );
}
