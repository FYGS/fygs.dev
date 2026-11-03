import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { workerMain } = require(path.resolve(__dirname, "../../../public/sandbox/runner.js")) as {
  workerMain: () => void;
};

export type WorkerMessage = {
  type: string;
  message?: string;
  logs?: string[];
  ok?: boolean;
  value?: string;
  error?: string;
  result?: { id: string; passed: boolean; actual: string; expected: string; error?: string };
};

export interface WorkerRequest {
  mode?: "script";
  code: string;
  entry?: string;
  tests?: Array<Record<string, unknown>>;
}

/** Runs the sandbox worker body exactly as the sandbox does, in a context that only has `self` and `console`. */
export function runWorker(request: WorkerRequest): WorkerMessage[] {
  const messages: WorkerMessage[] = [];
  const port: { postMessage: (m: WorkerMessage) => void; onmessage?: (e: { data: unknown }) => void } = {
    postMessage: (m) => messages.push(JSON.parse(JSON.stringify(m))),
  };
  const self: {
    postMessage: (m: unknown) => void;
    onmessage?: (e: { data: unknown; ports?: unknown[] }) => void;
  } = { postMessage: () => {} };
  vm.runInNewContext(`(${workerMain.toString()})()`, { self, console: {} });
  // Same handshake as the sandbox page: init hands the worker its private port, requests travel on that port
  self.onmessage!({ data: { type: "init" }, ports: [port] });
  port.onmessage!({ data: request });
  return messages;
}

export const testResults = (messages: WorkerMessage[]) =>
  messages.filter((m) => m.type === "test").map((m) => m.result!);
