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
    // https only: a plain http address cannot be shown in a page that forbids mixed content, and can be altered on the way
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The address of a link typed in the editor, or null when it cannot be one. Accepted: http(s) and mailto
 * addresses, paths of the site ("/formations") and anchors ("#exemple"); "exemple.com" becomes
 * "https://exemple.com". Anything else (javascript:, data:, blanks) is refused.
 */
export function normalizeLinkUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value || /\s/.test(value) || value.startsWith("//")) return null;
  if (/^(\/(?!\/)|#)/.test(value)) return value;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol === "mailto:") return url.pathname.includes("@") ? candidate : null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.includes(".") || url.hostname === "localhost" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Languages offered for code blocks: the class `language-xxx` drives the highlighting on the learner side. */
export const CODE_LANGUAGES = [
  { value: "plaintext", label: "Texte brut" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "xml", label: "HTML / XML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Terminal (bash)" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
] as const;

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
