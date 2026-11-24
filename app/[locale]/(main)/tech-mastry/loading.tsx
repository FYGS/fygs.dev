/** Shown while a lesson loads: the shape of the page (header strip, title, text), so nothing jumps when it arrives. */
export default function TechMasteryLoading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du sujet…</span>
      <div className="h-14 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
