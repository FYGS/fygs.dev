import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsHelper, type AnalyticsEventType } from '@/lib/analytics-helper';

interface IncomingBatchEvent {
  type: string;
  userId?: string;
  context?: Record<string, any>;
  ts?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.events)) {
      return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
    }
    const events: IncomingBatchEvent[] = body.events.slice(0, 100); // cap
    if (!events.length) return NextResponse.json({ ok: true, count: 0 });

    // Prepare data for AnalyticsHelper
    const payloads = events
      .filter(e => e.userId) // Only process events with userId
      .map(e => ({
        type: e.type as AnalyticsEventType,
        userId: e.userId!,
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
