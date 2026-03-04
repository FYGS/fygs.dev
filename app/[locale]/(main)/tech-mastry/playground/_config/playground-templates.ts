import type { PlaygroundTemplate } from "../_types";

export const playgroundTemplates: PlaygroundTemplate[] = [
  // ─── Language Templates ──────────────────────────────────────────────────────
  {
    id: "typescript",
    name: "TypeScript",
    description: "TypeScript starter with types and interfaces",
    icon: "FileCode",
    category: "language",
    tags: ["typescript", "types"],
    mainFile: "index.ts",
    files: [
      {
        name: "index.ts",
        path: "index.ts",
        content: `// TypeScript Starter Template
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 10000),
    name,
    email,
    role: "user",
  };
}

function greet(user: User): string {
  return \`Hello, \${user.name} (\${user.role})! Contact: \${user.email}\`;
}

const user = createUser("Alice", "alice@example.com");
console.log(greet(user));

// Generics example
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log(first([1, 2, 3]));
console.log(first(["a", "b", "c"]));
`,
        language: "typescript",
        isEntryPoint: true,
      },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    description: "Modern ES2024+ JavaScript starter",
    icon: "FileCode",
    category: "language",
    tags: ["javascript", "es2024"],
    mainFile: "index.js",
    files: [
      {
        name: "index.js",
        path: "index.js",
        content: `// JavaScript ES2024+ Starter
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));

// Array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((a, b) => a + b, 0);

console.log("Doubled:", doubled);
console.log("Sum:", sum);

// Async/Await
async function fetchData() {
  // Simulated async operation
  return new Promise(resolve => {
    setTimeout(() => resolve({ status: "ok", data: [1, 2, 3] }), 100);
  });
}

fetchData().then(result => console.log("Result:", JSON.stringify(result)));

// Destructuring & Spread
const obj = { a: 1, b: 2, c: 3 };
const { a, ...rest } = obj;
console.log("Destructured:", a, rest);
`,
        language: "javascript",
        isEntryPoint: true,
      },
    ],
  },
  {
    id: "html-css",
    name: "HTML + CSS",
    description: "HTML with CSS styling and responsive design",
    icon: "Globe",
    category: "language",
    tags: ["html", "css", "responsive"],
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
  <title>FYGS Playground</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>FYGS Playground</h1>
      <p>Build beautiful web pages right here.</p>
    </header>

    <main class="grid">
      <div class="card">
        <div class="card-icon">🚀</div>
        <h3>Fast</h3>
        <p>Lightning-fast execution with instant preview.</p>
      </div>
      <div class="card">
        <div class="card-icon">🎨</div>
        <h3>Beautiful</h3>
        <p>Modern design with smooth animations.</p>
      </div>
      <div class="card">
        <div class="card-icon">⚡</div>
        <h3>Powerful</h3>
        <p>Full-stack support with multiple languages.</p>
      </div>
    </main>

    <footer class="footer">
      <p>Made with ❤️ in FYGS Playground</p>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
        language: "html",
        isEntryPoint: true,
      },
      {
        name: "styles.css",
        path: "styles.css",
        content: `/* Modern CSS Starter */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --radius: 12px;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  padding: 3rem 0;
}

.header h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.header p {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem 0;
}

.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card h3 {
  margin-bottom: 0.5rem;
  color: var(--primary-light);
}

.card p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.footer {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .header h1 { font-size: 1.75rem; }
  .grid { grid-template-columns: 1fr; }
}`,
        language: "css",
      },
      {
        name: "script.js",
        path: "script.js",
        content: `// Add interactive behaviors
document.querySelectorAll('.card').forEach((card, index) => {
  card.style.animationDelay = \`\${index * 0.1}s\`;
  card.classList.add('fade-in');
  
  card.addEventListener('click', () => {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
  });
});

console.log("Page loaded successfully!");`,
        language: "javascript",
      },
    ],
  },

  // ─── Frontend Templates ────────────────────────────────────────────────────
  {
    id: "react-starter",
    name: "React",
    description: "React with hooks, state management, and components",
    icon: "Atom",
    category: "frontend",
    tags: ["react", "hooks", "components"],
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
  <title>React App</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    ${`const { useState, useEffect, useCallback } = React;

    function Counter() {
      const [count, setCount] = useState(0);

      return (
        <div className="counter">
          <h2>Counter: {count}</h2>
          <div className="button-group">
            <button onClick={() => setCount(c => c - 1)}>-</button>
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => setCount(c => c + 1)}>+</button>
          </div>
        </div>
      );
    }

    function TodoApp() {
      const [todos, setTodos] = useState([]);
      const [input, setInput] = useState('');

      const addTodo = useCallback(() => {
        if (!input.trim()) return;
        setTodos(prev => [...prev, { id: Date.now(), text: input, done: false }]);
        setInput('');
      }, [input]);

      const toggleTodo = (id) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
      };

      const removeTodo = (id) => {
        setTodos(prev => prev.filter(t => t.id !== id));
      };

      return (
        <div className="todo-app">
          <h2>Todo App</h2>
          <div className="todo-input">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Add a todo..."
            />
            <button onClick={addTodo}>Add</button>
          </div>
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className={todo.done ? 'done' : ''}>
                <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
                <button onClick={() => removeTodo(todo.id)}>×</button>
              </li>
            ))}
          </ul>
          {todos.length > 0 && (
            <p className="todo-stats">
              {todos.filter(t => !t.done).length} remaining
            </p>
          )}
        </div>
      );
    }

    function App() {
      return (
        <div className="app">
          <h1>⚛️ React Playground</h1>
          <Counter />
          <TodoApp />
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);`}
  </script>
</body>
</html>`,
        language: "html",
        isEntryPoint: true,
      },
      {
        name: "styles.css",
        path: "styles.css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --primary: #61dafb;
  --bg: #282c34;
  --surface: #363b44;
  --text: #abb2bf;
  --text-bright: #e6e6e6;
}

body {
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.app h1 {
  text-align: center;
  color: var(--primary);
  margin-bottom: 2rem;
  font-size: 2rem;
}

.counter, .todo-app {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.counter h2, .todo-app h2 {
  color: var(--text-bright);
  margin-bottom: 1rem;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

button {
  background: var(--primary);
  color: var(--bg);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

button:hover { opacity: 0.85; }

.todo-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.todo-input input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  background: var(--bg);
  color: var(--text-bright);
  outline: none;
}

.todo-input input:focus {
  border-color: var(--primary);
}

.todo-list {
  list-style: none;
}

.todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background: var(--bg);
  cursor: pointer;
  transition: opacity 0.2s;
}

.todo-list li.done span {
  text-decoration: line-through;
  opacity: 0.5;
}

.todo-list li button {
  background: transparent;
  color: #e06c75;
  font-size: 1.2rem;
  padding: 0 0.5rem;
}

.todo-stats {
  text-align: center;
  color: var(--text);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}`,
        language: "css",
      },
    ],
  },
  {
    id: "vanilla-ts-app",
    name: "Vanilla TS App",
    description: "TypeScript with DOM manipulation and modular structure",
    icon: "Layout",
    category: "frontend",
    tags: ["typescript", "dom", "modular"],
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
  <title>Vanilla TS App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Vanilla TypeScript App</h1>
    <div id="counter"></div>
    <div id="clock"></div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        language: "html",
        isEntryPoint: true,
      },
      {
        name: "app.ts",
        path: "app.ts",
        content: `// TypeScript DOM Application
interface Component {
  mount(container: HTMLElement): void;
  destroy(): void;
}

class Counter implements Component {
  private count = 0;
  private el: HTMLElement | null = null;
  
  mount(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'counter-widget';
    this.render();
    container.appendChild(this.el);
  }
  
  private render() {
    if (!this.el) return;
    this.el.innerHTML = \`
      <h2>Counter: \${this.count}</h2>
      <button id="dec">-</button>
      <button id="inc">+</button>
    \`;
    this.el.querySelector('#dec')?.addEventListener('click', () => { this.count--; this.render(); });
    this.el.querySelector('#inc')?.addEventListener('click', () => { this.count++; this.render(); });
  }
  
  destroy() { this.el?.remove(); }
}

class Clock implements Component {
  private el: HTMLElement | null = null;
  private timer: number | null = null;
  
  mount(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'clock-widget';
    container.appendChild(this.el);
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 1000);
  }
  
  private tick() {
    if (!this.el) return;
    this.el.textContent = new Date().toLocaleTimeString();
  }
  
  destroy() {
    if (this.timer) clearInterval(this.timer);
    this.el?.remove();
  }
}

// Mount components
const counter = new Counter();
const clock = new Clock();

const counterEl = document.getElementById('counter');
const clockEl = document.getElementById('clock');

if (counterEl) counter.mount(counterEl);
if (clockEl) clock.mount(clockEl);

console.log('App initialized!');`,
        language: "typescript",
      },
      {
        name: "styles.css",
        path: "styles.css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
#app { text-align: center; }
h1 { color: #e94560; margin-bottom: 2rem; }
.counter-widget { margin: 1rem 0; }
.counter-widget h2 { margin-bottom: 0.5rem; }
.counter-widget button { padding: 0.5rem 1.5rem; margin: 0 0.25rem; border: none; border-radius: 4px; background: #e94560; color: white; cursor: pointer; font-size: 1.2rem; }
.clock-widget { font-size: 3rem; font-variant-numeric: tabular-nums; color: #0f3460; background: rgba(255,255,255,0.05); padding: 1rem 2rem; border-radius: 12px; margin-top: 1rem; }`,
        language: "css",
      },
    ],
  },

  // ─── Backend Templates ─────────────────────────────────────────────────────
  {
    id: "node-api",
    name: "Express API",
    description: "Real Express.js REST API with WebContainer",
    icon: "Server",
    category: "backend",
    tags: ["node", "express", "api", "rest"],
    mainFile: "index.js",
    files: [
      {
        name: "package.json",
        path: "package.json",
        content: JSON.stringify(
          {
            name: "express-api",
            version: "1.0.0",
            type: "commonjs",
            scripts: {
              start: "node index.js",
            },
            dependencies: {
              express: "^4.21.0",
            },
          },
          null,
          2,
        ),
        language: "json",
      },
      {
        name: "index.js",
        path: "index.js",
        content: `const express = require('express');
const app = express();
const PORT = 3111;

app.use(express.json());

// In-memory database
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];
let nextId = 3;

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Express API running in WebContainer!',
    routes: ['GET /api/users', 'GET /api/users/:id', 'POST /api/users'],
  });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const user = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json(user);
});

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});
`,
        language: "javascript",
        isEntryPoint: true,
      },
    ],
  },

  // ─── Algorithm / Data Structure Templates ──────────────────────────────────
  {
    id: "algorithms",
    name: "Algorithms",
    description: "Common algorithms with TypeScript implementations",
    icon: "BrainCircuit",
    category: "language",
    tags: ["algorithms", "dsa", "typescript"],
    mainFile: "algorithms.ts",
    files: [
      {
        name: "algorithms.ts",
        path: "algorithms.ts",
        content: `// ─── Sorting Algorithms ─────────────────────────────────────────────────────

function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

// ─── Binary Search ──────────────────────────────────────────────────────────

function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

const data = [38, 27, 43, 3, 9, 82, 10];
console.log("Original:", data);
console.log("QuickSort:", quickSort(data));
console.log("MergeSort:", mergeSort(data));

const sorted = quickSort(data);
console.log("\\nBinary Search for 43:", binarySearch(sorted, 43));
console.log("Binary Search for 99:", binarySearch(sorted, 99));
`,
        language: "typescript",
        isEntryPoint: true,
      },
    ],
  },

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
  // ─── Python Template ───────────────────────────────────────────────────────
  {
    id: "python",
    name: "Python",
    description: "Python starter with data structures and algorithms",
    icon: "FileCode",
    category: "language",
    tags: ["python", "data-science", "algorithms"],
    mainFile: "main.py",
    files: [
      {
        name: "main.py",
        path: "main.py",
        content: `# Python Playground 🐍
# Powered by Pyodide (Python in WebAssembly)

def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    if n == 1:
        return [0]
    
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq

# Print Fibonacci sequence
fib = fibonacci(10)
print(f"Fibonacci(10): {fib}")

# List comprehensions
squares = [x**2 for x in range(1, 11)]
evens = [x for x in squares if x % 2 == 0]
print(f"Squares: {squares}")
print(f"Even squares: {evens}")

# Dictionaries
student = {
    "name": "Alice",
    "age": 22,
    "grades": {"math": 95, "science": 88, "english": 92}
}

avg = sum(student["grades"].values()) / len(student["grades"])
print(f"{student['name']}'s average grade: {avg:.1f}")

# Classes
class Stack:
    def __init__(self):
        self._items = []
    
    def push(self, item):
        self._items.append(item)
    
    def pop(self):
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items.pop()
    
    def peek(self):
        return self._items[-1] if self._items else None
    
    def __len__(self):
        return len(self._items)
    
    def __repr__(self):
        return f"Stack({self._items})"

stack = Stack()
for i in [10, 20, 30]:
    stack.push(i)

print(f"\\nStack: {stack}")
print(f"Pop: {stack.pop()}")
print(f"Peek: {stack.peek()}")
print(f"Size: {len(stack)}")
`,
        language: "python",
        isEntryPoint: true,
      },
    ],
  },
  // ─── Python Data Science Template ──────────────────────────────────────────
  {
    id: "python-data",
    name: "Python Data Science",
    description: "Data analysis with built-in Python libraries",
    icon: "BarChart3",
    category: "language",
    tags: ["python", "data-science", "statistics"],
    mainFile: "analysis.py",
    files: [
      {
        name: "analysis.py",
        path: "analysis.py",
        content: `# Data Analysis with Python 📊
import json
import math
from collections import Counter, defaultdict

# Sample dataset
data = [
    {"name": "Alice", "age": 28, "salary": 75000, "dept": "Engineering"},
    {"name": "Bob", "age": 35, "salary": 85000, "dept": "Engineering"},
    {"name": "Charlie", "age": 42, "salary": 95000, "dept": "Management"},
    {"name": "Diana", "age": 31, "salary": 72000, "dept": "Design"},
    {"name": "Eve", "age": 26, "salary": 68000, "dept": "Design"},
    {"name": "Frank", "age": 38, "salary": 92000, "dept": "Engineering"},
    {"name": "Grace", "age": 29, "salary": 78000, "dept": "Management"},
]

# Basic statistics
salaries = [d["salary"] for d in data]
mean_salary = sum(salaries) / len(salaries)
sorted_sal = sorted(salaries)
median_salary = sorted_sal[len(sorted_sal) // 2]
std_dev = math.sqrt(sum((s - mean_salary) ** 2 for s in salaries) / len(salaries))

print("=== Salary Statistics ===")
print(f"Mean:   \${mean_salary:,.0f}")
print(f"Median: \${median_salary:,.0f}")
print(f"Std Dev: \${std_dev:,.0f}")
print(f"Range:  \${min(salaries):,} - \${max(salaries):,}")

# Group by department
dept_data = defaultdict(list)
for d in data:
    dept_data[d["dept"]].append(d["salary"])

print("\\n=== Average Salary by Department ===")
for dept, sals in sorted(dept_data.items()):
    avg = sum(sals) / len(sals)
    print(f"  {dept}: \${avg:,.0f} ({len(sals)} employees)")

# Age distribution
age_groups = Counter()
for d in data:
    group = f"{(d['age'] // 10) * 10}s"
    age_groups[group] += 1

print("\\n=== Age Distribution ===")
for group, count in sorted(age_groups.items()):
    bar = "█" * (count * 5)
    print(f"  {group}: {bar} ({count})")
`,
        language: "python",
        isEntryPoint: true,
      },
    ],
  },
  // ─── React Component Template ────────────────────────────────────────
  {
    id: "react-component",
    name: "React Component",
    description: "React functional component with hooks and state",
    icon: "Component",
    category: "frontend",
    tags: ["react", "jsx", "hooks", "components"],
    mainFile: "App.jsx",
    files: [
      {
        name: "App.jsx",
        path: "App.jsx",
        content: `// React Component Playground
// Uses React 18 from CDN — no import needed

function App() {
  const [count, setCount] = React.useState(0);
  const [items, setItems] = React.useState([
    { id: 1, text: "Learn React", done: true },
    { id: 2, text: "Build a playground", done: false },
    { id: 3, text: "Ship to production", done: false },
  ]);
  const [input, setInput] = React.useState("");

  const addItem = () => {
    if (!input.trim()) return;
    setItems([...items, {
      id: Date.now(),
      text: input.trim(),
      done: false,
    }]);
    setInput("");
  };

  const toggleItem = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const doneCount = items.filter(i => i.done).length;

  return React.createElement("div", { style: styles.container },
    React.createElement("h1", { style: styles.title }, "⚛️ React Playground"),
    React.createElement("p", { style: styles.subtitle },
      \`Counter: \${count} | Tasks: \${doneCount}/\${items.length} done\`
    ),

    // Counter
    React.createElement("div", { style: styles.row },
      React.createElement("button", {
        style: styles.btn, onClick: () => setCount(c => c - 1)
      }, "−"),
      React.createElement("span", { style: styles.count }, count),
      React.createElement("button", {
        style: styles.btn, onClick: () => setCount(c => c + 1)
      }, "+"),
    ),

    // Todo Input
    React.createElement("div", { style: { ...styles.row, marginTop: 24 } },
      React.createElement("input", {
        style: styles.input,
        value: input,
        onChange: e => setInput(e.target.value),
        onKeyDown: e => e.key === "Enter" && addItem(),
        placeholder: "Add a task..."
      }),
      React.createElement("button", {
        style: { ...styles.btn, background: "#22c55e" },
        onClick: addItem
      }, "Add"),
    ),

    // Todo List
    React.createElement("ul", { style: styles.list },
      items.map(item =>
        React.createElement("li", {
          key: item.id,
          style: { ...styles.item, opacity: item.done ? 0.5 : 1 },
          onClick: () => toggleItem(item.id),
        },
          React.createElement("span", {
            style: { textDecoration: item.done ? "line-through" : "none" }
          }, item.text),
          item.done ? " ✅" : ""
        )
      )
    )
  );
}

const styles = {
  container: { maxWidth: 480, margin: "40px auto", padding: 24, fontFamily: "system-ui, sans-serif", color: "#e2e8f0", background: "#1e293b", borderRadius: 16, minHeight: "100vh" },
  title: { fontSize: 28, marginBottom: 4 },
  subtitle: { color: "#94a3b8", marginBottom: 20, fontSize: 14 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  btn: { padding: "8px 16px", border: "none", borderRadius: 8, background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 600 },
  count: { fontSize: 24, fontWeight: 700, minWidth: 48, textAlign: "center" },
  input: { flex: 1, padding: "8px 12px", border: "1px solid #334155", borderRadius: 8, background: "#0f172a", color: "#e2e8f0", fontSize: 14 },
  list: { listStyle: "none", marginTop: 16, padding: 0 },
  item: { padding: "10px 16px", borderRadius: 8, marginBottom: 6, background: "#0f172a", cursor: "pointer", transition: "opacity 0.2s", fontSize: 14 },
};

// Render
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
`,
        language: "javascript",
        isEntryPoint: true,
      },
    ],
  },
  // ─── Node.js Multi-file Template ────────────────────────────────────────
  {
    id: "nodejs",
    name: "Node.js Project",
    description: "Multi-file Node.js project with modules and utilities",
    icon: "Server",
    category: "backend",
    tags: ["nodejs", "modules", "backend"],
    mainFile: "index.js",
    files: [
      {
        name: "package.json",
        path: "package.json",
        content: JSON.stringify(
          {
            name: "node-project",
            version: "1.0.0",
            type: "commonjs",
            scripts: {
              start: "node index.js",
            },
          },
          null,
          2,
        ),
        language: "json",
      },
      {
        name: "index.js",
        path: "index.js",
        content: `// Node.js Multi-file Project
const { createUser, listUsers } = require('./users');
const { formatTable } = require('./utils');

// Create some users
createUser("Alice", "alice@example.com", "admin");
createUser("Bob", "bob@example.com", "user");
createUser("Charlie", "charlie@example.com", "user");
createUser("Diana", "diana@example.com", "moderator");

// List all users
const users = listUsers();
console.log("\\n📋 All Users:");
console.log(formatTable(users, ["id", "name", "email", "role"]));

// Filter by role
const admins = users.filter(u => u.role === "admin");
console.log("\\n🔑 Admins:", admins.map(u => u.name).join(", "));
console.log("\\n✅ Total users:", users.length);
`,
        language: "javascript",
        isEntryPoint: true,
      },
      {
        name: "users.js",
        path: "users.js",
        content: `// User management module
const users = [];
let nextId = 1;

function createUser(name, email, role = "user") {
  const user = { id: nextId++, name, email, role, createdAt: new Date().toISOString() };
  users.push(user);
  return user;
}

function listUsers() {
  return [...users];
}

function findUser(id) {
  return users.find(u => u.id === id);
}

module.exports = { createUser, listUsers, findUser };
`,
        language: "javascript",
      },
      {
        name: "utils.js",
        path: "utils.js",
        content: `// Utility functions
function formatTable(data, columns) {
  if (!data.length) return "(empty)";
  
  const widths = columns.map(col => 
    Math.max(col.length, ...data.map(row => String(row[col] ?? "").length))
  );
  
  const header = columns.map((col, i) => col.padEnd(widths[i])).join(" | ");
  const separator = widths.map(w => "-".repeat(w)).join("-+-");
  const rows = data.map(row =>
    columns.map((col, i) => String(row[col] ?? "").padEnd(widths[i])).join(" | ")
  );
  
  return [header, separator, ...rows].join("\\n");
}

module.exports = { formatTable };
`,
        language: "javascript",
      },
    ],
  },
];

export function getTemplateById(id: string): PlaygroundTemplate | undefined {
  return playgroundTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): PlaygroundTemplate[] {
  return playgroundTemplates.filter((t) => t.category === category);
}
