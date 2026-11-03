import { getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/structured-logger";
import { isHumanProofAction, type ProofFailure, verifyProof } from "./pow";
import { HUMAN_PROOF_HEADER, type HumanProofAction, type HumanProofResult } from "./types";

export type { HumanProofAction, HumanProofResult } from "./types";
export { HUMAN_PROOF_HEADER } from "./types";

/**
 * Server entry point of the anti-automation layer: `await verifyHumanProof(request, "sign-up")` before doing the work
 * of a sensitive endpoint, and answer with `status` and `error` when `ok` is false.
 *
 * HUMAN_PROOF_MODE:
 *  - `enforce`: a missing or invalid proof is refused (the default in production);
 *  - `report`: the proof is checked and failures are logged, nothing is refused (use it to roll out);
 *  - `off`: not checked, no work is asked from browsers (the default outside production: development, tests).
 * The end-to-end harness and any non-browser integration must run with `off`; never leave it `off` in production.
 */
export type HumanProofMode = "enforce" | "report" | "off";

export function humanProofMode(env: NodeJS.ProcessEnv = process.env): HumanProofMode {
  const configured = env.HUMAN_PROOF_MODE?.trim().toLowerCase();
  if (configured === "enforce" || configured === "report" || configured === "off") return configured;
  return env.NODE_ENV === "production" ? "enforce" : "off";
}

let warnedOffInProduction = false;

/** Returns `off` outside production silently, and warns once when it was switched off in production. */
export function activeHumanProofMode(): HumanProofMode {
  const mode = humanProofMode();
  if (mode === "off" && process.env.NODE_ENV === "production" && !warnedOffInProduction) {
    warnedOffInProduction = true;
    logger.warn("human_proof.disabled_in_production", {
      eventType: "human_proof.disabled_in_production",
      metadata: { hint: "Set HUMAN_PROOF_MODE=enforce (or unset it) unless this is the end-to-end harness" },
    });
  }
  return mode;
}

const REFUSAL: Record<ProofFailure, { status: 400 | 403 | 429; error: string }> = {
  malformed: { status: 400, error: "human_proof_malformed" },
  bad_signature: { status: 403, error: "human_proof_invalid" },
  wrong_action: { status: 403, error: "human_proof_invalid" },
  wrong_network: { status: 403, error: "human_proof_invalid" },
  expired: { status: 403, error: "human_proof_expired" },
  too_fast: { status: 429, error: "human_proof_too_fast" },
  weak: { status: 403, error: "human_proof_invalid" },
  insufficient_work: { status: 403, error: "human_proof_invalid" },
  replayed: { status: 403, error: "human_proof_replayed" },
};

export async function verifyHumanProof(request: Request, action: HumanProofAction): Promise<HumanProofResult> {
  const mode = activeHumanProofMode();
  if (mode === "off") return { ok: true };
  if (!isHumanProofAction(action)) return { ok: false, status: 400, error: "human_proof_malformed" };

  const proof = request.headers.get(HUMAN_PROOF_HEADER);
  let failure: { status: 400 | 403 | 429; error: string; reason: string } | null = null;

  if (!proof) {
    failure = { status: 403, error: "human_proof_missing", reason: "missing" };
  } else {
    const verdict = await verifyProof(proof, action, getClientIp(request.headers));
    if (!verdict.ok) failure = { ...REFUSAL[verdict.reason], reason: verdict.reason };
  }

  if (!failure) return { ok: true };

  // The reason and the action only: no address, no header, nothing a client sent
  logger.warn("human_proof.rejected", {
    eventType: "human_proof.rejected",
    metadata: { action, reason: failure.reason, mode },
  });
  if (mode === "report") return { ok: true };
  return { ok: false, status: failure.status, error: failure.error };
}

/** Standard JSON answer for a refused proof. */
export function humanProofRefusal(result: Extract<HumanProofResult, { ok: false }>): Response {
  return Response.json(
    { error: result.error },
    { status: result.status, headers: { "Cache-Control": "no-store", ...(result.status === 429 ? { "Retry-After": "2" } : {}) } },
  );
}
