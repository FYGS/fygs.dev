import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { enforceRateLimit } from "@/lib/rate-limit";
import { normalizeAuthPath, rateLimitEmailKey } from "@/lib/auth-policy";
import { verifyHumanProof, type HumanProofAction } from "@/lib/anti-automation";
import { isDisposableEmail } from "@/lib/anti-automation/disposable-domains";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

interface SensitivePolicy {
  /** Per client IP. */
  limit: number;
  windowSeconds: number;
  /** Also per target e-mail address, so many IPs cannot hammer one account. */
  byEmail?: { limit: number; windowSeconds: number };
  /** Refuse (rather than count in memory) when the shared counter store is down. For flows that send e-mails. */
  closedWhenCounterDown?: boolean;
  /** Needs a proof of work from the browser (lib/anti-automation). */
  humanProof?: HumanProofAction;
}

// better-auth has its own limiter, but it keys on the LEFTMOST X-Forwarded-For
// entry, which a client can change on every request. These limits use the
// address appended by the trusted proxy (see getClientIp). Keys are paths as
// normalizeAuthPath gives them (lower case, no trailing slash).
const SENSITIVE: Record<string, SensitivePolicy> = {
  "/sign-in/email": {
    limit: 10,
    windowSeconds: 300,
    byEmail: { limit: 10, windowSeconds: 900 },
    humanProof: "sign-in",
  },
  "/sign-up/email": {
    limit: 5,
    windowSeconds: 3600,
    // each attempt sends a message to that address: a victim's inbox cannot be flooded
    byEmail: { limit: 3, windowSeconds: 3600 },
    closedWhenCounterDown: true,
    humanProof: "sign-up",
  },
  "/request-password-reset": {
    limit: 5,
    windowSeconds: 3600,
    byEmail: { limit: 3, windowSeconds: 3600 },
    closedWhenCounterDown: true,
    humanProof: "password-reset",
  },
  "/reset-password": { limit: 10, windowSeconds: 3600, closedWhenCounterDown: true },
  "/send-verification-email": {
    limit: 5,
    windowSeconds: 3600,
    byEmail: { limit: 3, windowSeconds: 3600 },
    closedWhenCounterDown: true,
    humanProof: "sign-up",
  },
  "/change-password": { limit: 10, windowSeconds: 3600 },
  "/change-email": { limit: 5, windowSeconds: 3600, closedWhenCounterDown: true },
  // second factor: the plugin also locks an account after repeated failures; this is the per-address layer
  "/two-factor/verify-totp": { limit: 10, windowSeconds: 300 },
  "/two-factor/verify-backup-code": { limit: 10, windowSeconds: 300 },
  "/two-factor/verify-otp": { limit: 10, windowSeconds: 300 },
  "/two-factor/enable": { limit: 5, windowSeconds: 3600 },
  "/two-factor/disable": { limit: 5, windowSeconds: 3600 },
  "/two-factor/generate-backup-codes": { limit: 5, windowSeconds: 3600 },
};

/** The honeypot value the forms copy into this header (lib/auth-service.ts). A person never fills it. */
const HONEYPOT_HEADER = "x-fx-trap";
/** Auth bodies are a few hundred bytes: anything bigger is not a form. */
const MAX_BODY_BYTES = 16 * 1024;

async function bodyFrom(req: NextRequest): Promise<{ email?: unknown } | null> {
  try {
    return (await req.clone().json()) as { email?: unknown };
  } catch {
    return null;
  }
}

function emailOf(body: { email?: unknown } | null): string | null {
  if (typeof body?.email !== "string") return null;
  const email = body.email.trim().toLowerCase();
  return email.length > 0 && email.length <= 254 ? email : null;
}

export async function POST(req: NextRequest) {
  const path = normalizeAuthPath(new URL(req.url).pathname);
  const policy = SENSITIVE[path];

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const limited = await enforceRateLimit(req, policy ? `auth:${path}` : "auth", {
    limit: policy?.limit ?? 120,
    windowSeconds: policy?.windowSeconds ?? 60,
    failMode: policy?.closedWhenCounterDown ? "closed" : undefined,
  });
  if (limited) return limited;

  if (policy) {
    // A script that fills every field of the form fills the hidden one too: answer as if it worked, do nothing
    if (req.headers.get(HONEYPOT_HEADER)?.trim()) return NextResponse.json({ status: true }, { status: 200 });

    if (policy.humanProof) {
      const proof = await verifyHumanProof(req, policy.humanProof);
      if (!proof.ok) return NextResponse.json({ error: proof.error }, { status: proof.status });
    }

    const needsBody = policy.byEmail || path === "/sign-up/email";
    const body = needsBody ? await bodyFrom(req) : null;
    const email = emailOf(body);

    if (path === "/sign-up/email" && email && isDisposableEmail(email)) {
      return NextResponse.json({ error: "Les adresses e-mail jetables ne sont pas acceptées." }, { status: 400 });
    }

    if (policy.byEmail && email) {
      const limitedByEmail = await enforceRateLimit(req, `auth-email:${path}`, {
        subject: `email:${rateLimitEmailKey(email)}`,
        failMode: policy.closedWhenCounterDown ? "closed" : undefined,
        ...policy.byEmail,
      });
      if (limitedByEmail) return limitedByEmail;
    }
  }

  return handler.POST(req);
}
