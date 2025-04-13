// Define template categories
export type TemplateCategory = 
  | "language" 
  | "frontend" 
  | "backend" 
  | "fullstack";

// Define template interface
export interface Template {
  id: string;
  name: string;
  description: string;
  language: string;
  category: TemplateCategory;
  files: TemplateFile[];
  mainFile: string;
  dependencies?: Record<string, string>;
}

// Define template file interface
export interface TemplateFile {
  name: string;
  content: string;
  language: string;
}

// JavaScript template
const javascriptTemplate: Template = {
  id: "javascript",
  name: "JavaScript",
  description: "Plain JavaScript starter template",
  language: "javascript",
  category: "language",
  mainFile: "index.js",
  files: [
    {
      name: "index.js",
      content: `// JavaScript Starter Template
console.log("Hello, World!");

// Example function
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Call the function
const message = greet("Developer");
console.log(message);
`,
      language: "javascript",
    },
  ],
};

// TypeScript template
const typescriptTemplate: Template = {
  id: "typescript",
  name: "TypeScript",
  description: "TypeScript starter template with type definitions",
  language: "typescript",
  category: "language",
  mainFile: "index.ts",
  files: [
    {
      name: "index.ts",
      content: `// TypeScript Starter Template
console.log("Hello, World!");

// Example function with types
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Define an interface
interface User {
  id: number;
  name: string;
  email?: string;
}

// Create a user object
const user: User = {
  id: 1,
  name: "Developer"
};

// Call the function
const message: string = greet(user.name);
console.log(message);
`,
      language: "typescript",
    },
  ],
};

// HTML template
const htmlTemplate: Template = {
  id: "html",
  name: "HTML",
  description: "Basic HTML starter template",
  language: "html",
  category: "language",
  mainFile: "index.html",
  files: [
    {
      name: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Starter</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #333;
    }
  </style>
</head>
<body>
  <h1>HTML Starter Template</h1>
  <p>This is a basic HTML starter template.</p>
  
  <div id="app">
    <p>Start building your HTML content here.</p>
  </div>

  <script>
    // You can add JavaScript here
    console.log("HTML template loaded!");
  </script>
</body>
</html>`,
      language: "html",
    },
  ],
};

// CSS template
const cssTemplate: Template = {
  id: "css",
  name: "CSS",
  description: "CSS styling starter template",
  language: "css",
  category: "language",
  mainFile: "styles.css",
  files: [
    {
      name: "styles.css",
      content: `/* CSS Starter Template */

/* Reset some basic elements */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f4f4;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background-color: #35424a;
  color: white;
  padding: 20px;
  border-bottom: 3px solid #e8491d;
}

header h1 {
  margin: 0;
}

.btn {
  display: inline-block;
  background: #e8491d;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #ff6347;
}

/* Responsive design */
@media(max-width: 768px) {
  header {
    padding: 15px;
  }
  
  .container {
    padding: 0 10px;
  }
}`,
      language: "css",
    },
  ],
};

// Tailwind CSS template
const tailwindTemplate: Template = {
  id: "tailwind",
  name: "Tailwind CSS",
  description: "Tailwind CSS utility-first framework starter",
  language: "html",
  category: "frontend",
  mainFile: "index.html",
  files: [
    {
      name: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CSS Starter</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans leading-normal tracking-normal">
  <div class="container w-full md:max-w-3xl mx-auto pt-20">
    <div class="w-full px-4 md:px-6 text-xl text-gray-800 leading-normal">
      <div class="font-sans">
        <h1 class="font-bold font-sans break-normal text-gray-900 pt-6 pb-2 text-3xl md:text-4xl">Tailwind CSS Starter Template</h1>
        <p class="text-sm md:text-base font-normal text-gray-600">Published: May 15, 2023</p>
      </div>
      
      <div class="py-6">
        <p class="mb-4">This is a starter template using Tailwind CSS utility classes.</p>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Features</h2>
          <ul class="list-disc pl-6 mb-4">
            <li class="mb-2">Utility-first CSS framework</li>
            <li class="mb-2">Responsive design out of the box</li>
            <li class="mb-2">No custom CSS needed</li>
          </ul>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
      language: "html",
    },
  ],
};

// React template
const reactTemplate: Template = {
  id: "react",
  name: "React",
  description: "React.js starter template",
  language: "jsx",
  category: "frontend",
  mainFile: "App.jsx",
  files: [
    {
      name: "App.jsx",
      content: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Starter Template</h1>
        <p>
          Edit <code>App.jsx</code> and save to reload.
        </p>
        
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Click the button to increment the counter
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;`,
      language: "jsx",
    },
    {
      name: "index.jsx",
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
      language: "jsx",
    },
  ],
};

// Vue template
const vueTemplate: Template = {
  id: "vue",
  name: "Vue",
  description: "Vue.js starter template",
  language: "vue",
  category: "frontend",
  mainFile: "App.vue",
  files: [
    {
      name: "App.vue",
      content: `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="app">
    <header>
      <h1>Vue Starter Template</h1>
      <p>
        Edit <code>App.vue</code> and save to reload.
      </p>
      
      <div class="card">
        <button @click="count++">count is {{ count }}</button>
        <p>
          Click the button to increment the counter
        </p>
      </div>
    </header>
  </div>
</template>

<style scoped>
.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  line-height: 1.5;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 1rem;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}
</style>`,
      language: "vue",
    },
    {
      name: "main.js",
      content: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
      language: "javascript",
    },
  ],
};

