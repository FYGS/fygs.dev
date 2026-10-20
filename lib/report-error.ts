import { monitoringOptions } from "@/lib/monitoring";

/** Reports an error caught by an error boundary. A no-op when monitoring is not configured. */
export async function reportClientError(error: unknown): Promise<void> {
  if (!monitoringOptions("client", { NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN })) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
  } catch {
    // the report must never make the failure worse
  }
}
