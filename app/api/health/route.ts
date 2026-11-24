import { NextResponse } from "next/server";
import { getRateLimitStatus } from "@/lib/rate-limit";

/**
 * GET /api/health: liveness plus the state of the rate limiter.
 *
 * Unauthenticated and deliberately cheap: it reads in-process counters only (no
 * Redis, database or network call), so load balancers and uptime probes can hit
 * it often and it keeps answering while the dependencies are down. It never
 * returns hosts, error text or versions. HTTP status is always 200 while the
 * process is serving; "degraded" is a signal to alert on, not a reason for an
 * orchestrator to restart the container (a restart does not fix Redis).
 *
 * Counters are per instance: sum `rateLimiter.fallbackDecisions` across them.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const rateLimiter = getRateLimitStatus();
  return NextResponse.json(
    {
      status: rateLimiter.degraded ? "degraded" : "ok",
      rateLimiter,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const HEAD = () => new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
