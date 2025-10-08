"use client";

// Simple client-side batching queue for analytics events before sending to server route.
// Falls back to direct fire if batching disabled or window hidden flush occurs.

interface QueuedEvent {
  type: string;
  userId?: string;
  context?: Record<string, any>;
  ts: number;
}

const queue: QueuedEvent[] = [];
let timer: any = null;
const BATCH_SIZE = 25;
const FLUSH_INTERVAL = 4000; // ms
let disabled = false;

export function disableAnalyticsBatching() { disabled = true; }
export function enableAnalyticsBatching() { disabled = false; }

export function enqueueAnalytics(evt: Omit<QueuedEvent, 'ts'>) {
  if (disabled) {
    void sendImmediate([ { ...evt, ts: Date.now() } ]);
    return;
  }
  queue.push({ ...evt, ts: Date.now() });
  if (queue.length >= BATCH_SIZE) {
    flushAnalytics();
    return;
  }
  schedule();
}

function schedule() {
  if (timer) return;
  timer = setTimeout(() => {
    flushAnalytics();
  }, FLUSH_INTERVAL);
}

export async function flushAnalytics() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length) return;
  const batch = queue.splice(0, queue.length);
  try {
    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {
    // Re-queue first few events (avoid unbounded growth)
    batch.slice(0, 10).forEach(e => queue.push(e));
  }
}

async function sendImmediate(batch: QueuedEvent[]) {
  try {
    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {/* ignore */}
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => { try { flushAnalytics(); } catch {} });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushAnalytics(); });
}
