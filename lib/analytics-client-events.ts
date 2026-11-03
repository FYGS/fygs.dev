/**
 * Events a BROWSER may report (POST /api/analytics/batch). Whatever a browser sends is untrusted: a signed-in user can
 * write anything they like in these requests. So the server keeps a short list of interface events (a card was seen,
 * a button was clicked), reduces their context to a few small primitive values, and never accepts the events that
 * mean money or learning (purchases, subscriptions, refunds, completions, certificates): those are recorded by the
 * server, from facts it checked itself. Nothing that is revenue, billing or progress may be computed from events
 * whose `source` is `web`.
 */

export const CLIENT_EVENT_TYPES = [
  "COURSE_CARD_VIEWED",
  "COURSE_CARD_CTA_CLICKED",
  "SUBSCRIPTION_CYCLE_TOGGLED",
  "UPGRADE_CTA_SHOWN",
  "UPGRADE_CTA_CLICKED",
  "RECOMMENDATION_IMPRESSION",
] as const;

export type ClientEventType = (typeof CLIENT_EVENT_TYPES)[number];

const ALLOWED = new Set<string>(CLIENT_EVENT_TYPES);

export const MAX_EVENTS_PER_BATCH = 50;
export const MAX_BATCH_BYTES = 32 * 1024;
const MAX_CONTEXT_KEYS = 12;
const MAX_KEY_LENGTH = 40;
const MAX_STRING_LENGTH = 200;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface ClientEvent {
  type: ClientEventType;
  context: Record<string, string | number | boolean>;
  timestamp: string;
}

/** A context of primitives only: no nested object, no prototype keys, bounded keys and strings. */
export function sanitizeEventContext(context: unknown): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  if (!context || typeof context !== "object" || Array.isArray(context)) return clean;
  for (const [key, value] of Object.entries(context as Record<string, unknown>)) {
    if (Object.keys(clean).length >= MAX_CONTEXT_KEYS) break;
    if (FORBIDDEN_KEYS.has(key) || key.length > MAX_KEY_LENGTH || !KEY_PATTERN.test(key)) continue;
    if (typeof value === "string") clean[key] = value.slice(0, MAX_STRING_LENGTH);
    else if (typeof value === "number" && Number.isFinite(value)) clean[key] = value;
    else if (typeof value === "boolean") clean[key] = value;
  }
  return clean;
}

/** The events of a batch that may be recorded, cleaned. Unknown types and malformed entries are dropped. */
export function sanitizeClientEvents(raw: unknown, now = Date.now()): ClientEvent[] {
  if (!Array.isArray(raw)) return [];
  const events: ClientEvent[] = [];
  for (const entry of raw.slice(0, MAX_EVENTS_PER_BATCH)) {
    if (!entry || typeof entry !== "object") continue;
    const { type, context, ts } = entry as { type?: unknown; context?: unknown; ts?: unknown };
    if (typeof type !== "string" || !ALLOWED.has(type)) continue;
    // A browser clock can be wrong or forged: a time outside the last day is replaced by the server's
    const claimed = typeof ts === "number" && Number.isFinite(ts) ? ts : now;
    const time = Math.abs(claimed - now) <= ONE_DAY_MS ? claimed : now;
    events.push({
      type: type as ClientEventType,
      context: sanitizeEventContext(context),
      timestamp: new Date(time).toISOString(),
    });
  }
  return events;
}