// Svelte template
const svelteTemplate: Template = {
  id: "svelte",
  name: "Svelte",
  description: "Svelte starter template",
  language: "svelte",
  category: "frontend",
  mainFile: "App.svelte",
  files: [
    {
      name: "App.svelte",
      content: `<script>
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<main>
  <h1>Svelte Starter Template</h1>
  <p>
    Edit <code>App.svelte</code> and save to reload.
  </p>
  
  <div class="card">
    <button on:click={increment}>
      count is {count}
    </button>
    <p>
      Click the button to increment the counter
    </p>
  </div>
</main>

<style>
  main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2.5em;
    margin-bottom: 1rem;
  }

  .card {
    padding: 2em;
  }

  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    color: white;
    cursor: pointer;
    transition: border-color 0.25s;
  }

  button:hover {
    border-color: #646cff;
  }
</style>`,
      language: "svelte",
    },
    {
      name: "main.js",
      content: `import App from './App.svelte';

const app = new App({
  target: document.body
});

export default app;`,
      language: "javascript",
    },
  ],
};

// Next.js template
const nextjsTemplate: Template = {
  id: "nextjs",
  name: "Next.js",
  description: "Next.js React framework starter template",
  language: "tsx",
  category: "fullstack",
  mainFile: "page.tsx",
  files: [
    {
      name: "page.tsx",
      content: `"use client";

import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Next.js Starter Template
        </h1>
        
        <p className="text-center mb-8">
          Edit <code className="font-mono font-bold">page.tsx</code> and save to reload.
        </p>
        
        <div className="bg-white/5 p-8 rounded-lg border border-gray-300 dark:border-neutral-700 text-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="mt-4">
            Click the button to increment the counter
          </p>
        </div>
      </div>
    </main>
  );
}`,
      language: "tsx",
    },
    {
      name: "layout.tsx",
      content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      language: "tsx",
    },
  ],
};

// Node.js template
const nodejsTemplate: Template = {
  id: "nodejs",
  name: "Node.js",
  description: "Node.js server starter template",
  language: "javascript",
  category: "backend",
  mainFile: "server.js",
  files: [
    {
      name: "server.js",
      content: `// Node.js Server Starter Template
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  // Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  // Send the response body
  res.end('Hello World! Welcome to Node.js\\n');
});

// Start the server
server.listen(port, hostname, () => {
  console.log(\`Server running at http://\${hostname}:\${port}/\`);
});

// Example of handling different routes
function handleRequest(req, res) {
  const url = req.url;
  
  if (url === '/') {
    res.end('Home Page');
  } else if (url === '/about') {
    res.end('About Page');
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
}`,
      language: "javascript",
    },
    {
      name: "package.json",
      content: `{
  "name": "nodejs-starter",
  "version": "1.0.0",
  "description": "Node.js starter template",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": [
    "nodejs",
    "starter"
  ],
  "author": "",
  "license": "MIT"
}`,
      language: "json",
    },
  ],
};

// Express.js template
const expressTemplate: Template = {
  id: "express",
  name: "Express",
  description: "Express.js web framework starter template",
  language: "javascript",
  category: "backend",
  mainFile: "app.js",
  files: [
    {
      name: "app.js",
      content: `// Express.js Starter Template
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.send('Hello World! Welcome to Express.js');
});

// Example API route
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Bob Johnson' }
  ];
  
  res.json(users);
});

// POST example
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  // In a real app, you would save to a database
  console.log('Created new user:', newUser);
  res.status(201).json({ message: 'User created', user: newUser });
});

// Start the server
app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}/\`);
});`,
      language: "javascript",
    },
    {
      name: "package.json",
      content: `{
  "name": "express-starter",
  "version": "1.0.0",
  "description": "Express.js starter template",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "keywords": [
    "express",
    "nodejs",
    "starter"
  ],
  "author": "",
  "license": "MIT"
}`,
      language: "json",
    },
  ],
};

// NestJS template
const nestjsTemplate: Template = {
  id: "nestjs",
  name: "NestJS",
  description: "NestJS progressive Node.js framework starter template",
  language: "typescript",
  category: "backend",
  mainFile: "main.ts",
  files: [
    {
      name: "main.ts",
      content: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log(\`Application is running on: http://localhost:3000\`);
}
bootstrap();`,
      language: "typescript",
    },
    {
      name: "app.module.ts",
      content: `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}`,
      language: "typescript",
    },
    {
      name: "app.controller.ts",
      content: `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}`,
      language: "typescript",
    },
    {
      name: "app.service.ts",
      content: `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Welcome to NestJS';
  }
}`,
      language: "typescript",
    },
  ],
};

// Export all templates
export const templates: Template[] = [
  javascriptTemplate,
  typescriptTemplate,
  htmlTemplate,
  cssTemplate,
  tailwindTemplate,
  reactTemplate,
  vueTemplate,
  svelteTemplate,
  nextjsTemplate,
  nodejsTemplate,
  expressTemplate,
  nestjsTemplate,
];

// Group templates by category
export const templatesByCategory: Record<TemplateCategory, Template[]> = {
  language: templates.filter(t => t.category === "language"),
  frontend: templates.filter(t => t.category === "frontend"),
  backend: templates.filter(t => t.category === "backend"),
  fullstack: templates.filter(t => t.category === "fullstack"),
};
