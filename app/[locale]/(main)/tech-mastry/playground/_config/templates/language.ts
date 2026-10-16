import type { PlaygroundTemplate } from "../../_types";

/** Language starters: TypeScript, JavaScript, HTML/CSS. */
export const languageTemplates: PlaygroundTemplate[] = [
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

];
