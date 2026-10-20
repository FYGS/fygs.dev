/**
 * Content-Security-Policy.
 *
 * Decision (see docs/security-ops-2026-10.md for the evidence): `script-src`
 * keeps 'unsafe-inline' in the ENFORCED policy. Next.js streams the React Server
 * Components payload in inline `self.__next_f.push(...)` scripts whose content
 * differs on every page, so a hash list is impossible, and a nonce can only be
 * stamped on pages rendered per request, which would turn the ~540 statically
 * generated pages into dynamic ones (no CDN cache, one render per hit).
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
const defaultDev = process.env.NODE_ENV !== "production";

/** @param {Record<string, string[]>} directives */
function serialize(directives) {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ");
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

/** @param {boolean} [isDev] development adds eval (React refresh) and websockets (HMR) */
export function buildGlobalCsp(isDev = defaultDev) {
  return serialize({
    ...common,
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), "https://js.stripe.com"],
    "script-src-attr": ["'none'"],
    "connect-src": ["'self'", "https://api.stripe.com", ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://calendly.com"],
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
    "connect-src": ["'self'", "https://api.stripe.com", ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://calendly.com"],
    "report-uri": [CSP_REPORT_PATH],
    "report-to": ["csp"],
  });
}

/**
 * Playground: Babel standalone and Pyodide need eval/wasm-eval, user code loads
 * packages from CDNs and calls arbitrary APIs, and the preview is a blob:/data:
 * iframe next to the WebContainer iframes.
 */
/** @param {boolean} [isDev] */
export function buildPlaygroundCsp(isDev = defaultDev) {
  return serialize({
    ...common,
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "'wasm-unsafe-eval'",
      "blob:",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://esm.sh",
      "https://ga.jspm.io",
      "https://cdnjs.cloudflare.com",
    ],
    "connect-src": ["'self'", "blob:", "https:", "wss:", ...(isDev ? ["ws:"] : [])],
    "frame-src": ["'self'", "blob:", "data:", "https:"],
    "child-src": ["'self'", "blob:", "https:"],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "font-src": ["'self'", "data:", "https:"],
  });
}

/**
 * The code sandbox (/sandbox/runner.html): embedded as <iframe sandbox="allow-scripts">, so
 * its origin is opaque (no cookies, storage or DOM of the site), and it evaluates learners'
 * code in a worker. The only capability it has is eval: no network (`connect-src` is inherited
 * by the worker), no images, styles, frames, forms or plugins, and only the site can embed it.
 */
export function buildSandboxCsp() {
  return serialize({
    "default-src": ["'none'"],
    "script-src": ["'self'", "'unsafe-eval'"],
    "worker-src": ["blob:"],
    "connect-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'none'"],
    "frame-ancestors": ["'self'"],
  });
}

export const CSP_HEADER = "Content-Security-Policy";

/** Every route except the playground and the code sandbox, which have a policy of their own. */
export const NON_PLAYGROUND_SOURCE = "/((?!.*/tech-mastry/playground|sandbox/).*)";

/** The code sandbox documents and scripts. */
export const SANDBOX_SOURCE = "/sandbox/:path*";
