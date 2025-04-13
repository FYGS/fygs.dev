// This script preloads Monaco Editor workers
(function () {
  // SSR protection
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  try {
    // Define the worker paths
    const WORKER_BASE = "/_next/static/monaco";
    const workers = {
      "editor.worker.js": `${WORKER_BASE}/editor.worker.js`,
      "ts.worker.js": `${WORKER_BASE}/ts.worker.js`,
      "html.worker.js": `${WORKER_BASE}/html.worker.js`,
      "css.worker.js": `${WORKER_BASE}/css.worker.js`,
      "json.worker.js": `${WORKER_BASE}/json.worker.js`,
    };

    // Configure Monaco environment
    window.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        if (label === "typescript" || label === "javascript") {
          return workers["ts.worker.js"];
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return workers["html.worker.js"];
        }
        if (label === "css" || label === "scss" || label === "less") {
          return workers["css.worker.js"];
        }
        if (label === "json") {
          return workers["json.worker.js"];
        }
        return workers["editor.worker.js"];
      },
    };

    // Preload workers
    function preloadWorker(url) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = "script";
      document.head.appendChild(link);
    }

    // Preload all workers
    Object.values(workers).forEach(preloadWorker);
  } catch (error) {
    console.error("Error setting up Monaco workers:", error);
  }
})();
