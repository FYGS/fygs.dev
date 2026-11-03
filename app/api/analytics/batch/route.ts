import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { AnalyticsHelper, type AnalyticsEventType } from '@/lib/analytics-helper';
import { MAX_BATCH_BYTES, sanitizeClientEvents } from '@/lib/analytics-client-events';
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "analytics-batch", {
    limit: 30,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    // Events are attributed to the signed-in user only; a userId sent by the
    // client is ignored so nobody can write events on behalf of someone else.
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const sessionUserId = session.user.id;

    // Size is checked before the body is read, and again on what was read (a chunked body has no length)
    const declared = Number(req.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > MAX_BATCH_BYTES) {
      return NextResponse.json({ error: 'PAYLOAD_TOO_LARGE' }, { status: 413 });
    }
    const text = await req.text();
    if (text.length > MAX_BATCH_BYTES) {
      return NextResponse.json({ error: 'PAYLOAD_TOO_LARGE' }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || !Array.isArray((body as { events?: unknown }).events)) {
      return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    // Only interface events are accepted from a browser, with a flat, bounded context (lib/analytics-client-events.ts)
    const events = sanitizeClientEvents((body as { events: unknown[] }).events);
    if (!events.length) return NextResponse.json({ ok: true, count: 0 });

    await AnalyticsHelper.emitBatch(
      events.map((event) => ({
        type: event.type as AnalyticsEventType,
        userId: sessionUserId,
        source: 'web' as const,
        properties: { ...event.context, timestamp: event.timestamp },
      })),
    );

    return NextResponse.json({ ok: true, count: events.length });
  } catch (e) {
    console.warn('[analytics-batch] fail', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
