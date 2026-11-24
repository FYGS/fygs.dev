/**
 * Python sandbox: runs a learner's Python (Pyodide, i.e. CPython compiled to WebAssembly) away from the site.
 *
 * Loaded by /sandbox/python.html, which the site embeds as <iframe sandbox="allow-scripts"> (opaque origin: no
 * cookies, storage or DOM of the site) under the "python" policy of lib/csp.mjs (buildSandboxCsp). The Python itself
 * runs in a Worker built from `pythonWorkerMain` below, so that a runaway loop is stopped by terminating the worker.
 * Python never runs in the page of the site: before this file existed it did, and `import js` gave a program the
 * site's cookies, storage and API (see docs/playground-isolation.md).
 *
 * Pyodide is SELF-HOSTED under /sandbox/pyodide/ (see docs/playground-isolation.md for the files to put there). When
 * they are missing the worker answers `unavailable` and the site tells the learner so; nothing is loaded from a CDN.
 *
 * Protocol between the site and this frame (postMessage), the same as the JavaScript sandbox:
 *   frame  -> site    { type: "ready" }
 *   site   -> frame   { type: "run", id, nonce, code, timeLimitMs }
 *   frame  -> site    { type: "result", id, nonce, ok, output, logs, errors, timedOut, unavailable?, totalMs }
 * The frame only listens to its parent window and echoes the run's `nonce` (app/_lib/sandbox-channel.ts).
 *
 * Between this page and its worker, a private MessageChannel port (handed over once) carries the request and the
 * answer; the worker's own `postMessage` and `onmessage` are closed before any Python runs, and the built-ins the
 * harness relies on are captured first, so a program cannot speak for the harness.
 */
"use strict";

/**
 * The body of the worker. It is serialised with `toString()`, so it must not use anything from the enclosing scope
 * (and its "use strict" directive must be repeated inside it).
 */
function pythonWorkerMain() {
  "use strict";

  var MAX_LINES = 300;
  var MAX_LINE_CHARS = 2000;
  var MAX_TOTAL_CHARS = 100000;

  var uncurry = Function.prototype.bind.bind(Function.prototype.call);
  var applyFn = Reflect.apply;
  var StringOf = String;
  var arrayPush = uncurry(Array.prototype.push);
  var stringSlice = uncurry(String.prototype.slice);
  var logs = [];
  var errors = [];
  var total = 0;
  var pyodide = null;
  var loading = null;
  var unavailable = false;

  function keep(list, text) {
    if (list.length >= MAX_LINES || total >= MAX_TOTAL_CHARS) return;
    var line = StringOf(text);
    if (line.length > MAX_LINE_CHARS) line = stringSlice(line, 0, MAX_LINE_CHARS) + "…";
    total += line.length;
    arrayPush(list, line);
  }

  function describe(error) {
    try {
      return error && error.message ? StringOf(error.message) : StringOf(error);
    } catch {
      return "Error";
    }
  }

  /** Loads the self-hosted runtime once. Resolves to false when the files are not there. */
  function load(assetBase) {
    if (pyodide) return Promise.resolve(true);
    if (unavailable) return Promise.resolve(false);
    if (loading) return loading;
    loading = (function () {
      try {
        self.importScripts(assetBase + "pyodide.js");
      } catch {
        unavailable = true;
        return Promise.resolve(false);
      }
      if (typeof self.loadPyodide !== "function") {
        unavailable = true;
        return Promise.resolve(false);
      }
      return self
        .loadPyodide({
          indexURL: assetBase,
          stdout: function (text) {
            keep(logs, text);
          },
          stderr: function (text) {
            keep(errors, text);
          },
        })
        .then(function (instance) {
          pyodide = instance;
          return true;
        })
        .catch(function () {
          unavailable = true;
          return false;
        });
    })();
    return loading;
  }

  function serve(port, postFn, request) {
    function post(message) {
      applyFn(postFn, port, [message]);
    }
    logs.length = 0;
    errors.length = 0;
    total = 0;

    load(request.assetBase).then(function (ok) {
      if (!ok) {
        post({ type: "unavailable" });
        return;
      }
      var namespace = null;
      // A fresh namespace for every run: nothing a program defined is visible to the next one
      return Promise.resolve()
        .then(function () {
          namespace = pyodide.globals.get("dict")();
          return pyodide.loadPackagesFromImports(request.code).catch(function () {
            // a package that is not shipped with the site: the import error will say so
          });
        })
        .then(function () {
          return pyodide.runPythonAsync(request.code, { globals: namespace });
        })
        .then(function (result) {
          var output = result === undefined || result === null ? "" : StringOf(result);
          post({ type: "done", output: output.length > MAX_LINE_CHARS * 5 ? stringSlice(output, 0, MAX_LINE_CHARS * 5) + "…" : output, logs: logs, errors: errors });
        })
        .catch(function (error) {
          keep(errors, describe(error));
          post({ type: "failed", logs: logs, errors: errors });
        })
        .then(function () {
          try {
            if (namespace) namespace.destroy();
          } catch {
            // the interpreter is already gone with the worker
          }
        });
    });
  }

  // The page hands over a private port once; after that the worker's own messaging is closed to the program.
  self.onmessage = function (event) {
    var init = event.data;
    var port = event.ports && event.ports[0];
    if (!init || init.type !== "init" || !port) return;

    var postFn = port.postMessage; // the port's own method, taken before the program can touch the prototype
    self.onmessage = null;
    self.postMessage = function () {
      throw new Error("postMessage is not available to the program");
    };

    port.onmessage = function (message) {
      serve(port, postFn, message.data);
    };
  };
}

