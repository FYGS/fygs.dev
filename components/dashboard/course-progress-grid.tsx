"use client";
import { useEffect, useState, useCallback } from 'react';
import { enqueueAnalytics } from '@/lib/analytics-batch';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export interface Summary {
  courseId: string;
  title?: string;
  slug?: string;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  hasCertificate: boolean;
}

interface Props {
  initialData?: { summaries: Summary[] } | null;
  refreshIntervalMs?: number; // base fallback
  initialEtag?: string;
}

export function CourseProgressGrid({ initialData, refreshIntervalMs = 60000, initialEtag }: Props) {
  // All state hooks must be declared first, before any early returns
  const [res, setRes] = useState<any>(initialData ? { ...initialData, fromHydration: true } : null);
  const [err, setErr] = useState<any>(null);
  const [loading, setLoading] = useState(!initialData);
  const [etag, setEtag] = useState<string | undefined>(initialEtag);
  const [intervalMs, setIntervalMs] = useState(refreshIntervalMs);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [highlighted, setHighlighted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = sessionStorage.getItem('certificate_highlights');
      if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
  });

  const persistHighlights = (setVal: Set<string>) => {
    try { sessionStorage.setItem('certificate_highlights', JSON.stringify([...setVal])); } catch {}
  };

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/progress/summary', {
        headers: etag ? { 'If-None-Match': etag } : undefined,
        cache: 'no-store'
      });
      if (r.status === 304) return; // no change
      const newEtag = r.headers.get('etag') || undefined;
      const json = await r.json();
      // Detect newly earned certificates: previously !hasCertificate and now hasCertificate
      const prevById: Record<string, Summary> = {};
      (res?.summaries || []).forEach((s: Summary) => { prevById[s.courseId] = s; });
      const newHighlights: string[] = [];
      (json.summaries || []).forEach((s: Summary) => {
        const prev = prevById[s.courseId];
        if (prev && !prev.hasCertificate && s.hasCertificate) newHighlights.push(s.courseId);
      });
      if (newHighlights.length) {
        setHighlighted(prevSet => {
          const copy = new Set(prevSet);
          newHighlights.forEach(id => copy.add(id));
          persistHighlights(copy);
          return copy;
        });
        // Emit single batched analytics event
        enqueueAnalytics({ type: 'CERTIFICATE_HIGHLIGHT_SHOWN_BATCH', context: { courseIds: newHighlights } });
        // Remove highlight after 5s
        setTimeout(() => {
          setHighlighted(prevSet => {
            const copy = new Set(prevSet);
            newHighlights.forEach(id => copy.delete(id));
            persistHighlights(copy);
            return copy;
          });
        }, 5000);
      }
      setRes(json);
      if (newEtag) setEtag(newEtag);
      setErr(null);
      // Adaptive polling:
      const anyNearCompletion = (json.summaries || []).some((s: Summary) => s.percent >= 95 && s.percent < 100);
      const allComplete = (json.summaries || []).length > 0 && (json.summaries || []).every((s: Summary) => s.percent === 100);
      const nextInterval = anyNearCompletion ? 15000 : allComplete ? 300000 : refreshIntervalMs; // 15s near completion, 5m all complete, else base
      setIntervalMs(nextInterval);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [etag, res, refreshIntervalMs]);

  useEffect(() => {
    // State updates are scheduled in a microtask (not synchronously in the effect body)
    queueMicrotask(() => {
      if (!initialData) {
        setLoading(true);
        load();
      } else {
        // Evaluate adaptive interval immediately from hydrated data
        const anyNearCompletion = (initialData.summaries || []).some(s => s.percent >= 95 && s.percent < 100);
        const allComplete = (initialData.summaries || []).length > 0 && (initialData.summaries || []).every(s => s.percent === 100);
        setIntervalMs(anyNearCompletion ? 15000 : allComplete ? 300000 : refreshIntervalMs);
      }
    });
  }, [initialData, load, refreshIntervalMs]); // run once

  useEffect(() => {
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);
  const data: Summary[] = res?.summaries || [];
  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-32 rounded-lg bg-muted animate-pulse"/>))}</div>;
  if (err) return <div className="text-sm text-destructive">Erreur de chargement</div>;
  if (!data.length) return <div className="text-sm text-muted-foreground">Aucun cours en cours.</div>;

  const allComplete = data.length > 0 && data.every(c => c.percent === 100);

  const handleManualRefresh = async () => {
    if (manualRefreshing) return; // debounce
    setManualRefreshing(true);
    setLoading(true);
    await load();
    setTimeout(() => setManualRefreshing(false), 2000); // 2s debounce window
  };

  return (
    <div className="space-y-4">
      {allComplete && (
        <div className="flex justify-end">
          <button
            onClick={handleManualRefresh}
            disabled={manualRefreshing}
            className="text-xs px-3 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center gap-1"
          >
            {manualRefreshing ? '...' : 'Rafraîchir'}
          </button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(c => {
        const pct = c.percent;
        return (
          <div
            key={c.courseId}
            className={cn(
              "rounded-lg border p-4 bg-card flex flex-col gap-2 relative",
              c.hasCertificate && 'ring-2 ring-primary/50',
              highlighted.has(c.courseId) && 'animate-pulse shadow-lg ring-2 ring-emerald-400/60'
            )}
          > 
            {highlighted.has(c.courseId) && (
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                Nouveau ✔
              </span>
            )}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{c.title ?? `Cours #${c.courseId.slice(0,6)}`}</h3>
              {c.hasCertificate && <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-foreground">Certificat</span>}
            </div>
            <div className="h-2 w-full bg-muted rounded overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{width: pct + '%'}} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{c.completedLessons}/{c.totalLessons} leçons</span>
              <span>{pct}%</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              {c.slug ? <Link href={`/formations/${c.slug}`} className="text-xs underline">Ouvrir</Link> : <span />}
              {c.hasCertificate && (
                <div className="flex items-center gap-1">
                  <Link href={`/certificates/${c.courseId}`} className="text-xs underline" title="Voir le certificat">Voir</Link>
                  <Button asChild variant="outline" size="icon" className="h-7 w-7" title="Télécharger le certificat PDF">
                    <Link href={`/api/certificates/pdf?courseId=${c.courseId}`} prefetch={false}>
                      <Download className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}