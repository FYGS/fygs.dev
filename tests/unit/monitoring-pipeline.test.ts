import { describe, expect, it } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { IGNORED_ERRORS, scrubEvent } from "@/lib/monitoring";

/**
 * The real SDK, a fake network: what we configure (scrubber, ignored errors) is applied by the SDK's own
 * pipeline, so what is captured here is what Sentry would receive.
 */
function startSdk() {
  const received: Array<Record<string, unknown>> = [];
  Sentry.init({
    dsn: "https://abc123@o4500.ingest.sentry.io/6789",
    environment: "test",
    tracesSampleRate: 0,
    defaultIntegrations: false,
    ignoreErrors: IGNORED_ERRORS,
    beforeSend: (event) => scrubEvent(event as unknown as Record<string, unknown>) as unknown as typeof event,
    transport: () => ({
      send: async (envelope) => {
        const [, items] = envelope as unknown as [unknown, Array<[{ type: string }, Record<string, unknown>]>];
        for (const [header, payload] of items) if (header.type === "event") received.push(payload);
        return {};
      },
      flush: async () => true,
    }),
  });
  return received;
}

describe("the error-reporting pipeline", () => {
  it("sends a captured error with its personal data removed", async () => {
    const received = startSdk();
    Sentry.setUser({ id: "user_42", email: "bob@example.com", ip_address: "203.0.113.9", username: "Bob" });

    Sentry.captureException(new Error("could not e-mail bob@example.com"));
    await Sentry.flush(2000);

    expect(received).toHaveLength(1);
    const text = JSON.stringify(received[0]);
    expect(text).not.toContain("bob@example.com");
    expect(text).not.toContain("203.0.113.9");
    expect(text).toContain("could not e-mail b***@example.com");
    expect(received[0].user).toEqual({ id: "user_42" });
  });

  it("does not send the control-flow errors of Next.js", async () => {
    const received = startSdk();

    Sentry.captureException(new Error("NEXT_REDIRECT"));
    Sentry.captureException(new Error("NEXT_NOT_FOUND"));
    await Sentry.flush(2000);

    expect(received).toHaveLength(0);
  });
});
