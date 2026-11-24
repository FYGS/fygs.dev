/**
 * Log redaction: the last line of defence between a call site and the log
 * pipeline. Applied centrally by lib/structured-logger.ts, and usable on its
 * own (`redact(value)`) before anything is handed to console.* or a third party.
 *
 * Policy (also in SECURITY.md):
 * - Values under personal or secret-looking keys are replaced by "[REDACTED]".
 * - Email addresses found inside any string are masked as `a***@domain`.
 * - IPv4 addresses inside strings keep their first two octets (`203.0.x.x`);
 *   bearer tokens and well-known API key formats are replaced.
 * - Errors are reduced to name, code, message and a short stack, all masked.
 * - Opaque identifiers (userId, courseId, ...) are kept: they are what lets an
 *   operator correlate a log line without knowing who the person is.
 */

export const REDACTED = "[REDACTED]";
export const CIRCULAR = "[Circular]";
const MAX_DEPTH = 8;
const MAX_ARRAY = 100;
const MAX_STRING = 2_000;
const MAX_STACK_LINES = 8;

/** Normalised (lower-case, letters and digits only) keys whose value is dropped. */
const EXACT_KEYS = new Set([
  "email",
  "emails",
  "mail",
  "to",
  "cc",
  "bcc",
  "recipient",
  "recipients",
  "replyto",
  "name",
  "firstname",
  "lastname",
  "fullname",
  "displayname",
  "username",
  "phone",
  "phonenumber",
  "mobile",
  "tel",
  "address",
  "street",
  "city",
  "postalcode",
  "zip",
  "ip",
  "ipaddress",
  "clientip",
  "remoteaddress",
  "xforwardedfor",
  "xrealip",
  "useragent",
  "birthdate",
  "dob",
  "iban",
  "bic",
  "cvc",
  "cvv",
  "card",
  "cardnumber",
  "pan",
  "jwt",
  "bearer",
  "authorization",
  "cookie",
  "setcookie",
  "cookies",
  // message bodies and free text written by people or by models
  "body",
  "html",
  "text",
  "content",
  "prompt",
  "messages",
  "comment",
  "subject",
  "code",
  "source",
  "sourcecode",
  "stdin",
]);

/** Substrings that mark a key as secret wherever they appear. */
const SECRET_FRAGMENTS = ["password", "passwd", "passphrase", "secret", "apikey", "privatekey", "credential", "signature"];

function normaliseKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * `code` is both a source snippet and a harmless error/status code, so it is
 * only dropped when the value is long enough to be a program or message.
 */
const CODE_KEYS = new Set(["code", "source", "content", "text", "body", "html", "subject", "comment", "prompt", "stdin", "sourcecode"]);
const SHORT_VALUE = 40;

export function isSensitiveKey(key: string): boolean {
  const k = normaliseKey(key);
  if (!k) return false;
  if (EXACT_KEYS.has(k)) return true;
  // accessToken, refresh_token, x-csrf-token... but not inputTokens / tokenCount
  if (k.endsWith("token")) return true;
  // userEmail, customerEmail, instructorEmail, billingPhone...
  if (k.endsWith("email") || k.endsWith("phone") || k.endsWith("ipaddress")) return true;
  return SECRET_FRAGMENTS.some((f) => k.includes(f));
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const IPV4_RE = /\b(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}\b/g;
const BEARER_RE = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi;
const KEY_RE = /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}|\bwhsec_[A-Za-z0-9]{8,}|\bsk-ant-[A-Za-z0-9_-]{8,}|\bsk-[A-Za-z0-9]{20,}|\bAKIA[0-9A-Z]{16}\b/g;
const JWT_RE = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\b/g;

