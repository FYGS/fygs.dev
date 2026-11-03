/**
 * Where a visitor may be sent back to after signing in, paying or verifying an address: a path of this site, nothing
 * else. Values come from the URL (`callbackUrl`, `returnTo`...), i.e. from whoever built the link.
 */

const FALLBACK = "/dashboard";

/** C0 and C1 controls, DEL, line and paragraph separators, no-break and zero-width spaces. */
const FORBIDDEN_CHARACTERS = new RegExp("[\u0000-\u001F\u007F-\u009F\u00A0\u2028\u2029\u200B]");

/**
 * `raw` if it is a path of this site, else `fallback`. Rejected: other origins (`https://evil.tld`), protocol-relative
 * (`//evil.tld`), backslash tricks (`/\evil.tld`), `javascript:`/`data:` schemes, control characters and tabs/newlines
 * that browsers strip before parsing (`/\t/evil.tld`), and anything that does not resolve to the same origin.
 * The value may be percent-encoded once, as it travels in a query string.
 */
export function safeInternalPath(raw: string | null | undefined, fallback: string = FALLBACK): string {
  if (!raw) return fallback;
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return fallback;
  }
  // Control characters: browsers drop tab and newline inside URLs, which turns `/	/evil` into `//evil`
  if (FORBIDDEN_CHARACTERS.test(value)) return fallback;
  if (value.length > 2048) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\")) return fallback;
  try {
    const base = "https://site.invalid";
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return fallback;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
