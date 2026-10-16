import type { PlaygroundTemplate } from "../../_types";

/** Fullstack SPA template. */
export const fullstackTemplates: PlaygroundTemplate[] = [
  // ─── Fullstack Template ────────────────────────────────────────────────────
  {
    id: "fullstack-spa",
    name: "Full-Stack SPA",
    description: "Single Page Application with routing and state management",
    icon: "Layers",
    category: "fullstack",
    tags: ["spa", "routing", "state"],
    mainFile: "index.html",
    files: [
      {
        name: "index.html",
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPA Playground</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <nav id="nav">
    <a href="#/" class="nav-link active">Home</a>
    <a href="#/about" class="nav-link">About</a>
    <a href="#/counter" class="nav-link">Counter</a>
  </nav>
  <main id="app"></main>
  <script src="router.js"></script>
  <script src="app.js"></script>
</body>
</html>`,
        language: "html",
        isEntryPoint: true,
      },
      {
        name: "router.js",
        path: "router.js",
        content: `// Simple hash-based SPA Router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this.navigate());
    window.addEventListener('load', () => this.navigate());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  navigate() {
    const hash = window.location.hash.slice(1) || '/';
    const handler = this.routes[hash] || this.routes['/404'];
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.classList.toggle('active', href === hash);
    });
    
    if (handler) {
      const app = document.getElementById('app');
      app.innerHTML = '';
      handler(app);
      this.currentRoute = hash;
    }
  }
}

window.router = new Router();`,
        language: "javascript",
      },
      {
        name: "app.js",
        path: "app.js",
        content: `// App with Router + State
let state = { count: 0 };

function HomePage(container) {
  container.innerHTML = \`
    <div class="page">
      <h1>🏠 Home</h1>
      <p>Welcome to the SPA Playground!</p>
      <p>Navigate using the links above.</p>
    </div>
  \`;
}

function AboutPage(container) {
  container.innerHTML = \`
    <div class="page">
      <h1>ℹ️ About</h1>
      <p>This is a minimal Single Page Application built with vanilla JavaScript.</p>
      <p>It demonstrates hash-based routing and state management.</p>
    </div>
  \`;
}

function CounterPage(container) {
  function render() {
    container.innerHTML = \`
      <div class="page">
        <h1>🔢 Counter: \${state.count}</h1>
        <div class="btn-row">
          <button id="dec">-</button>
          <button id="reset">Reset</button>
          <button id="inc">+</button>
        </div>
      </div>
    \`;
    container.querySelector('#dec').onclick = () => { state.count--; render(); };
    container.querySelector('#reset').onclick = () => { state.count = 0; render(); };
    container.querySelector('#inc').onclick = () => { state.count++; render(); };
  }
  render();
}

function NotFound(container) {
  container.innerHTML = '<div class="page"><h1>404</h1><p>Page not found.</p></div>';
}

router
  .addRoute('/', HomePage)
  .addRoute('/about', AboutPage)
  .addRoute('/counter', CounterPage)
  .addRoute('/404', NotFound);`,
        language: "javascript",
      },
      {
        name: "styles.css",
        path: "styles.css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; }
#nav { display: flex; gap: 1rem; padding: 1rem 2rem; background: #161b22; border-bottom: 1px solid #30363d; }
.nav-link { color: #8b949e; text-decoration: none; padding: 0.5rem 1rem; border-radius: 6px; transition: all 0.2s; }
.nav-link:hover { color: #c9d1d9; background: #21262d; }
.nav-link.active { color: #58a6ff; background: rgba(56, 139, 253, 0.1); }
.page { padding: 3rem 2rem; max-width: 600px; margin: 0 auto; text-align: center; }
.page h1 { font-size: 2rem; margin-bottom: 1rem; }
.page p { color: #8b949e; margin-bottom: 0.5rem; }
.btn-row { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; }
.btn-row button { padding: 0.75rem 2rem; border: none; border-radius: 8px; background: #238636; color: white; cursor: pointer; font-size: 1.1rem; font-weight: 600; }
.btn-row button:hover { background: #2ea043; }`,
        language: "css",
      },
    ],
  },
];
