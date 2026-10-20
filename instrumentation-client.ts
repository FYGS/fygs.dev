import type * as SentryModule from "@sentry/nextjs";
import { IGNORED_ERRORS, monitoringOptions, scrubEvent } from "./lib/monitoring";

/**
 * Runs in the browser before the app. Error reporting starts only when NEXT_PUBLIC_SENTRY_DSN was set at build
 * time, and the SDK is then loaded on demand: a site without a DSN ships none of it.
 * (The variables are spelled out because Next only inlines `process.env.NEXT_PUBLIC_X` written in full.)
 */
const options = monitoringOptions("client", {
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  NODE_ENV: process.env.NODE_ENV,
});

let sentry: typeof SentryModule | null = null;

if (options) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      ...options,
      tracesSampleRate: 0,
      ignoreErrors: IGNORED_ERRORS,
      // personal data is off by default in the SDK; scrubEvent removes what is left in the event itself
      beforeSend: (event) => scrubEvent(event as unknown as Record<string, unknown>) as unknown as typeof event,
    });
    sentry = Sentry;
  });
}

export function onRouterTransitionStart(...args: Parameters<typeof SentryModule.captureRouterTransitionStart>) {
  sentry?.captureRouterTransitionStart(...args);
}
