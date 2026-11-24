# Playground isolation: where learners' code runs

The playground and the exercises run code written by learners, by other learners (shared `?code=` links) and, through
the AI tutor, by a model. All of it is untrusted. This page says where each kind of code runs, what stops it from
reaching the site, and what the owner has to provide.

## The rule

> Code from a learner never runs in a page that has the site's origin.

It runs in a frame with `sandbox="allow-scripts"` and **never** `allow-same-origin`: the frame gets an opaque origin,
so it has no cookies, no `localStorage`/IndexedDB, no access to the DOM of the site and no session. A test
(`tests/unit/sandbox/vendor-bundle.test.ts`) fails if a playground iframe ever combines the two flags.

| What | Where it runs | Page | Policy (`lib/csp.mjs`) |
| --- | --- | --- | --- |
| JavaScript / TypeScript exercises and playground runs | Worker inside the frame | `/sandbox/runner.html` + `runner.js` | `buildSandboxCsp()` (eval for the worker, no network) |
| Python | Pyodide in a Worker inside the frame | `/sandbox/python.html` + `python-runner.js` | `buildSandboxCsp("python")` (WebAssembly, own files, no network) |
| HTML / CSS / React preview | The frame itself | `/sandbox/preview.html` + `preview.js` | `buildSandboxCsp("preview")` (public CDNs for scripts/styles only) |
| Node projects | WebContainer (StackBlitz) | the playground page | `buildPlaygroundCsp()` |

The page talks to a frame with `postMessage` only. `app/_lib/sandbox-channel.ts` accepts an answer only if it comes
from that frame's window (`event.source`), echoes the run's id **and** a fresh 128-bit nonce, and a watchdog destroys a
frame that stays silent past its time limit.

### What changed (security review, October 2026)

* Python used to run in the page of the site (`import js` gave a program the cookies, storage and API of the logged-in
  learner). It now runs in `/sandbox/python.html`. There is no in-page fallback.
* The previews were `blob:` documents, which inherit the origin of the site as soon as they are opened in a tab. They
  are now written into `/sandbox/preview.html` (opaque origin everywhere); the "open in a new tab" button only exists
  for WebContainer server URLs.
* The playground page's CSP no longer lists CDNs, `wasm-unsafe-eval`, or `blob:`/`data:` frames. Previews load the React
  bundle from the site (`/sandbox/vendor/react.js`, pinned with a Subresource Integrity hash) instead of unpkg.
* A project received through a link is validated (size, number of files, file names) and **never runs by itself**: a
  banner asks the learner to read it first, and the AI tutor is told the code comes from a link (`origin="shared-link"`).
* The AI tutor's output is filtered while it streams (images become their description, raw HTML and `javascript:` /
  `data:` links are removed) and links show the host they lead to. Mermaid diagrams run with `securityLevel: "strict"`
  and the SVG is cleaned (`lib/mermaid-svg.ts`) before it is inserted.

## Cross-origin isolation

The playground page is cross-origin isolated (COOP `same-origin` + COEP `require-corp`, needed by WebContainer). A frame
inside such a page must send the same COEP, and the files it loads from an opaque origin need a grant. `next.config.mjs`
therefore gives `/sandbox/**` `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Resource-Policy:
cross-origin`, and `/sandbox/pyodide/**` and `/sandbox/vendor/**` `Access-Control-Allow-Origin: *` (they are public files).

## What the owner must provide: the Python runtime

The package is not in `node_modules` and nothing is fetched from a CDN, so **Python is switched off** until the files
are added. The learner sees: « L'exécution Python est désactivée le temps de l'isolation : le moteur Python n'est pas
encore installé sur ce site. » Everything else works.

Put the files of a Pyodide release (0.26.4 was targeted) in `public/sandbox/pyodide/`:

```
pyodide.js
pyodide.asm.js
pyodide.asm.wasm
python_stdlib.zip
pyodide-lock.json
```

Packages that exercises import (numpy…) must be copied there as well, with the wheels named in `pyodide-lock.json`; an
import that is not shipped simply fails with Python's `ModuleNotFoundError`. After adding the files, check in a browser:
a `print("ok")` run works, a loop `while True: pass` stops at the time limit, and the console shows no CSP violation
(if the browser reports one for `eval`, the Python policy already allows `'unsafe-eval'` as a precaution; remove it if
it turns out to be unnecessary).

The React bundle is regenerated with `node scripts/build-sandbox-vendor.mjs` after every React upgrade (it writes
`public/sandbox/vendor/react.js` and `app/_lib/sandbox-vendor.generated.ts`; a test fails if they disagree).

## Challenge and exercise grading

The tests of an exercise run in the JavaScript sandbox, **in the learner's browser**. The harness (`public/sandbox/runner.js`)
captures the built-ins it relies on before the learner's code is loaded, runs everything in strict mode, talks to the
page over a private `MessageChannel` port, and closes the worker's own `postMessage`/`onmessage`. A program therefore
cannot rewrite `JSON.stringify`, `Object.is` or `postMessage` to turn a failing test green.

This is **not tamper-proof** against someone who controls their own browser (dev tools, a modified client): the grader
and the code it judges live on the learner's machine. For that reason:

* results of the sandbox are feedback for the learner and are **never persisted** as a grade, a badge or a certificate;
* anything that confers a credential must be graded **on the server** from the submitted source (the exam and quiz
  flows already do this and do not use the sandbox).

If a coding challenge ever has to count toward a certificate, grade it on the server in an isolated runtime, not here.

## The AI tutor

* Guests must pass `verifyHumanProof(request, "ai-guest")` (`lib/anti-automation`); the client solves it before sending.
* Each request reserves its worst case (input estimate + `max_tokens`) against the global daily budget **and** the
  subject's share (account 5 %, visitor address 1 %, unknown address a tenth of that) in one atomic Redis script, then
  gives back what the answer did not use. In production, if Redis is unreachable the budget fails closed and the tutor
  answers from the local analyser. See `lib/ai/budget.ts` for the environment variables.
* The system prompt marks everything from the editor (code, console, files, shared-link code) as data, never as
  instructions. Earlier assistant turns in the history are limited and neutralised: the client cannot forge a system
  turn or a long fake assistant memory.

## Residual risks

* The playground page keeps `'unsafe-eval'` (Monaco, WebContainer) and `connect-src https: wss:` (WebContainer).
  Learner code does not run there, but an XSS in the page would not be blocked by CSP.
* `/sandbox/preview.html` lets a preview load scripts from public CDNs (needed by tutorials that use them). A preview
  can therefore call out to those hosts and to any `https:` address with `fetch`: it has no cookies of the site, but it can
  send what it knows (what the learner typed into the preview) anywhere.
* Browser-side grading cannot be made tamper-proof (see above).
* If the human-proof mode of `lib/anti-automation` is not satisfied by a visitor's browser, the visitor gets the local
  analyser instead of the model.
