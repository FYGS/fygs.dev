/**
 * Static checks on DATABASE_URL, run at server start (see instrumentation.ts).
 *
 * Prisma 7 reaches PostgreSQL through the `pg` driver adapter, which behaves
 * differently from the former Prisma engine in ways that only show up in
 * production: it VALIDATES the server certificate (no silent fallback), and it
 * ignores the Prisma-specific connection parameters. A wrong URL otherwise
 * surfaces as a timeout on the first request, so each problem is named here with
 * the fix. The URL itself is never echoed: it holds the password.
 */

export interface DatabaseUrlFinding {
  level: "error" | "warn" | "info";
  code:
    | "MISSING"
    | "INVALID"
    | "IGNORED_PARAMS"
    | "NO_TLS"
    | "TLS_NOT_VERIFIED"
    | "TLS_PRIVATE_CA";
  message: string;
}

/** Parameters the Prisma engine honoured and the `pg` adapter silently drops. */
const PRISMA_ONLY_PARAMS = ["pgbouncer", "connection_limit", "pool_timeout", "socket_timeout", "statement_cache_size"];

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function inspectDatabaseUrl(
  raw: string | undefined,
  options: { production: boolean; hasExtraCa: boolean },
): DatabaseUrlFinding[] {
  if (!raw?.trim()) {
    return [{ level: "error", code: "MISSING", message: "DATABASE_URL is not set." }];
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return [
      {
        level: "error",
        code: "INVALID",
        message: "DATABASE_URL is not a valid URL (a special character in the password must be percent-encoded).",
      },
    ];
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return [
      { level: "error", code: "INVALID", message: `DATABASE_URL must start with postgresql:// (found "${url.protocol}//").` },
    ];
  }

  const findings: DatabaseUrlFinding[] = [];

  const ignored = PRISMA_ONLY_PARAMS.filter((name) => url.searchParams.has(name));
  if (ignored.length > 0) {
    findings.push({
      level: "warn",
      code: "IGNORED_PARAMS",
      message:
        `${ignored.join(", ")} ha${ignored.length > 1 ? "ve" : "s"} no effect with the pg driver adapter: ` +
        "the pool uses the pg defaults (10 connections). Size it with the adapter options, not the URL.",
    });
  }

  if (!options.production || LOCAL_HOSTS.has(url.hostname)) return findings;

  const sslmode = url.searchParams.get("sslmode");
  if (!sslmode || sslmode === "disable" || sslmode === "allow") {
    findings.push({
      level: "warn",
      code: "NO_TLS",
      message: "The database connection is not encrypted. Add ?sslmode=require (or verify-full) to DATABASE_URL.",
    });
  } else if (sslmode === "no-verify") {
    findings.push({
      level: "warn",
      code: "TLS_NOT_VERIFIED",
      message:
        "sslmode=no-verify encrypts the connection but does not check the server identity. " +
        "Prefer sslmode=verify-full with the provider's CA in NODE_EXTRA_CA_CERTS.",
    });
  } else if (!options.hasExtraCa) {
    // require / prefer / verify-ca / verify-full: the certificate is validated
    findings.push({
      level: "info",
      code: "TLS_PRIVATE_CA",
      message:
        "The server certificate is validated. If the provider uses a private CA the first query fails with " +
        "'self-signed certificate in certificate chain': point NODE_EXTRA_CA_CERTS at the CA file.",
    });
  }

  return findings;
}

/** Logs the findings; a missing/invalid URL is logged as an error but never stops the server (build, tooling). */
export function reportDatabaseUrl(
  env: Record<string, string | undefined> = process.env,
  log: Pick<Console, "error" | "warn" | "info"> = console,
): DatabaseUrlFinding[] {
  const findings = inspectDatabaseUrl(env.DATABASE_URL, {
    production: env.NODE_ENV === "production",
    hasExtraCa: !!env.NODE_EXTRA_CA_CERTS,
  });
  for (const finding of findings) {
    log[finding.level](`[database] ${finding.code}: ${finding.message}`);
  }
  return findings;
}
