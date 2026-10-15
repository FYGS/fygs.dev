/**
 * Content-Security-Policy.
 *
 * Next.js emits inline bootstrap scripts, so `script-src` keeps 'unsafe-inline'
 * (a nonce policy would force every page to be rendered dynamically). The policy
 * still blocks what matters most: foreign plugins, base-tag hijacking, framing,
 * form posts to other origins, and connections/frames to arbitrary hosts.
 *
 * The playground runs user code, so it gets a looser policy of its own.
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
    "connect-src": ["'self'", "https://api.stripe.com", ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://calendly.com"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
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

export const CSP_HEADER = "Content-Security-Policy";

/** Every route except the playground, which has its own looser policy. */
export const NON_PLAYGROUND_SOURCE = "/((?!.*/tech-mastry/playground).*)";
