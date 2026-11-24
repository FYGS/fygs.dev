/**
 * The seed writes demonstration data, including an administrator and an instructor with verified e-mail addresses and no
 * password. It must never run against a real database by accident: `db:seed:prod`-style scripts were one keystroke from a
 * production reset. It runs on a local database, or on another one only when two variables say so on purpose.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export interface SeedEnvironment {
  NODE_ENV?: string;
  DATABASE_URL?: string;
  SEED_ALLOW_PROD?: string;
  SEED_CONFIRM_DATABASE?: string;
}

function parse(url: string | undefined): URL | null {
  if (!url) return null;
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/** The database name of a connection string (`/fygs_test` -> `fygs_test`). */
export function databaseName(url: string | undefined): string {
  return decodeURIComponent(parse(url)?.pathname.replace(/^\//, "") ?? "");
}

/** Why the seed must not run with this environment, or null when it may. */
export function seedRefusal(env: SeedEnvironment): string | null {
  const url = parse(env.DATABASE_URL);
  if (!url) return "DATABASE_URL is not set or not a valid URL";

  const local = LOCAL_HOSTS.has(url.hostname);
  const production = env.NODE_ENV === "production";
  if (local && !production) return null;

  const name = databaseName(env.DATABASE_URL);
  const wanted = env.SEED_ALLOW_PROD === "1" && Boolean(name) && env.SEED_CONFIRM_DATABASE === name;
  if (wanted) return null;

  const where = [production && "NODE_ENV=production", !local && `host "${url.hostname}" is not local`].filter(Boolean).join(" and ");
  return (
    `Refusing to seed: ${where}. The seed creates demo accounts (including an administrator). ` +
    `To do it on purpose set SEED_ALLOW_PROD=1 and SEED_CONFIRM_DATABASE=${name || "<database name>"}.`
  );
}

export function assertSeedAllowed(env: SeedEnvironment = process.env): void {
  const refusal = seedRefusal(env);
  if (refusal) throw new Error(refusal);
}
