/**
 * Code sandbox: evaluates a learner's JavaScript against test cases.
 *
 * This file is served as is (plain script, no bundler) and loaded by /sandbox/runner.html,
 * which the site embeds as <iframe sandbox="allow-scripts"> (opaque origin: no cookies,
 * storage or DOM of the site) under a CSP that only adds eval and forbids the network
 * (lib/csp.mjs, buildSandboxCsp). The learner's code never runs here but in a Worker built
 * from `workerMain` below, so that a runaway loop is stopped by terminating the worker.
 *
 * Protocol between the site and this frame (postMessage):
 *   frame  -> site    { type: "ready" }
 *   site   -> frame   { type: "run", id, nonce, code, entry, tests: [...], timeLimitMs }
 *   frame  -> site    { type: "result", id, nonce, compileError?, timedOut, results: [...], logs: [...], totalMs }
 * The frame only listens to its parent window, and echoes the run's `nonce` so the site can tell a real answer
 * from a forged one (app/_lib/sandbox-channel.ts).
 *
 * A test is { id, input, expected, adapter? } (call entry(...input), compare with expected,
 * both given as JavaScript source) or { id, check } (check is the source of `(fn) => boolean`).
 * With `mode: "script"` the code is simply run (no entry, no tests) and the answer carries
 * `script: { ok, value?, error? }` and the console output.
 *
 * WHO GRADES WHOM. The grader and the learner's code share one Worker, so the grader is built to be out of the learner's
 * reach (docs/playground-isolation.md, "Challenge grading"):
 *  - the grader talks to this page through a private MessageChannel port handed over at start; it lives in a closure,
 *    and the worker's own `postMessage` and `onmessage` are neutralised before any learner code runs, so learner code
 *    has no way to send a verdict;
 *  - every built-in the grader relies on (Object.is, Object.keys, JSON.stringify, Array.prototype methods, Function,
 *    Reflect.apply...) is captured first, so redefining them later changes nothing;
 *  - the grader's functions are in strict mode, which also stops `fn.caller` / `arguments.callee.caller` from leaking
 *    the grader's frames;
 *  - expected values and `check` sources only exist inside the grader.
 * This keeps an ordinary program from claiming a pass it did not earn. It is NOT a defence against someone who
 * controls their own browser (they can edit this very file): results are never persisted or trusted by the server.
 * If challenge results ever count for something (XP, certificate), they must be graded on the server.
 */
"use strict";

/**
 * The body of the worker. It is serialised with `toString()`, so it must not use anything
 * from the enclosing scope (and its "use strict" directive must be repeated inside it).
 */
function workerMain() {
  "use strict";

  var MAX_LOG_LINES = 100;
  var MAX_LOG_CHARS = 2000;

  // ── Captured before any learner code runs ──
  var uncurry = Function.prototype.bind.bind(Function.prototype.call);
  var ObjectIs = Object.is;
  var ObjectKeys = Object.keys;
  var isArray = Array.isArray;
  var jsonStringify = JSON.stringify;
  var StringOf = String;
  var NumberIsFinite = isFinite;
  var dateNow = Date.now;
  var FunctionCtor = Function;
  var applyFn = Reflect.apply;
  var arraySlice = uncurry(Array.prototype.slice);
  var arraySort = uncurry(Array.prototype.sort);
  var arrayPush = uncurry(Array.prototype.push);
  var arrayConcat = uncurry(Array.prototype.concat);
  var arrayJoin = uncurry(Array.prototype.join);
  var arrayShift = uncurry(Array.prototype.shift);
  var arrayForEach = uncurry(Array.prototype.forEach);
  var stringSlice = uncurry(String.prototype.slice);
  var regexTest = uncurry(RegExp.prototype.test);
  var IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
  var logs = [];
  var consoleMethods = ["log", "info", "warn", "error", "debug"];

  function format(value) {
    if (typeof value === "string") return jsonStringify(value);
    if (value === undefined) return "undefined";
    if (typeof value === "function") return "[Function]";
    if (typeof value === "bigint") return StringOf(value) + "n";
    if (typeof value === "number" && !NumberIsFinite(value)) return StringOf(value);
    try {
      var json = jsonStringify(value);
      return json === undefined ? StringOf(value) : json;
    } catch {
      return safeString(value);
    }
  }

  function safeString(value) {
    try {
      return StringOf(value);
    } catch {
      return "[unprintable]";
    }
  }

  function cut(text) {
    return text.length > MAX_LOG_CHARS ? stringSlice(text, 0, MAX_LOG_CHARS) + "…" : text;
  }

  function deepEqual(a, b) {
    if (ObjectIs(a, b)) return true;
    if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
    if (isArray(a) !== isArray(b)) return false;
    if (isArray(a)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    var keysA = arraySort(ObjectKeys(a));
    var keysB = arraySort(ObjectKeys(b));
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
    if (!isArray(values) || values.length === 0 || values[0] === null) return null;
    var root = new TreeNode(values[0]);
    var queue = [root];
    var index = 1;
    while (queue.length > 0 && index < values.length) {
      var node = arrayShift(queue);
      if (index < values.length && values[index] !== null) {
        node.left = new TreeNode(values[index]);
        arrayPush(queue, node.left);
      }
      index++;
      if (index < values.length && values[index] !== null) {
        node.right = new TreeNode(values[index]);
        arrayPush(queue, node.right);
      }
      index++;
    }
    return root;
  }

  var ADAPTERS = {
    // the first argument is a level-order array: hand over the tree it describes
    tree: function (args) {
      return arrayConcat([buildTree(args[0])], arraySlice(args, 1));
    },
  };

  /** The test's own code runs in strict mode: the learner's function then cannot read it through `fn.caller`. */
  function evaluate(source) {
    return new FunctionCtor("TreeNode", "buildTree", '"use strict"; return (' + source + ");")(TreeNode, buildTree);
  }

  function describeError(error) {
    try {
      return error && error.message ? safeString(error.name || "Error") + ": " + safeString(error.message) : safeString(error);
    } catch {
      return "Error";
    }
  }

  /** Runs one request on the private port and answers on it. */
  function serve(port, postFn, request) {
    function post(message) {
      applyFn(postFn, port, [message]);
    }

    var fn;
    if (request.mode === "script") {
      try {
        var value = new FunctionCtor("TreeNode", "buildTree", request.code)(TreeNode, buildTree);
        post({ type: "script", ok: true, value: value === undefined ? undefined : format(value), logs: logs });
      } catch (error) {
        post({ type: "script", ok: false, error: describeError(error), logs: logs });
      }
      return;
    }

    try {
      if (typeof request.entry !== "string" || !regexTest(IDENTIFIER, request.entry)) throw new Error("Invalid function name");
      fn = new FunctionCtor(
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

    arrayForEach(request.tests, function (test) {
      var started = dateNow();
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
          var actual = applyFn(fn, null, args);
          result.expected = format(expected);
          result.actual = format(actual);
          result.passed = deepEqual(actual, expected);
        }
      } catch (error) {
        result.error = describeError(error);
        result.actual = result.error;
      }
      result.timeMs = dateNow() - started;
      post({ type: "test", result: result });
    });

    post({ type: "done", logs: logs });
  }

  // The page hands over a private port once; after that the worker's own messaging is closed to learner code.
  self.onmessage = function (event) {
    var init = event.data;
    var port = event.ports && event.ports[0];
    if (!init || init.type !== "init" || !port) return;

    var postFn = port.postMessage; // the port's own method, taken before the program can touch the prototype
    self.onmessage = null;
    self.postMessage = function () {
      throw new Error("postMessage is not available to the program");
    };

    arrayForEach(consoleMethods, function (level) {
      console[level] = function () {
        if (logs.length >= MAX_LOG_LINES) return;
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
          arrayPush(parts, typeof arguments[i] === "string" ? arguments[i] : format(arguments[i]));
        }
        arrayPush(logs, cut(arrayJoin(parts, " ")));
      };
    });

    port.onmessage = function (message) {
      serve(port, postFn, message.data);
    };
  };
}

