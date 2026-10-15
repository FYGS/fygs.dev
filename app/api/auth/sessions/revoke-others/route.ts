import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { enforceRateLimit } from "@/lib/rate-limit";

// POST /api/auth/sessions/revoke-others
// Uses better-auth client capability via server to revoke all other sessions
export async function POST() {
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