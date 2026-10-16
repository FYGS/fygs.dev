import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  plugins: [],
  test: {
    globals: true,
    setupFiles: ["tests/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 10000,
    pool: "forks",
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      SKIP_ENV_VALIDATION: "true",
    },
    // jsdom for .tsx tests, node for .ts tests
    projects: [
      {
        extends: true,
        test: {
          name: "dom",
          include: ["tests/unit/**/*.test.tsx"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        test: {
          name: "node",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@/app": path.resolve(__dirname, "./app"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/providers": path.resolve(__dirname, "./providers"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@": path.resolve(__dirname, "./"),
      "~": path.resolve(__dirname, "./"),
    },
  },
});
