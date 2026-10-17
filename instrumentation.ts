/**
 * Runs once when the server starts. Installs log redaction on console.* (see
 * lib/log-redaction.ts) so that no call site can write personal data or secrets
 * to the logs. Development keeps the raw console for readable stack traces
 * unless LOG_REDACTION=1.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV === "development" && process.env.LOG_REDACTION !== "1") return;
  const { installConsoleRedaction } = await import("./lib/log-redaction");
  installConsoleRedaction();
}
