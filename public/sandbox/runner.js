/**
 * Code sandbox: evaluates a learner's JavaScript against test cases.
 *
 * This file is served as is (plain script, no bundler) and loaded by /sandbox/runner.html,
 * which the site embeds as <iframe sandbox="allow-scripts"> (opaque origin: no cookies,
 * storage or DOM of the site) under a CSP that only adds eval and forbids the network
 * (lib/csp.mjs, buildSandboxCsp). The learner's code never runs here but in a Worker built
 * from `workerMain` below, so that a runaway loop is stopped by terminating the worker.
 *
 * Protocol (postMessage, parent <-> this frame):
 *   frame  -> parent  { type: "ready" }
 *   parent -> frame   { type: "run", id, code, entry, tests: [...], timeLimitMs }
 *   frame  -> parent  { type: "result", id, compileError?, timedOut, results: [...], logs: [...], totalMs }
 *
 * A test is { id, input, expected, adapter? } (call entry(...input), compare with expected,
 * both given as JavaScript source) or { id, check } (check is the source of `(fn) => boolean`).
 *
 * With `mode: "script"` the code is simply run (no entry, no tests) and the answer carries
 * `script: { ok, value?, error? }` and the console output.
 */
"use strict";

/**
 * The body of the worker. It is serialised with `toString()`, so it must not use anything
 * from the enclosing scope.
 */
function workerMain() {
  var MAX_LOG_LINES = 100;
  var MAX_LOG_CHARS = 2000;
  var logs = [];

  function format(value) {
    if (typeof value === "string") return JSON.stringify(value);
    if (value === undefined) return "undefined";
    if (typeof value === "function") return "[Function]";
    if (typeof value === "bigint") return String(value) + "n";
    if (typeof value === "number" && !isFinite(value)) return String(value);
    try {
      var json = JSON.stringify(value);
      return json === undefined ? String(value) : json;
    } catch {
      return String(value);
    }
  }

  function cut(text) {
    return text.length > MAX_LOG_CHARS ? text.slice(0, MAX_LOG_CHARS) + "…" : text;
  }

  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    console[level] = function () {
      if (logs.length >= MAX_LOG_LINES) return;
      logs.push(
        cut(
          Array.prototype.map
            .call(arguments, function (arg) {
              return typeof arg === "string" ? arg : format(arg);
            })
            .join(" "),
        ),
      );
    };
  });

  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    var keysA = Object.keys(a).sort();
    var keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    for (var k = 0; k < keysA.length; k++) {
      if (keysA[k] !== keysB[k] || !deepEqual(a[keysA[k]], b[keysB[k]])) return false;
    }
    return true;
  }

  function TreeNode(val, left, right) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }

  /** [3,9,20,null,null,15,7] (level order, null for a missing child) -> root node */
  function buildTree(values) {
    if (!Array.isArray(values) || values.length === 0 || values[0] === null) return null;
    var root = new TreeNode(values[0]);
    var queue = [root];
    var index = 1;
    while (queue.length > 0 && index < values.length) {
      var node = queue.shift();
      if (index < values.length && values[index] !== null) {
        node.left = new TreeNode(values[index]);
        queue.push(node.left);
      }
      index++;
      if (index < values.length && values[index] !== null) {
        node.right = new TreeNode(values[index]);
        queue.push(node.right);
      }
      index++;
    }
    return root;
  }

  var ADAPTERS = {
    // the first argument is a level-order array: hand over the tree it describes
    tree: function (args) {
      return [buildTree(args[0])].concat(args.slice(1));
    },
  };

  function evaluate(source) {
    return new Function("TreeNode", "buildTree", "return (" + source + ");")(TreeNode, buildTree);
  }

  function describeError(error) {
    return error && error.message ? String(error.name || "Error") + ": " + error.message : String(error);
  }

  function post(message) {
    self.postMessage(message);
  }

  self.onmessage = function (event) {
    var request = event.data;
    var fn;

    if (request.mode === "script") {
      try {
        var value = new Function("TreeNode", "buildTree", request.code)(TreeNode, buildTree);
        post({ type: "script", ok: true, value: value === undefined ? undefined : format(value), logs: logs });
      } catch (error) {
        post({ type: "script", ok: false, error: describeError(error), logs: logs });
      }
      return;
    }

    try {
      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(request.entry)) throw new Error("Invalid function name");
      fn = new Function(
        "TreeNode",
        "buildTree",
        request.code + "\n;return typeof " + request.entry + " === 'function' ? " + request.entry + " : undefined;",
      )(TreeNode, buildTree);
      if (typeof fn !== "function") {
        post({ type: "compileError", message: "La fonction " + request.entry + " n'est pas définie" });
        return;
      }
    } catch (error) {
      post({ type: "compileError", message: describeError(error) });
      return;
    }

    request.tests.forEach(function (test) {
      var started = Date.now();
      var result = { id: test.id, passed: false, actual: "", expected: "", timeMs: 0 };
      try {
        if (typeof test.check === "string") {
          var check = evaluate(test.check);
          result.passed = !!check(fn);
          result.expected = test.expected || "";
          result.actual = result.passed ? "ok" : "ko";
        } else {
          var args = evaluate("[" + test.input + "]");
          if (test.adapter && ADAPTERS[test.adapter]) args = ADAPTERS[test.adapter](args);
          var expected = evaluate(test.expected);
          var actual = fn.apply(null, args);
          result.expected = format(expected);
          result.actual = format(actual);
          result.passed = deepEqual(actual, expected);
        }
      } catch (error) {
        result.error = describeError(error);
        result.actual = result.error;
      }
      result.timeMs = Date.now() - started;
      post({ type: "test", result: result });
    });

    post({ type: "done", logs: logs });
  };
}

