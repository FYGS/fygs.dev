// After `next build`: node scripts/ci/check-nonce-routes-dynamic.mjs [.next]
//
// Routes served with the nonce Content-Security-Policy (lib/csp.mjs NONCE_ROUTE_PREFIXES) must be rendered for each
// request: Next.js stamps the nonce while rendering, so a page that was prerendered at build time carries scripts WITHOUT
// the nonce and a browser enforcing the policy would block them (a blank page). This reads the build's prerender manifest
// and fails when such a page exists, listing it. Fix a listed page by making it dynamic (read cookies()/headers() or
// `await connection()`), or add its path to NONCE_EXCLUDED_PATHS in lib/csp.mjs (it then keeps the static policy).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const LOCALE = /^\/(fr|en|es)(?=\/|$)/;

/** Prerendered routes of the manifest that the nonce policy would apply to. */
export function prerenderedNonceRoutes(manifest, usesNonceCsp) {
  const routes = Object.keys(manifest?.routes ?? {});
  return routes
    .filter((route) => usesNonceCsp(route.replace(LOCALE, "") || "/"))
    .sort();
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const buildDir = path.resolve(process.argv[2] ?? path.join(root, ".next"));
  const manifestPath = path.join(buildDir, "prerender-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`::error::${manifestPath} not found: run \`next build\` first`);
    process.exit(1);
  }
  const { usesNonceCsp, NONCE_ROUTE_PREFIXES, NONCE_EXCLUDED_PATHS } = await import(pathToFileURL(path.join(root, "lib/csp.mjs")).href);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const offenders = prerenderedNonceRoutes(manifest, (route) => usesNonceCsp(route));

  if (offenders.length > 0) {
    console.error(`::error::${offenders.length} prerendered page(s) are inside the nonce areas (${NONCE_ROUTE_PREFIXES.join(", ")}):`);
    for (const route of offenders) console.error(`  ${route}`);
    console.error("Make them dynamic, or list them in NONCE_EXCLUDED_PATHS (lib/csp.mjs).");
    process.exit(1);
  }
  console.log(`Nonce areas: no prerendered page among ${Object.keys(manifest.routes ?? {}).length} prerendered routes`);

  // Exceptions that are rendered per request by now can get the stronger policy: say so
  const prerendered = Object.keys(manifest.routes ?? {}).map((route) => route.replace(LOCALE, "") || "/");
  const removable = NONCE_EXCLUDED_PATHS.filter((entry) => !prerendered.some((route) => route === entry || route.startsWith(`${entry}/`)));
  for (const entry of removable) console.log(`note: ${entry} is rendered per request now: it can leave NONCE_EXCLUDED_PATHS (lib/csp.mjs)`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`::error::${error.message}`);
    process.exit(1);
  });
}
