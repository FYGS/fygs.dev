/**
 * The `sandbox` attribute of the playground preview iframe.
 *
 * A page from the learner's own code (`srcdoc`) never gets `allow-same-origin`. A dev server started in the WebContainer is served
 * from its own origin and needs it to run, but `allow-scripts` together with `allow-same-origin` lets the framed page remove the
 * sandbox altogether when it shares the origin of the embedding site: so it is granted only to an address that is on another
 * origin than the site.
 */
const BASE = "allow-scripts allow-modals allow-forms";

export function previewSandbox(serverUrl: string | null, siteOrigin: string): string {
  if (!serverUrl || !siteOrigin) return BASE;
  try {
    const url = new URL(serverUrl);
    if (url.protocol !== "https:" || url.origin === siteOrigin) return BASE;
    return `${BASE} allow-same-origin allow-popups`;
  } catch {
    return BASE;
  }
}
