import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { enforceRateLimit } from "@/lib/rate-limit";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

interface SensitivePolicy {
  /** Per client IP. */
  limit: number;
  windowSeconds: number;
  /** Also per target e-mail address, so many IPs cannot hammer one account. */
  byEmail?: { limit: number; windowSeconds: number };
}

// better-auth has its own limiter, but it keys on the LEFTMOST X-Forwarded-For
// entry, which a client can change on every request. These limits use the
// address appended by the trusted proxy (see getClientIp).
const SENSITIVE: Record<string, SensitivePolicy> = {
  "/sign-in/email": {
    limit: 10,
    windowSeconds: 300,
    byEmail: { limit: 10, windowSeconds: 900 },
  },
  "/sign-up/email": { limit: 5, windowSeconds: 3600 },
  "/request-password-reset": {
    limit: 5,
    windowSeconds: 3600,
    byEmail: { limit: 3, windowSeconds: 3600 },
  },
  "/reset-password": { limit: 10, windowSeconds: 3600 },
  "/send-verification-email": {
    limit: 5,
    windowSeconds: 3600,
    byEmail: { limit: 3, windowSeconds: 3600 },
  },
  "/change-password": { limit: 10, windowSeconds: 3600 },
};

async function emailFrom(req: NextRequest): Promise<string | null> {
  try {
    const body = (await req.clone().json()) as { email?: unknown };
    if (typeof body.email !== "string") return null;
    const email = body.email.trim().toLowerCase();
    return email.length > 0 && email.length <= 254 ? email : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const path = new URL(req.url).pathname.replace(/^\/api\/auth/, "");
  const policy = SENSITIVE[path];

  const limited = await enforceRateLimit(req, policy ? `auth:${path}` : "auth", {
    limit: policy?.limit ?? 120,
    windowSeconds: policy?.windowSeconds ?? 60,
  });
  if (limited) return limited;

  if (policy?.byEmail) {
    const email = await emailFrom(req);
    if (email) {
      const limitedByEmail = await enforceRateLimit(req, `auth-email:${path}`, {
        subject: `email:${email}`,
        ...policy.byEmail,
      });
      if (limitedByEmail) return limitedByEmail;
    }
  }

  return handler.POST(req);
}
