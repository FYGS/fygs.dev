import { isProductionRuntime, secretProblem } from "@/lib/secret";

/**
 * Checks of the production environment, run when the server starts (instrumentation.ts) and never during a build, a
 * test or development. A deployment that misses one of these would run, but with a weakness that is easy to miss
 * later: forgeable sessions, links built from a request header, endpoints that accept a guessable key.
 */

const MIN_KEY_LENGTH = 32;

export interface EnvReport {
  /** Refuse to start. */
  errors: string[];
  /** Start, but say so in the logs. */
  warnings: string[];
}

/** `https://` anywhere; `http://` only for a machine of the developer (localhost, 127.0.0.1, [::1]). */
function urlProblem(name: string, value: string | undefined): string | null {
  if (!value) return `${name} is not set`;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return `${name} is not a valid URL`;
  }
  const local = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);
  if (url.protocol === "https:") return null;
  if (url.protocol === "http:" && local) return null;
  return `${name} must be an https:// address (http:// is only accepted for localhost)`;
}

function keyProblem(name: string, value: string | undefined): { kind: "unset" | "weak"; text: string } | null {
  if (value === undefined || value === "") return { kind: "unset", text: `${name} is not set: the endpoint that needs it refuses every request` };
  if (value.length < MIN_KEY_LENGTH) return { kind: "weak", text: `${name} is shorter than ${MIN_KEY_LENGTH} characters` };
  return null;
}

/** The problems of an environment. Pure: pass `process.env` or a test object. */
export function checkProductionEnv(env: NodeJS.ProcessEnv): EnvReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const secret = secretProblem(env.BETTER_AUTH_SECRET);
  if (secret) errors.push(`BETTER_AUTH_SECRET ${secret}`);

  for (const name of ["BETTER_AUTH_URL", "NEXT_PUBLIC_SITE_URL"] as const) {
    const problem = urlProblem(name, env[name]);
    if (problem) errors.push(problem);
  }

  if (!env.DATABASE_URL) errors.push("DATABASE_URL is not set");

  for (const name of ["CRON_SECRET", "ADMIN_API_KEY"] as const) {
    const problem = keyProblem(name, env[name]);
    if (problem?.kind === "weak") errors.push(problem.text);
    if (problem?.kind === "unset") warnings.push(problem.text);
  }

  if (env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
    errors.push("NODE_TLS_REJECT_UNAUTHORIZED=0 turns off certificate checks for every outgoing connection (Stripe, SMTP, storage)");
  }

  const hops = env.TRUSTED_PROXY_HOPS;
  if (hops !== undefined && hops !== "" && !/^[0-9]$/.test(hops)) {
    errors.push("TRUSTED_PROXY_HOPS must be a single digit: the number of reverse proxies in front of the application");
  }
  if (hops === undefined || hops === "") {
    warnings.push("TRUSTED_PROXY_HOPS is not set: one proxy in front of the application is assumed (rate limits are per client address)");
  }

  return { errors, warnings };
}

/** Throws with every error at once. Does nothing outside a running production server. */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): EnvReport {
  if (!isProductionRuntime()) return { errors: [], warnings: [] };
  const report = checkProductionEnv(env);
  if (report.errors.length > 0) {
    throw new Error(`Refusing to start: the production environment is not safe.\n- ${report.errors.join("\n- ")}`);
  }
  return report;
}
