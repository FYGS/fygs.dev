/**
 * Content-Security-Policy.
 *
 * Decision (see docs/security-ops-2026-10.md for the evidence, and docs/SECURITY-OPERATIONS.md for the switch): the
 * policy sent on every page keeps 'unsafe-inline' for scripts. Next.js streams the React Server Components payload in
 * inline `self.__next_f.push(...)` scripts whose content differs on every page, so a hash list is impossible, and a
 * nonce can only be stamped on pages rendered per request, which would turn the ~540 statically generated pages into
 * dynamic ones (no CDN cache, one render per hit). The pages that ARE rendered per request (signed-in areas: admin,
 * dashboard, profile, learning, community, auth) get a per-request nonce and no 'unsafe-inline' (section "Per-request
 * nonces" below, applied by proxy.ts).
 *
 * What the enforced policy does block: foreign plugins, base-tag hijacking,
 * framing, form posts to other origins, connections/frames to arbitrary hosts,
 * and inline event-handler attributes (`script-src-attr 'none'`). The site's own
 * service-worker registration is a React component (components/pwa), not an
 * inline script, so the only executable inline scripts are Next.js's.
 *
 * A stricter policy without 'unsafe-inline' is sent in Report-Only mode to
 * /api/csp-report, to learn from real browsers what a future nonce/hash policy
 * would break.
 *
 * The playground runs user code, so it gets a looser policy of its own. The exercises
 * and coding challenges run theirs in the code sandbox (public/sandbox), a separate
 * document with the strictest policy that still lets a worker evaluate code.
 */
import { THEME_SCRIPT_SHA256 } from "./theme-init-script.mjs";
export { THEME_SCRIPT_SHA256 };

const defaultDev = process.env.NODE_ENV !== "production";

/** @param {Record<string, string[]>} directives */
function serialize(directives) {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ");
}

/**
 * The origin errors are reported to: "https://KEY@o123.ingest.sentry.io/456" -> "https://o123.ingest.sentry.io".
 * Only https is accepted; anything else yields null (and no CSP source).
 * @param {string | undefined} dsn
 */
