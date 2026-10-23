/** Parsing of the small structured fields of a course: FAQ, objectives, trailer URL. */

export interface FaqEntry {
  q: string;
  a: string;
}

/**
 * FAQ as stored (`Course.faq` JSON) or as old forms sent it (a JSON string). Anything that is not
 * a question with an answer is dropped; texts are trimmed.
 */
export function normalizeFaq(raw: unknown): FaqEntry[] {
  let value = raw;
  if (typeof value === "string") {
    if (!value.trim()) return [];
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const entries: FaqEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const { q, a } = item as { q?: unknown; a?: unknown };
    if (typeof q !== "string" || typeof a !== "string") continue;
    const entry = { q: q.trim(), a: a.trim() };
    if (entry.q && entry.a) entries.push(entry);
  }
  return entries;
}

/** Objectives: trimmed, blank lines removed, duplicates removed, at most `max`. */
export function normalizeObjectives(raw: unknown, max = 12): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const text = item.trim().replace(/\s+/g, " ");
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text.slice(0, 200));
    if (out.length === max) break;
  }
  return out;
}

/** A trailer is an http(s) URL; empty means none. Returns `null` for "none", `undefined` when invalid. */
export function normalizeTrailerUrl(raw: string | null | undefined): string | null | undefined {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * True when rich-text output holds nothing a learner could read: an empty editor yields `<p></p>`.
 * Media and code blocks count as content.
 */
export function isEmptyHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  if (/<(img|pre|iframe|video|audio|hr|table)\b/i.test(html)) return false;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length === 0;
}