(function runner() {
  if (typeof window === "undefined" || typeof Worker === "undefined") return;

  var DEFAULT_TIME_LIMIT_MS = 30000;
  var MAX_TIME_LIMIT_MS = 180000;
  var MAX_CODE_CHARS = 200000;
  var workerUrl = URL.createObjectURL(new Blob(["(" + pythonWorkerMain.toString() + ")();"], { type: "text/javascript" }));
  var assetBase = new URL("/sandbox/pyodide/", location.href).href;

  /** The warm worker: the interpreter stays loaded between runs and is dropped after a timeout or a crash. */
  var current = null;

  function dropWorker() {
    if (!current) return;
    current.worker.terminate();
    current.port.close();
    current = null;
  }

  function validRequest(request) {
    if (!request || request.type !== "run") return false;
    if (typeof request.id !== "string" || request.id.length > 64) return false;
    if (typeof request.nonce !== "string" || request.nonce.length < 16 || request.nonce.length > 64) return false;
    return typeof request.code === "string" && request.code.length <= MAX_CODE_CHARS;
  }

  function handle(request) {
    if (!current) {
      var worker = new Worker(workerUrl);
      var channel = new MessageChannel();
      worker.postMessage({ type: "init" }, [channel.port2]);
      current = { worker: worker, port: channel.port1 };
    }
    var active = current;
    var startedAt = Date.now();
    var finished = false;
    var limit =
      typeof request.timeLimitMs === "number" && request.timeLimitMs > 0
        ? Math.min(request.timeLimitMs, MAX_TIME_LIMIT_MS)
        : DEFAULT_TIME_LIMIT_MS;

    function finish(extra, dropAfter) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      active.port.onmessage = null;
      if (dropAfter) dropWorker();
      window.parent.postMessage(
        Object.assign(
          { type: "result", id: request.id, nonce: request.nonce, ok: false, output: "", logs: [], errors: [], timedOut: false, totalMs: Date.now() - startedAt },
          extra,
        ),
        "*",
      );
    }

    var timer = setTimeout(function () {
      // a runaway program (or a runtime that never loaded): the worker is killed, the next run starts a new one
      finish({ timedOut: true, errors: ["Time limit exceeded (" + limit + " ms)"] }, true);
    }, limit);

    active.worker.onerror = function (event) {
      finish({ errors: [(event && event.message) || "Runtime error"] }, true);
    };
    active.port.onmessage = function (event) {
      var message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "done") finish({ ok: true, output: message.output || "", logs: message.logs || [], errors: message.errors || [] }, false);
      else if (message.type === "failed") finish({ ok: false, logs: message.logs || [], errors: message.errors || [] }, false);
      else if (message.type === "unavailable") finish({ unavailable: true }, true);
    };

    active.port.postMessage({ code: request.code, assetBase: assetBase });
  }

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    if (!validRequest(event.data)) return;
    handle(event.data);
  });

  window.parent.postMessage({ type: "ready" }, "*");
})();

if (typeof module !== "undefined" && module.exports) {
  // unit tests load this file in Node and run the worker body in a vm context
  module.exports = { pythonWorkerMain: pythonWorkerMain };
}