export function sentryOrigin(dsn) {
  try {
    const url = new URL(dsn ?? "");
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

/** The browser may report errors to the monitoring host only when one is configured (read when the headers are built). */
function monitoringSources() {
  const origin = sentryOrigin(process.env.NEXT_PUBLIC_SENTRY_DSN);
  return origin ? [origin] : [];
}

const common = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "font-src": ["'self'", "data:"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "media-src": ["'self'", "blob:", "https:"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
};

/** Lesson videos hosted on YouTube or Vimeo, embedded in their privacy-enhanced players (components/learning/embedded-video). */
export const VIDEO_EMBED_SOURCES = ["https://www.youtube-nocookie.com", "https://player.vimeo.com"];

/** @param {boolean} [isDev] development adds eval (React refresh) and websockets (HMR) */
export function buildGlobalCsp(isDev = defaultDev) {
  return serialize({
    ...common,
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), "https://js.stripe.com"],
    "script-src-attr": ["'none'"],
    "connect-src": ["'self'", "https://api.stripe.com", ...monitoringSources(), ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://calendly.com", ...VIDEO_EMBED_SOURCES],
  });
}

export const CSP_REPORT_PATH = "/api/csp-report";
export const REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only";
export const REPORTING_ENDPOINTS_HEADER = "Reporting-Endpoints";
export const REPORTING_ENDPOINTS_VALUE = `csp="${CSP_REPORT_PATH}"`;

/**
 * Candidate policy, report-only: the enforced one minus 'unsafe-inline' for
 * scripts and 'unsafe-eval' even in dev. Next's inline bootstrap scripts will
 * show up as `inline` violations; the point is to see anything ELSE (third-party
 * scripts, eval, unexpected origins) before moving to nonces.
 * @param {boolean} [isDev]
 */
export function buildReportOnlyCsp(isDev = defaultDev) {
  return serialize({
    ...common,
    "script-src": ["'self'", "https://js.stripe.com"],
    "script-src-attr": ["'none'"],
    "style-src": ["'self'"],
    "connect-src": ["'self'", "https://api.stripe.com", ...monitoringSources(), ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://calendly.com", ...VIDEO_EMBED_SOURCES],
    "report-uri": [CSP_REPORT_PATH],
    "report-to": ["csp"],
  });
}

// ─── Per-request nonces ───────────────────────────────────────────────────────
//
// Pages that are rendered for each request (the signed-in areas) can carry a nonce: proxy.ts creates one per request,
// puts it in the request's Content-Security-Policy header (Next.js reads it there and stamps it on its own scripts, see
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md) and in the response header. The policy then has
// no 'unsafe-inline' for scripts: an HTML injection can no longer become script execution. 'strict-dynamic' lets the
// scripts that carry the nonce load the ones they need (Stripe.js).
//
// Prerendered pages cannot carry a per-request nonce (they are rendered once, at build time), so they keep the policy
// above; `scripts/ci/check-nonce-routes-dynamic.mjs` fails the build when a route listed here is prerendered.
// style-src keeps 'unsafe-inline': inline styles cannot run code, and React/Radix/Tailwind set many of them.
//
// Switch: CSP_NONCE_ENFORCE=0 (or false/off/no) sends the nonce policy as Report-Only everywhere again, so a problem
// found in production is a variable change and a restart, not a deploy.

/** Locale-less route prefixes served with the enforced nonce policy. */
export const NONCE_ROUTE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/profile",
  "/learn",
  "/community",
  "/certificates",
  "/auth",
];

/**
 * Pages under those prefixes that are prerendered at build time (no cookie, header or search parameter is read), so
 * they cannot carry a nonce and stay on the static policy. The /auth pages used to be listed here: they are now dynamic
 * (`export const dynamic = "force-dynamic"` in their layout) and covered, since they are where a password is typed. `scripts/ci/check-nonce-routes-dynamic.mjs` fails the build when a page
 * that is NOT listed here is prerendered, and tells which listed ones are dynamic by now.
 * Extend at runtime with CSP_NONCE_EXCLUDE (comma separated) if a page has to be excluded urgently.
 */
export const NONCE_EXCLUDED_PATHS = [
  "/dashboard/certificates", // a redirect to another tab, prerendered
];

const OFF_VALUES = new Set(["0", "false", "off", "no"]);

/** True unless CSP_NONCE_ENFORCE says otherwise. */
export function nonceEnforced(env = process.env) {
  return !OFF_VALUES.has((env.CSP_NONCE_ENFORCE ?? "").trim().toLowerCase());
}

/**
 * Whether the page at this locale-less path gets the enforced nonce policy.
 * @param {string} pathWithoutLocale e.g. "/dashboard/billing"
 */
export function usesNonceCsp(pathWithoutLocale, env = process.env) {
  const path = pathWithoutLocale.length > 1 ? pathWithoutLocale.replace(/\/+$/, "") : pathWithoutLocale;
  const excluded = [...NONCE_EXCLUDED_PATHS, ...(env.CSP_NONCE_EXCLUDE ?? "").split(",").map((entry) => entry.trim())];
  if (excluded.some((entry) => entry && (path === entry || path.startsWith(`${entry}/`)))) return false;
  return NONCE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** A fresh, unpredictable nonce (128 random bits, base64). Works in the Node and the Edge runtimes. */
export function generateNonce() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * The nonce-based policy for one request.
 * @param {string} nonce
 * @param {{ isDev?: boolean, reportOnly?: boolean }} [options]
 */
export function buildNonceCsp(nonce, { isDev = defaultDev, reportOnly = false } = {}) {
  return serialize({
    ...common,
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      // the theme initialisation script (lib/theme-init-script.mjs), allowed by its hash
      `'sha256-${THEME_SCRIPT_SHA256}'`,
      "'strict-dynamic'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      "https://js.stripe.com",
    ],
    "script-src-attr": ["'none'"],
    "connect-src": ["'self'", "https://api.stripe.com", ...monitoringSources(), ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://calendly.com", ...VIDEO_EMBED_SOURCES],
    ...(reportOnly ? { "report-uri": [CSP_REPORT_PATH], "report-to": ["csp"] } : {}),
  });
}

/**
 * Playground page. What a learner writes does not run in this page: JavaScript exercises, Python and the HTML/React
 * preview each run in an opaque-origin page under /sandbox (see buildSandboxCsp), so this page loads no script from a
 * CDN, needs no WebAssembly, and frames no blob:/data: document. What stays: eval for the editor tooling, and https
 * frames for the WebContainer dev-server preview.
 */
/** @param {boolean} [isDev] */
export function buildPlaygroundCsp(isDev = defaultDev) {
  return serialize({
    ...common,
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
    "connect-src": ["'self'", "blob:", "https:", "wss:", ...(isDev ? ["ws:"] : [])],
    "frame-src": ["'self'", "https:"],
    "child-src": ["'self'", "https:"],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "font-src": ["'self'", "data:", "https:"],
  });
}

/**
 * The sandbox pages under /sandbox: embedded as <iframe sandbox="allow-scripts">, so their origin is opaque (no
 * cookies, storage or DOM of the site), and only the site can embed them. One policy per runtime:
 *
 *  - "javascript" (runner.html): evaluates learners' JavaScript in a worker. The only capability is eval: no network
 *    (`connect-src` is inherited by the worker), no images, styles, frames, forms or plugins.
 *  - "python" (python.html): runs Pyodide (WebAssembly) in a worker. Adds `wasm-unsafe-eval` and may fetch the
 *    runtime's own files from the site (`connect-src 'self'`; they are served with CORS headers, see next.config.mjs).
 *    Nothing else is reachable, and the site's API answers an opaque origin without cookies or CORS grants.
 *  - "preview" (preview.html): shows the page a learner is building. It must be able to do what a web page does:
 *    inline scripts, public CDNs, HTTPS requests and frames; it can do nothing as the site because its origin is opaque.
 *
 * @param {"javascript" | "python" | "preview"} [runtime]
 */
export function buildSandboxCsp(runtime = "javascript") {
  const sealed = {
    "base-uri": ["'none'"],
    "form-action": ["'none'"],
    "frame-ancestors": ["'self'"],
  };
  if (runtime === "python") {
    return serialize({
      "default-src": ["'none'"],
      "script-src": ["'self'", "'unsafe-eval'", "'wasm-unsafe-eval'"],
      "worker-src": ["blob:"],
      "connect-src": ["'self'"],
      ...sealed,
    });
  }
  if (runtime === "preview") {
    return serialize({
      "default-src": ["'none'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "blob:",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://esm.sh",
        "https://ga.jspm.io",
        "https://cdnjs.cloudflare.com",
      ],
      "style-src": ["'self'", "'unsafe-inline'", "https:"],
      "img-src": ["data:", "blob:", "https:"],
      "font-src": ["data:", "https:"],
      "media-src": ["blob:", "https:"],
      "connect-src": ["blob:", "https:", "wss:"],
      "frame-src": ["blob:", "data:", "https:"],
      "worker-src": ["blob:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'none'"],
      "frame-ancestors": ["'self'"],
    });
  }
  return serialize({
    "default-src": ["'none'"],
    "script-src": ["'self'", "'unsafe-eval'"],
    "worker-src": ["blob:"],
    "connect-src": ["'none'"],
    ...sealed,
  });
}

export const CSP_HEADER = "Content-Security-Policy";

/** Every route except the playground and the code sandbox, which have a policy of their own. */
export const NON_PLAYGROUND_SOURCE = "/((?!.*/tech-mastry/playground|sandbox/).*)";

/** The code sandbox documents and scripts. */
export const SANDBOX_SOURCE = "/sandbox/:path*";
