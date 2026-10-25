/**
 * A visual-support slide carries its content in one of two shapes: an HTML string (what the editor and the sample
 * supports write) or a structured object ({ sections: [{ title, description, pros, cons }] }, what the seed writes).
 * The viewers render HTML, so the structured shape is turned into HTML here instead of being printed as "[object Object]".
 */

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Theme colours only (readable in the light and the dark theme); the slide title is the h2 of the viewer, so a
// section is an h3. "Points forts" / "Limites" are said in words, not with emojis.
const list = (items: unknown, label: string) =>
  Array.isArray(items) && items.length > 0
    ? `<p class="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">${label}</p><ul class="mt-1 space-y-1 pl-4 text-sm">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

interface Section {
  title?: unknown;
  description?: unknown;
  pros?: unknown;
  cons?: unknown;
}

export function slideContentToHtml(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object") return "";

  const sections = (content as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) return "";

  const cards = (sections as Section[])
    .filter((section) => section && typeof section === "object")
    .map(
      (section) => `
        <div class="rounded-lg border bg-muted/40 p-4 text-left">
          <h3 class="mb-1 text-base font-semibold text-foreground">${escapeHtml(section.title)}</h3>
          ${section.description ? `<p class="mb-2 text-sm text-muted-foreground">${escapeHtml(section.description)}</p>` : ""}
          ${list(section.pros, "Points forts")}
          ${list(section.cons, "Limites")}
        </div>`,
    )
    .join("");

  return cards ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cards}</div>` : "";
}
