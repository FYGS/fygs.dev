import type * as SentryModule from "@sentry/nextjs";
import { IGNORED_ERRORS, monitoringOptions, scrubEvent } from "./lib/monitoring";

let sentry: typeof SentryModule | null = null;

/**
 * Runs once when the server starts. Installs log redaction on console.* (see
 * lib/log-redaction.ts) so that no call site can write personal data or secrets
 * to the logs. Development keeps the raw console for readable stack traces
 * unless LOG_REDACTION=1. Also names the DATABASE_URL problems that only bite in
 * production (see lib/database-url.ts), and starts the error reporting when SENTRY_DSN is set
 * (lib/monitoring.ts decides what may leave).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    // A production server with a weak secret or a missing public URL does not start (lib/env-guard.ts); it does
    // nothing in development, tests and builds
    const { guardProductionEnv } = await import("./lib/env-guard");
    guardProductionEnv();
    const { reportDatabaseUrl } = await import("./lib/database-url");
    reportDatabaseUrl();
  }
  const monitoring = monitoringOptions("server");
  if (monitoring) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      ...monitoring,
      tracesSampleRate: 0, // errors only: no performance traces, no extra bill
      ignoreErrors: IGNORED_ERRORS,
      // personal data is off by default in the SDK; scrubEvent removes what is left in the event itself
      beforeSend: (event) => scrubEvent(event as unknown as Record<string, unknown>) as unknown as typeof event,
    });
    sentry = Sentry;
  }
  if (process.env.NODE_ENV === "development" && process.env.LOG_REDACTION !== "1") return;
  const { installConsoleRedaction } = await import("./lib/log-redaction");
  installConsoleRedaction();
}

/** Next.js hands every uncaught error of a request (server components, routes, actions) to this hook. */
export async function onRequestError(...args: Parameters<typeof SentryModule.captureRequestError>) {
  sentry?.captureRequestError(...args);
}
