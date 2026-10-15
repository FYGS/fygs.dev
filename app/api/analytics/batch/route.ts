import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { AnalyticsHelper, type AnalyticsEventType } from '@/lib/analytics-helper';

interface IncomingBatchEvent {
  type: string;
  userId?: string;
  context?: Record<string, any>;
  ts?: number;
}

export async function POST(req: NextRequest) {
  try {
    // Events are attributed to the signed-in user only; a userId sent by the
    // client is ignored so nobody can write events on behalf of someone else.
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const sessionUserId = session.user.id;

    const body = await req.json();
    if (!body || !Array.isArray(body.events)) {
      return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
    }
    const events: IncomingBatchEvent[] = body.events.slice(0, 100); // cap
    if (!events.length) return NextResponse.json({ ok: true, count: 0 });

    // Prepare data for AnalyticsHelper
    const payloads = events
      .filter(e => typeof e.type === 'string' && e.type.length > 0 && e.type.length <= 64)
      .map(e => ({
        type: e.type as AnalyticsEventType,
        userId: sessionUserId,
        source: 'web' as const,
        properties: {
          ...e.context,
          timestamp: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString(),
        },
      }));

    // Use AnalyticsHelper batch processing
    await AnalyticsHelper.emitBatch(payloads);

    return NextResponse.json({ ok: true, count: payloads.length });
  } catch (e) {
    console.warn('[analytics-batch] fail', e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
