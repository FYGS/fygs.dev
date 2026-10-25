import type { ReactNode } from "react";

/**
 * The frame of a loading page: announced to screen readers with what is loading (a status with a heading, so the
 * page is never without a title while it streams). The skeleton blocks have no text, so nothing else is read.
 */
export function PageLoading({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <h1 className="sr-only">{label}</h1>
      {children}
    </div>
  );
}