(function runner() {
  if (typeof window === "undefined" || typeof Worker === "undefined") return;

  var DEFAULT_TIME_LIMIT_MS = 5000;
  var MAX_TIME_LIMIT_MS = 60000;
  var MAX_CODE_CHARS = 200000;
  var MAX_TESTS = 200;
  var MAX_TEST_FIELD_CHARS = 10000;
  var workerUrl = URL.createObjectURL(new Blob(["(" + workerMain.toString() + ")();"], { type: "text/javascript" }));

  function validTest(test) {
    if (!test || typeof test !== "object" || typeof test.id !== "string" || test.id.length > 100) return false;
    var fields = ["input", "expected", "check", "adapter"];
    for (var i = 0; i < fields.length; i++) {
      var value = test[fields[i]];
      if (value !== undefined && (typeof value !== "string" || value.length > MAX_TEST_FIELD_CHARS)) return false;
    }
    return true;
  }

  /** The request as the site sends it, checked field by field (a malformed one is ignored, never half-run). */
  function validRequest(request) {
    if (!request || request.type !== "run") return false;
    if (typeof request.id !== "string" || request.id.length > 64) return false;
    if (typeof request.nonce !== "string" || request.nonce.length < 16 || request.nonce.length > 64) return false;
    if (typeof request.code !== "string" || request.code.length > MAX_CODE_CHARS) return false;
    if (request.mode === "script") return true;
    if (request.mode !== undefined) return false;
    if (typeof request.entry !== "string" || request.entry.length > 100) return false;
    if (!Array.isArray(request.tests) || request.tests.length > MAX_TESTS) return false;
    return request.tests.every(validTest);
  }

  function handle(request) {
    var worker = new Worker(workerUrl);
    var channel = new MessageChannel();
    var port = channel.port1;
    var results = [];
    var logs = [];
    var startedAt = Date.now();
    var finished = false;
    var limit =
      typeof request.timeLimitMs === "number" && request.timeLimitMs > 0
        ? Math.min(request.timeLimitMs, MAX_TIME_LIMIT_MS)
        : DEFAULT_TIME_LIMIT_MS;

    function finish(extra) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      port.close();
      window.parent.postMessage(
        Object.assign(
          { type: "result", id: request.id, nonce: request.nonce, timedOut: false, results: results, logs: logs, totalMs: Date.now() - startedAt },
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

    port.onmessage = function (event) {
      var message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "test") results.push(message.result);
      else if (message.type === "compileError") finish({ compileError: message.message });
      else if (message.type === "script") {
        logs = message.logs || [];
        finish({ script: { ok: message.ok, value: message.value, error: message.error } });
      } else if (message.type === "done") {
        logs = message.logs || [];
        finish({});
      }
    };
    worker.onerror = function (event) {
      finish({ compileError: (event && event.message) || "Runtime error" });
    };

    // The worker takes its end of the channel once; the request then travels on the channel, not on the worker's
    // own message queue (which the program could read)
    worker.postMessage({ type: "init" }, [channel.port2]);
    port.postMessage({ mode: request.mode, code: request.code, entry: request.entry, tests: request.tests });
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
  module.exports = { workerMain: workerMain };
}
