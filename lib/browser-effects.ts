/**
 * Thin wrappers around browser globals that components must mutate from event
 * handlers (cookie writes, hard navigation). Keeping the mutation in a plain
 * module keeps components free of direct writes to `document`/`window`.
 */

/** Writes a raw `document.cookie` string (name=value; attributes...). */
export function writeCookie(cookie: string): void {
  document.cookie = cookie;
}

/** Full-page navigation (needed for external or cross-origin redirects). */
export function hardNavigate(url: string): void {
  window.location.href = url;
}
