import { decompressFromEncodedURIComponent } from "lz-string";

/**
 * A playground project received through a `?code=` link. The link was made by someone else, so everything in it is
 * checked before a single file reaches the editor: size, number of files, file names (no path tricks), duplicates.
 * Importing never runs anything: it only fills the editor, and the learner decides whether to run it.
 */

export const SHARED_PROJECT_LIMITS = {
  /** The compressed text in the address. */
  encodedChars: 120_000,
  /** The JSON once decompressed. */
  jsonChars: 1_000_000,
  files: 40,
  fileChars: 200_000,
  totalChars: 600_000,
  pathChars: 120,
  pathDepth: 6,
} as const;

export interface SharedFile {
  path: string;
  content: string;
  isEntryPoint: boolean;
}

export type SharedProjectResult =
  | { ok: true; files: SharedFile[] }
  | { ok: false; reason: "empty" | "too_large" | "malformed" | "bad_path" | "duplicate_path" | "too_many_files" };

/** Characters allowed in a project path: letters, digits and a few separators, with no way to leave the project. */
const SAFE_SEGMENT = /^[A-Za-z0-9_@+~][A-Za-z0-9._@+~ -]*$/;
const RESERVED_SEGMENTS = new Set([".git", "node_modules", ".", ".."]);

/** `src/app.ts` if the path is a plain relative path inside the project, else null. */
export function safeProjectPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim();
  if (!path || path.length > SHARED_PROJECT_LIMITS.pathChars) return null;
  // Absolute paths, drive letters, backslashes, control characters, percent-encoding games and protocol-like prefixes
  if (path.startsWith("/") || path.includes("\\") || path.includes("%") || path.includes(":")) return null;
  if (/[\u0000-\u001F\u007F]/.test(path)) return null;
  const segments = path.split("/");
  if (segments.length > SHARED_PROJECT_LIMITS.pathDepth) return null;
  for (const segment of segments) {
    if (!segment || RESERVED_SEGMENTS.has(segment.toLowerCase()) || !SAFE_SEGMENT.test(segment)) return null;
    if (segment.endsWith(".") || segment.endsWith(" ")) return null; // trailing dot or space: another name on Windows
  }
  return segments.join("/");
}

export function parseSharedProject(encoded: string | null | undefined): SharedProjectResult {
  if (!encoded) return { ok: false, reason: "empty" };
  if (encoded.length > SHARED_PROJECT_LIMITS.encodedChars) return { ok: false, reason: "too_large" };

  let json: string | null;
  try {
    json = decompressFromEncodedURIComponent(encoded);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!json) return { ok: false, reason: "malformed" };
  if (json.length > SHARED_PROJECT_LIMITS.jsonChars) return { ok: false, reason: "too_large" };

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!Array.isArray(data) || data.length === 0) return { ok: false, reason: "malformed" };
  if (data.length > SHARED_PROJECT_LIMITS.files) return { ok: false, reason: "too_many_files" };

  const files: SharedFile[] = [];
  const seen = new Set<string>();
  let total = 0;
  for (const entry of data) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return { ok: false, reason: "malformed" };
    // Own properties only, and only the three the format has: `__proto__` and friends cannot ride along
    const record = entry as Record<string, unknown>;
    const path = safeProjectPath(Object.hasOwn(record, "p") ? record.p : undefined);
    if (!path) return { ok: false, reason: "bad_path" };
    const content = Object.hasOwn(record, "c") ? record.c : "";
    if (typeof content !== "string") return { ok: false, reason: "malformed" };
    if (content.length > SHARED_PROJECT_LIMITS.fileChars) return { ok: false, reason: "too_large" };
    total += content.length;
    if (total > SHARED_PROJECT_LIMITS.totalChars) return { ok: false, reason: "too_large" };
    const key = path.toLowerCase();
    if (seen.has(key)) return { ok: false, reason: "duplicate_path" };
    seen.add(key);
    files.push({ path, content, isEntryPoint: Object.hasOwn(record, "e") && record.e === true });
  }

  // One entry point at most: the first flagged file keeps the flag
  let entryFound = false;
  for (const file of files) {
    if (file.isEntryPoint && entryFound) file.isEntryPoint = false;
    if (file.isEntryPoint) entryFound = true;
  }
  return { ok: true, files };
}

/** Message shown to the learner for a link that was refused. */
export const SHARED_PROJECT_ERRORS: Record<Exclude<SharedProjectResult, { ok: true }>["reason"], string> = {
  empty: "Le lien ne contient aucun code.",
  too_large: "Le projet reçu par lien est trop volumineux pour être ouvert.",
  malformed: "Le lien de partage n'est pas valide.",
  bad_path: "Le lien contient un nom de fichier non autorisé.",
  duplicate_path: "Le lien contient deux fichiers du même nom.",
  too_many_files: "Le projet reçu par lien contient trop de fichiers.",
};
