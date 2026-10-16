import type { PlaygroundTemplate } from "../../_types";

/** Frontend starters: React, vanilla TypeScript app. */
export const frontendTemplates: PlaygroundTemplate[] = [
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

];
