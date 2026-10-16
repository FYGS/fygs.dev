import { NextRequest } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createLogger } from "@/lib/structured-logger";
import { parseCspReports, violationKey, ViolationThrottle } from "@/lib/csp-report";

/**
 * POST /api/csp-report: receiver for Content-Security-Policy violation reports
 * (`report-uri` / `report-to csp`, see lib/csp.mjs).
 *
 * Unauthenticated by nature (browsers send it without credentials), so it is
 * cheap and defensive: rate limited per client IP, body capped, always answers
 * 204 for well-formed requests, stores nothing, and logs each distinct
 * violation at most once per ten minutes with no personal data (see
 * lib/csp-report.ts). Look for the event name "csp.violation" in the logs.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const ACCEPTED_TYPES = ["application/csp-report", "application/reports+json", "application/json"];
const log = createLogger({ operation: "csp-report" });
const throttle = new ViolationThrottle();

const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ACCEPTED_TYPES.includes(type)) return new Response(null, { status: 415 });

  // A noisy client is dropped quietly: browsers never retry reports anyway
  const limited = await enforceRateLimit(request, "csp-report", { limit: 30, windowSeconds: 60 });
  if (limited) return noContent();

  let text: string;
  try {
    text = await request.text();
  } catch {
    return noContent();
  }
  if (text.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return noContent();
  }

  const now = Date.now();
  for (const violation of parseCspReports(payload)) {
    const decision = throttle.shouldLog(violationKey(violation), now);
    if (!decision) continue;
    log.warn("csp.violation", {
      eventType: "csp.violation",
      metadata: { ...violation, suppressedSinceLastLog: decision.suppressed },
    });
  }
  return noContent();
}

export const GET = () => new Response(null, { status: 405, headers: { Allow: "POST" } });
