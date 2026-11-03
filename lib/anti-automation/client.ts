import { WORKER_SOURCE } from "./solver-source";
import { HUMAN_PROOF_HEADER, type HumanProofAction } from "./types";

/**
 * Browser side of the proof-of-work (see pow.ts for the whole protocol).
 *
 *   const proof = prepareHumanProof("sign-up");        // on mount: asks for the challenge and starts solving
 *   ...
 *   const headers = await proof();                     // on submit: `{ "x-human-proof": "..." }` (or `{}` when not asked)
 *
 * or, without preparing, `const headers = await solveHumanProof("contact")`.
 * Each proof works once and for two minutes: `proof()` hands out the prepared one and prepares the next at once, so a
 * second submit (after a validation error, say) gets a fresh proof without the user noticing.
 *
 * The work runs in a Web Worker so the page stays responsive. The client also waits for the minimum age the server
 * asked for, so that nobody ever sees a "too fast" refusal. Nothing here throws: when the server asks for no proof
 * (HUMAN_PROOF_MODE=off) or cannot be reached, the headers are simply empty and the server decides.
 */

interface ChallengeResponse {
  enforced: boolean;
  token?: string;
  difficulty?: number;
  minAgeMs?: number;
  ttlMs?: number;
}

const SAFETY_MARGIN_MS = 150;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function zeroBits(digest: Uint8Array): number {
  let bits = 0;
  for (const byte of digest) {
    if (byte === 0) {
      bits += 8;
      continue;
    }
    return bits + Math.clz32(byte) - 24;
  }
  return bits;
}

/** Slower path for browsers or policies that refuse a blob Worker: SubtleCrypto on the main thread, yielding often. */
async function solveWithSubtleCrypto(token: string, difficulty: number): Promise<string> {
  const encoder = new TextEncoder();
  for (let counter = 0; ; counter++) {
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`${token}:${counter}`)));
    if (zeroBits(digest) >= difficulty) return String(counter);
    if (counter % 2000 === 1999) await delay(0);
  }
}

/** Solves in a Worker built from a Blob (no `eval`, so it works under the strict CSP); falls back to SubtleCrypto. */
async function solve(token: string, difficulty: number): Promise<string> {
  if (typeof Worker !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
    try {
      const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
      return await new Promise<string>((resolve, reject) => {
        const worker = new Worker(url);
        const cleanup = () => {
          worker.terminate();
          URL.revokeObjectURL(url);
        };
        worker.onmessage = (event: MessageEvent<{ counter: string }>) => {
          cleanup();
          resolve(event.data.counter);
        };
        worker.onerror = () => {
          cleanup();
          reject(new Error("worker failed"));
        };
        worker.postMessage({ token, difficulty });
      });
    } catch {
      // A policy or a browser that refuses blob workers: do the work here instead
    }
  }
  return solveWithSubtleCrypto(token, difficulty);
}

export async function solveHumanProof(action: HumanProofAction): Promise<Record<string, string>> {
  try {
    const response = await fetch(`/api/pow?action=${encodeURIComponent(action)}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return {};
    const challenge = (await response.json()) as ChallengeResponse;
    if (!challenge.enforced || !challenge.token || !challenge.difficulty) return {};

    const received = Date.now();
    const counter = await solve(challenge.token, challenge.difficulty);
    const waited = Date.now() - received;
    await delay(Math.max(0, (challenge.minAgeMs ?? 0) + SAFETY_MARGIN_MS - waited));
    return { [HUMAN_PROOF_HEADER]: `${challenge.token}~${counter}` };
  } catch {
    return {};
  }
}

/** Starts working now; the returned function gives the proof (once) and prepares the next one. */
export function prepareHumanProof(action: HumanProofAction): () => Promise<Record<string, string>> {
  let pending = solveHumanProof(action);
  let preparedAt = Date.now();
  // A proof is good for two minutes: after that, ask for a new one
  const MAX_AGE_MS = 100_000;
  return async () => {
    const current = Date.now() - preparedAt > MAX_AGE_MS ? solveHumanProof(action) : pending;
    pending = solveHumanProof(action);
    preparedAt = Date.now();
    return current;
  };
}
