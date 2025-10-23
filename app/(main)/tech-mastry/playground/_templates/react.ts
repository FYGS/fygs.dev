export const reactTemplate = {
  name: "React",
  files: [
    {
      name: "App.jsx",
      language: "javascript",
      content: `import React, { useState } from 'react';
import './styles.css';

// A simple counter component
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <div className="buttons">
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  );
}

// A simple todo list component
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: true },
    { id: 2, text: 'Build a React app', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    setTodos([
      ...todos,
      { id: Date.now(), text: newTodo, completed: false }
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-list">
      <h2>Todo List</h2>

      <div className="add-todo">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Main App component
function App() {
  return (
    <div className="app">
      <header>
        <h1>React Starter Template</h1>
        <p>Welcome to your React playground!</p>
      </header>

      <main>
        <Counter />
        <TodoList />
      </main>

      <footer>
        <p>&copy; 2023 React Playground</p>
      </footer>
    </div>
  );
}

export default App;`,
    },
    {
      name: "styles.css",
      language: "css",
      content: `/* React App Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #61dafb;
  color: #282c34;
  border-radius: 8px;
}

main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  main {
    grid-template-columns: 1fr 1fr;
  }
}

.counter, .todo-list {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.counter h2, .todo-list h2 {
  margin-bottom: 15px;
  color: #282c34;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background-color: #61dafb;
  color: #282c34;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #21a8f3;
}

.add-todo {
  display: flex;
  margin-bottom: 15px;
}

input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.add-todo button {
  border-radius: 0 4px 4px 0;
}

ul {
  list-style-type: none;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

li.completed span {
  text-decoration: line-through;
  color: #888;
}

li span {
  cursor: pointer;
}

footer {
  margin-top: 30px;
  text-align: center;
  color: #888;
  font-size: 14px;
}`,
    },
    {
      name: "index.js",
      language: "javascript",
      content: `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`,
    },
    {
      name: "index.html",
      language: "html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.js"></script>
</body>
</html>`,
    },
    {
      name: "package.json",
      language: "json",
      content: `{
  "name": "react-playground",
  "version": "1.0.0",
  "description": "React playground example",
  "main": "index.js",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build"
  }
}`,
    },
  ],
};
