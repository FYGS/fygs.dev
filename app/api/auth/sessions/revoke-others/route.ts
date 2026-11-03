import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { enforceRateLimit } from "@/lib/rate-limit";
import { checkWriteOrigin } from "@/lib/request-guard";

// POST /api/auth/sessions/revoke-others
// Uses better-auth client capability via server to revoke all other sessions
export async function POST(req: NextRequest) {
  // This route is under /api/auth/, which the proxy leaves to better-auth's own checks: better-auth does not see it,
  // so a write that does not come from this site is refused here
  if (!checkWriteOrigin(req.method, req.headers, new URL(req.url)).ok) {
    return NextResponse.json({ error: 'cross_origin_request' }, { status: 403 });
  }
  const limited = await enforceRateLimit(await headers(), "auth-sensitive", {
    limit: 10,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  try {
    // better-auth exposes revokeOtherSessions via auth.api as well
    await auth.api.revokeOtherSessions({ headers: await headers() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'FAILED' }, { status: 500 });
  }
}