/** `jane.doe@example.com` -> `j***@example.com`. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return REDACTED;
  return `${email[0]}***@${email.slice(at + 1)}`;
}

/** Mask personal data and credentials inside a free-form string. */
export function redactString(input: string): string {
  let out = input.length > MAX_STRING ? `${input.slice(0, MAX_STRING)}...[truncated]` : input;
  out = out.replace(EMAIL_RE, (m) => maskEmail(m));
  out = out.replace(JWT_RE, REDACTED);
  out = out.replace(BEARER_RE, (_m, scheme: string) => `${scheme} ${REDACTED}`);
  out = out.replace(KEY_RE, REDACTED);
  out = out.replace(IPV4_RE, (_m, a: string, b: string) => `${a}.${b}.x.x`);
  return out;
}

function redactError(error: Error, seen: WeakSet<object>, depth: number): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: error.name,
    message: redactString(error.message),
  };
  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" || typeof code === "number") out.code = code;
  if (error.stack) {
    out.stack = redactString(error.stack.split("\n").slice(0, MAX_STACK_LINES).join("\n"));
  }
  if ("cause" in error && (error as { cause?: unknown }).cause !== undefined) {
    out.cause = walk((error as { cause?: unknown }).cause, seen, depth + 1);
  }
  return out;
}

function walk(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (value === null || value === undefined) return value;
  switch (typeof value) {
    case "string":
      return redactString(value);
    case "number":
    case "boolean":
      return value;
    case "bigint":
      return value.toString();
    case "function":
    case "symbol":
      return undefined;
  }
  const obj = value as object;
  if (seen.has(obj)) return CIRCULAR;
  if (depth >= MAX_DEPTH) return "[MaxDepth]";
  seen.add(obj);
  try {
    if (obj instanceof Error) return redactError(obj, seen, depth);
    if (obj instanceof Date) return Number.isNaN(obj.getTime()) ? null : obj.toISOString();
    if (Array.isArray(obj)) {
      const items = obj.slice(0, MAX_ARRAY).map((v) => walk(v, seen, depth + 1));
      if (obj.length > MAX_ARRAY) items.push(`[${obj.length - MAX_ARRAY} more]`);
      return items;
    }
    if (obj instanceof Map) return walk(Object.fromEntries(obj), seen, depth);
    if (obj instanceof Set) return walk([...obj], seen, depth);
    if (ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer) return "[Binary]";

    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(obj)) {
      if (isSensitiveKey(key)) {
        const k = normaliseKey(key);
        // Short harmless values under ambiguous keys (a status "code") stay readable
        if (CODE_KEYS.has(k) && typeof v === "string" && v.length <= SHORT_VALUE && !/\s|@/.test(v)) {
          out[key] = redactString(v);
        } else if (CODE_KEYS.has(k) && (typeof v === "number" || typeof v === "boolean")) {
          out[key] = v;
        } else {
          out[key] = REDACTED;
        }
        continue;
      }
      out[key] = walk(v, seen, depth + 1);
    }
    return out;
  } finally {
    // Siblings may legitimately share a reference; only true cycles are flagged
    seen.delete(obj);
  }
}

/** Return a deep, redacted copy of `value`. Never throws and never mutates its input. */
export function redact<T = unknown>(value: T): T {
  try {
    return walk(value, new WeakSet(), 0) as T;
  } catch {
    return REDACTED as unknown as T;
  }
}

// ─── console patch ───────────────────────────────────────────────────────────

const PATCHED = Symbol.for("fygs.console-redaction");
const METHODS = ["log", "info", "warn", "error", "debug"] as const;

/**
 * Route every console.* call through `redact`, so the ~hundreds of
 * `console.error("...", error)` call sites (Stripe errors carry customer
 * details, SMTP errors carry recipients) cannot leak personal data. Idempotent.
 * Installed from instrumentation.ts.
 */
export function installConsoleRedaction(target: Console = console): void {
  const flagged = target as unknown as Record<symbol, boolean>;
  if (flagged[PATCHED]) return;
  flagged[PATCHED] = true;
  for (const method of METHODS) {
    const original = target[method].bind(target);
    target[method] = (...args: unknown[]) => original(...args.map((arg) => redact(arg)));
  }
}