(function runner() {
  if (typeof window === "undefined" || typeof Worker === "undefined") return;

  var DEFAULT_TIME_LIMIT_MS = 5000;
  var workerUrl = URL.createObjectURL(new Blob(["(" + workerMain.toString() + ")();"], { type: "text/javascript" }));

  function handle(request) {
    var worker = new Worker(workerUrl);
    var results = [];
    var logs = [];
    var startedAt = Date.now();
    var finished = false;
    var limit = typeof request.timeLimitMs === "number" && request.timeLimitMs > 0 ? request.timeLimitMs : DEFAULT_TIME_LIMIT_MS;

    function finish(extra) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      window.parent.postMessage(
        Object.assign(
          { type: "result", id: request.id, timedOut: false, results: results, logs: logs, totalMs: Date.now() - startedAt },
          extra,
        ),
        "*",
      );
    }

    var timer = setTimeout(function () {
      if (request.mode === "script") {
        finish({ timedOut: true, script: { ok: false, error: "Time limit exceeded (" + limit + " ms)" } });
        return;
      }
      // the test that never returned fails, the ones after it did not run
      var done = results.length;
      request.tests.slice(done).forEach(function (test, i) {
        results.push({
          id: test.id,
          passed: false,
          actual: "",
          expected: "",
          timeMs: 0,
          error: i === 0 ? "Time limit exceeded (" + limit + " ms)" : "Not run",
        });
      });
      finish({ timedOut: true });
    }, limit);

    worker.onmessage = function (event) {
      var message = event.data;
      if (message.type === "test") results.push(message.result);
      else if (message.type === "compileError") finish({ compileError: message.message });
      else if (message.type === "script") {
        logs = message.logs || [];
        finish({ script: { ok: message.ok, value: message.value, error: message.error } });
      }
      else if (message.type === "done") {
        logs = message.logs || [];
        finish({});
      }
    };
    worker.onerror = function (event) {
      finish({ compileError: (event && event.message) || "Runtime error" });
    };

    worker.postMessage({ mode: request.mode, code: request.code, entry: request.entry, tests: request.tests });
  }

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    var request = event.data;
    if (!request || request.type !== "run" || typeof request.code !== "string") return;
    if (request.mode !== "script" && !Array.isArray(request.tests)) return;
    handle(request);
  });

  window.parent.postMessage({ type: "ready" }, "*");
})();

if (typeof module !== "undefined" && module.exports) {
  // unit tests load this file in Node and run the worker body in a vm context
  module.exports = { workerMain: workerMain };
}
