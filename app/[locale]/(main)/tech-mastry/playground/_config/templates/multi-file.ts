import type { PlaygroundTemplate } from "../../_types";

/** Multi-file React component and Node.js templates. */
export const multiFileTemplates: PlaygroundTemplate[] = [
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
