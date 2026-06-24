import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  plugins: [],
  test: {
    globals: true,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    env: {
      NODE_ENV: "test",
      SKIP_ENV_VALIDATION: "true",
    },
    // Use jsdom for .tsx files, node for .ts files
    environmentMatchGlobs: [
      ["tests/unit/**/*.tsx", "jsdom"],
      ["tests/unit/**/*.ts", "node"],
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
