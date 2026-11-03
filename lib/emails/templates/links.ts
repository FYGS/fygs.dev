import { escapeHtml } from "@/lib/html-escape";

/**
 * A link put in an e-mail button: https always, http only for a local development host, anything else (javascript:,
 * data:, relative, malformed) becomes `#`. The result is escaped for an HTML attribute.
 */
export function emailLink(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "#";
  try {
    const url = new URL(raw);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
    if (url.protocol === "https:" || (url.protocol === "http:" && local)) return escapeHtml(url.toString());
  } catch {
    // not a URL
  }
  return "#";
}
