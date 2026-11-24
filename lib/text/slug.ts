const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * URL slug from a title. Accents are folded ("Présentation" -> "presentation"), anything that is
 * not a letter or digit becomes a dash. Titles with no Latin letter or digit fall back to `fallback`.
 */
export function slugify(text: string, fallback = "item"): string {
  const slug = text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || fallback;
}

/** `base`, then `base-2`, `base-3`... until `isTaken` says the slug is free. */
export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(base))) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
