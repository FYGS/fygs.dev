export const typescriptTemplate = {
  name: "TypeScript",
  files: [
    {
      name: "index.ts",
      language: "typescript",
      content: `// TypeScript Starter Template
console.log("Hello, World!");

// Example function with types
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Call the function
const greeting: string = greet("TypeScript");
console.log(greeting);

// Interface definition
interface User {
  id: number;
  name: string;
  email?: string; // Optional property
}

// Using the interface
const user: User = {
  id: 1,
  name: "John Doe"
};

// Safely access properties
console.log("User:", { id: user.id, name: user.name });

// Generic function
function identity<T>(arg: T): T {
  return arg;
}

const output = identity<string>("TypeScript is awesome");
console.log(output);

// Array with type
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled: number[] = numbers.map(num => num * 2);
console.log("Doubled numbers:", doubled);

// Return a value to see it in the output
"TypeScript execution complete!";`,
    },
    {
      name: "package.json",
      language: "json",
      content: `{
  "name": "typescript-playground",
  "version": "1.0.0",
  "description": "TypeScript playground example",
  "main": "index.ts",
  "dependencies": {
    "typescript": "^5.0.4"
  },
  "devDependencies": {
    "@types/node": "^18.16.0"
  },
  "scripts": {
    "start": "ts-node index.ts",
    "build": "tsc"
  }
}`,
    },
    {
      name: "tsconfig.json",
      language: "json",
      content: `{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["*.ts"],
  "exclude": ["node_modules"]
}`,
    },
  ],
};
