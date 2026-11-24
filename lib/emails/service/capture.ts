import { appendFileSync } from "node:fs";

import type { EmailOptions } from "./types";

/**
 * TEST-ONLY mail capture, used by the browser e2e suite (scripts/e2e.mjs) so the
 * tests can read verification and password-reset links without an SMTP server.
 *
 * It is opt-in and fails closed. Capturing needs ALL of:
 *   EMAIL_TRANSPORT=capture
 *   E2E_ALLOW_EMAIL_CAPTURE=yes-this-is-a-disposable-environment
 *   EMAIL_CAPTURE_FILE=<path of the JSON-lines file>
 *   DATABASE_URL pointing at a local server and a database whose name contains "test"
 * When EMAIL_TRANSPORT=capture is set but a condition is missing, sending throws:
 * mail is never silently dropped and never sent for real. A real deployment
 * (remote database) therefore can never turn the hook on, even by accident.
 */
export const CAPTURE_CONSENT = "yes-this-is-a-disposable-environment";

export function isCaptureRequested(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.EMAIL_TRANSPORT === "capture";
}

/** Throws unless every guard of the capture hook holds. Returns the capture file. */
export function assertCaptureAllowed(env: NodeJS.ProcessEnv = process.env): string {
  if (env.E2E_ALLOW_EMAIL_CAPTURE !== CAPTURE_CONSENT) {
    throw new Error("EMAIL_TRANSPORT=capture requires E2E_ALLOW_EMAIL_CAPTURE to be set to the consent value");
  }
  if (!env.EMAIL_CAPTURE_FILE) {
    throw new Error("EMAIL_TRANSPORT=capture requires EMAIL_CAPTURE_FILE");
  }
  let url: URL;
  try {
    url = new URL(env.DATABASE_URL ?? "");
  } catch {
    throw new Error("EMAIL_TRANSPORT=capture requires a DATABASE_URL");
  }
  const local = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);
  const name = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!local || !/test/i.test(name)) {
    throw new Error("EMAIL_TRANSPORT=capture is only allowed with a local database whose name contains \"test\"");
  }
  return env.EMAIL_CAPTURE_FILE;
}

/** Appends the message to the capture file (one JSON object per line). */
export function captureEmail(
  { to, subject, html, text }: EmailOptions,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const file = assertCaptureAllowed(env);
  appendFileSync(
    file,
    `${JSON.stringify({ to, subject, html, text: text ?? null, at: new Date().toISOString() })}\n`,
    "utf8",
  );
}
