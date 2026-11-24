/**
 * Escaping for text that ends up inside HTML written by hand: e-mails, generated documents, anything that is not
 * rendered by React (which escapes by itself). One implementation, so that no template forgets a field.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

/** Text for an HTML body or a quoted attribute. `null` and `undefined` give an empty string. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"'`]/g, (character) => HTML_ENTITIES[character]);
}

/**
 * An address for `href`/`src`: only `https:` (and `mailto:` when `allowMailto`) survive, anything else becomes `#`.
 * The result is already escaped for an attribute.
 */
export function safeHref(value: unknown, { allowMailto = false }: { allowMailto?: boolean } = {}): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "#";
  try {
    const url = new URL(raw);
    const allowed = url.protocol === "https:" || (allowMailto && url.protocol === "mailto:");
    return allowed ? escapeHtml(url.toString()) : "#";
  } catch {
    return "#";
  }
}

/** A value for a header or a one-line field: no line breaks, so it cannot add a header or split a line. */
export function singleLine(value: unknown, maxLength = 200): string {
  return String(value ?? "")
    .replace(LINE_BREAKS, " ")
    .trim()
    .slice(0, maxLength);
}

/** Line and paragraph separators and carriage returns: they would end a header or a one-line field. */
const LINE_BREAKS = new RegExp("[\r\n\u2028\u2029]+", "g");

/**
 * Control characters, zero-width characters (U+200B to U+200F), bidirectional embeddings and overrides (U+202A to
 * U+202E, U+2066 to U+2069), word joiner and the byte-order mark: they let a name look like something else.
 */
const INVISIBLE = new RegExp("[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]", "g");

/** A display name: control, zero-width and bidi-override characters removed, whitespace collapsed, length capped. */
export function cleanDisplayName(value: unknown, maxLength = 100): string {
  return String(value ?? "")
    .replace(INVISIBLE, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
