import { redact, redactString } from "@/lib/log-redaction";

/**
 * What leaves the server or the browser towards the error-monitoring service (Sentry).
 *
 * Nothing is sent unless a DSN is configured. When one is, the event goes through `scrubEvent` first:
 * the same policy as the logs (lib/log-redaction.ts), plus what only an error report carries
 * (the visitor's address, cookies, headers, request bodies, the host name).
 */

export interface MonitoringOptions {
  dsn: string;
  environment: string;
  release?: string;
}

/** The options for the current side, or null when monitoring is not configured. */
export function monitoringOptions(
  side: "server" | "client",
  env: Record<string, string | undefined> = process.env,
): MonitoringOptions | null {
  const dsn = (side === "server" ? env.SENTRY_DSN : env.NEXT_PUBLIC_SENTRY_DSN)?.trim();
  if (!dsn) return null;
  return {
    dsn,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV ?? "production",
    release: env.SENTRY_RELEASE ?? env.NEXT_PUBLIC_SENTRY_RELEASE ?? env.VERCEL_GIT_COMMIT_SHA ?? env.GIT_COMMIT_SHA,
  };
}

/**
 * Errors that are Next.js control flow (`redirect()`, `notFound()`) or browser noise, not defects:
 * reporting them would drown the real ones.
 */
export const IGNORED_ERRORS: Array<string | RegExp> = [
  /^NEXT_REDIRECT/,
  /^NEXT_NOT_FOUND/,
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications.",
  /AbortError/,
];

type Loose = Record<string, unknown>;
const asRecord = (value: unknown): Loose | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Loose) : undefined;

/** "https://shop.test/a/b?token=1#x" -> "https://shop.test/a/b": the query string can hold tokens and e-mails. */
function withoutQuery(url: unknown): unknown {
  if (typeof url !== "string") return url;
  return url.replace(/[?#].*$/, "");
}

/**
 * The event as it may be sent. Pure: returns a new object and never throws (a monitoring hook
 * that throws would hide the very error it was asked to report).
 */
export function scrubEvent<T extends Loose>(event: T): T {
  try {
    const out = redact(event) as Loose;

    // a person is an opaque id, never a name, an address or an IP
    const user = asRecord(out.user);
    if (user) out.user = user.id !== undefined ? { id: user.id } : undefined;

    // the request: where, not what
    const request = asRecord(out.request);
    if (request) {
      out.request = { method: request.method, url: withoutQuery(request.url) };
    }

    delete out.server_name;

    for (const key of ["message", "transaction"] as const) {
      if (typeof out[key] === "string") out[key] = redactString(out[key] as string);
    }
    return out as T;
  } catch {
    // never send something unscrubbed
    return { message: "[unreportable event]" } as unknown as T;
  }
}
