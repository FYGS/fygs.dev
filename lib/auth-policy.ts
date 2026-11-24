import { cleanDisplayName } from "@/lib/html-escape";

/**
 * The rules of the authentication layer that do not need a database: who counts as staff, what an account may be
 * called, which avatar addresses are accepted, how addresses are normalised. `lib/auth.ts` wires them into
 * better-auth; they live here so that tests can state each rule on its own.
 */

export const STAFF_ROLES = ["ADMIN", "INSTRUCTOR"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: unknown): role is StaffRole {
  return role === "ADMIN" || role === "INSTRUCTOR";
}

/**
 * A staff account without a second factor holds no staff powers. The session handed to the whole application reports
 * the role STUDENT for it (see `customSession` in lib/auth.ts), so that every role check of every page, route and
 * action fails closed with no per-call change; `pendingStaffRole` lets the setup page and the admin layout know who
 * is actually signing in.
 */
export function effectiveRole(user: { role?: string | null; twoFactorEnabled?: boolean | null }): {
  role: string;
  pendingStaffRole: StaffRole | null;
} {
  const role = user.role ?? "STUDENT";
  if (isStaffRole(role) && !user.twoFactorEnabled) return { role: "STUDENT", pendingStaffRole: role };
  return { role, pendingStaffRole: null };
}

/** `Ada@Example.COM ` -> `ada@example.com`. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * The key under which sign-in and reset attempts for an address are counted: lower case, and without the `+tag` of the
 * local part, so `ada+1@x.fr`, `ada+2@x.fr`... all count against `ada@x.fr`.
 */
export function rateLimitEmailKey(email: string): string {
  const [local, ...rest] = normalizeEmail(email).split("@");
  const domain = rest.join("@");
  const base = local.split("+")[0] || local;
  return domain ? `${base}@${domain}` : base;
}

/** Path of an auth request as the rate-limit table knows it: no trailing or doubled slash, lower case. */
export function normalizeAuthPath(pathname: string): string {
  const path = pathname.replace(/^\/api\/auth/i, "").replace(/\/{2,}/g, "/").replace(/\/+$/, "").toLowerCase();
  return path === "" ? "/" : path;
}

/** Hosts whose profile pictures are accepted as they are (identity providers, avatar services). */
const FIXED_AVATAR_HOSTS = ["avatars.githubusercontent.com", "lh3.googleusercontent.com", "www.gravatar.com"];

function hostOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Our own storage hosts, from the environment (uploaded avatars). */
function storageHosts(env: NodeJS.ProcessEnv): string[] {
  return [hostOf(env.S3_PUBLIC_URL), hostOf(env.S3_IMAGES_PUBLIC_URL)].filter(
    (host): host is string => host !== null,
  );
}

/** A profile picture is an `https:` address on a known host: anything else is dropped, not fetched or shown. */
export function isAllowedAvatarUrl(value: unknown, env: NodeJS.ProcessEnv = process.env): boolean {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    return [...FIXED_AVATAR_HOSTS, ...storageHosts(env)].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;

/** A display name from user input: no control, zero-width or bidi-override characters, collapsed spaces, capped. */
export function cleanName(value: unknown): string {
  return cleanDisplayName(value, MAX_NAME_LENGTH);
}

/** The name an account gets when the one it brought is empty after cleaning: the start of the address. */
function nameFromEmail(email: string): string {
  const local = cleanName(email.split("@")[0]);
  return local.length >= MIN_NAME_LENGTH ? local : "Utilisateur";
}

interface UserInput {
  email?: unknown;
  name?: unknown;
  image?: unknown;
}

/**
 * What a new account is allowed to carry. The e-mail is trimmed and lower-cased, the name cleaned (and replaced by the
 * start of the address when nothing usable is left), the picture kept only when it is on an accepted host.
 */
export function sanitizeNewUser(input: UserInput, env: NodeJS.ProcessEnv = process.env): { email?: string; name?: string; image?: string | null } {
  const out: { email?: string; name?: string; image?: string | null } = {};
  if (typeof input.email === "string") out.email = normalizeEmail(input.email);
  const cleaned = cleanName(input.name);
  out.name = cleaned.length >= MIN_NAME_LENGTH ? cleaned : nameFromEmail(out.email ?? String(input.email ?? ""));
  if (input.image !== undefined) out.image = isAllowedAvatarUrl(input.image, env) ? (input.image as string) : null;
  return out;
}

/** The same rules for an update: only the fields present are touched, and a name that cleans to nothing is refused. */
export function sanitizeUserUpdate(
  input: UserInput,
  env: NodeJS.ProcessEnv = process.env,
): { data: { email?: string; name?: string; image?: string | null }; invalidName: boolean } {
  const data: { email?: string; name?: string; image?: string | null } = {};
  let invalidName = false;
  if (typeof input.email === "string") data.email = normalizeEmail(input.email);
  if (input.name !== undefined) {
    const cleaned = cleanName(input.name);
    if (cleaned.length < MIN_NAME_LENGTH) invalidName = true;
    else data.name = cleaned;
  }
  if (input.image !== undefined) data.image = input.image === null || !isAllowedAvatarUrl(input.image, env) ? null : (input.image as string);
  return { data, invalidName };
}

/** Sign-in paths that hand a session over after a provider (Google, GitHub) vouched for the person: no second factor is asked. */
export function isProviderSignInPath(path: string | undefined | null): boolean {
  if (!path) return false;
  return /^\/(callback\/|oauth2\/callback\/|sign-in\/social|sign-in\/oauth2|one-tap\/)/i.test(path);
}
