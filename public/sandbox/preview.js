/**
 * Preview host: shows the page a learner is building (HTML, CSS, React) in the playground.
 *
 * The playground embeds this page as <iframe sandbox="allow-scripts allow-modals allow-forms"> (opaque origin: no
 * cookies, storage or session of the site). Its policy is the "preview" one of lib/csp.mjs (buildSandboxCsp): scripts
 * and styles from the usual public CDNs, nothing of the site. The learner's HTML used to be a `blob:` document that
 * inherited the site's origin the moment it was opened in a tab; it is now written into this page instead, so it is
 * the same sandboxed document wherever it is shown.
 *
 * Protocol (postMessage; the nonce is the iframe's address fragment, chosen by the playground for this render):
 *   page   -> parent  { type: "preview-ready", nonce }
 *   parent -> page    { type: "render", nonce, html }       (once; the document is then replaced by `html`)
 * Only the parent window is listened to, and only with the right nonce. After the render, the learner's page talks to
 * the playground the way it always did (console lines posted to window.parent).
 */
"use strict";

(function preview() {
  var MAX_HTML_CHARS = 2000000;
  var nonce = (location.hash || "").slice(1);
  if (!/^[0-9a-f]{32}$/.test(nonce)) return;

  function onMessage(event) {
    if (event.source !== window.parent) return;
    var message = event.data;
    if (!message || message.type !== "render" || message.nonce !== nonce) return;
    if (typeof message.html !== "string" || message.html.length > MAX_HTML_CHARS) return;
    window.removeEventListener("message", onMessage);
    document.open();
    document.write(message.html);
    document.close();
  }

  window.addEventListener("message", onMessage);
  window.parent.postMessage({ type: "preview-ready", nonce: nonce }, "*");
})();
