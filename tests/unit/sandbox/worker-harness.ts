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
  const self: { postMessage: (m: WorkerMessage) => void; onmessage?: (e: { data: unknown }) => void } = {
    postMessage: (m) => messages.push(JSON.parse(JSON.stringify(m))),
  };
  vm.runInNewContext(`(${workerMain.toString()})()`, { self, console: {} });
  self.onmessage!({ data: request });
  return messages;
}

export const testResults = (messages: WorkerMessage[]) =>
  messages.filter((m) => m.type === "test").map((m) => m.result!);
