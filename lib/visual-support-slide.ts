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

const list = (items: unknown, icon: string) =>
  Array.isArray(items) && items.length > 0
    ? `<ul class="text-sm space-y-1 list-none p-0">${items.map((item) => `<li>${icon} ${escapeHtml(item)}</li>`).join("")}</ul>`
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
        <div class="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 text-left">
          <h4 class="font-bold text-slate-800 mb-1">${escapeHtml(section.title)}</h4>
          ${section.description ? `<p class="text-sm text-slate-600 mb-2">${escapeHtml(section.description)}</p>` : ""}
          ${list(section.pros, "✅")}
          ${list(section.cons, "⚠️")}
        </div>`,
    )
    .join("");

  return cards ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cards}</div>` : "";
}
