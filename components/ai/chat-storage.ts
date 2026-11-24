/**
 * Bounded localStorage persistence of AI conversations, one per scope (a
 * playground project, a lesson...). Everything is best effort: a full or
 * unavailable storage must never break the chat.
 */

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  /** True when produced by the offline analyzer. */
  offline?: boolean;
  truncated?: boolean;
  stopped?: boolean;
}

interface Entry {
  updatedAt: number;
  messages: StoredMessage[];
}

export const CHAT_STORAGE_KEY = "fygs:ai-chats:v1";
export const MAX_CONVERSATIONS = 12;
export const MAX_STORED_MESSAGES = 40;
export const MAX_STORED_CONTENT = 12_000;
/** Whole blob budget; the oldest conversations go first. */
export const MAX_STORAGE_CHARS = 400_000;

function read(storage: Storage): Record<string, Entry> {
  try {
    const raw = storage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isMessage(m: unknown): m is StoredMessage {
  if (!m || typeof m !== "object") return false;
  const x = m as StoredMessage;
  return typeof x.id === "string" && (x.role === "user" || x.role === "assistant") && typeof x.content === "string";
}

function getStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadConversation(key: string, storage: Storage | null = getStorage()): StoredMessage[] {
  if (!storage) return [];
  const entry = read(storage)[key];
  if (!entry || !Array.isArray(entry.messages)) return [];
  return entry.messages.filter(isMessage).slice(-MAX_STORED_MESSAGES);
}

export function saveConversation(
  key: string,
  messages: StoredMessage[],
  storage: Storage | null = getStorage(),
  now = Date.now(),
): void {
  if (!storage) return;
  const all = read(storage);
  const trimmed = messages
    .filter((m) => m.content.length > 0)
    .slice(-MAX_STORED_MESSAGES)
    .map((m) => ({ ...m, content: m.content.slice(0, MAX_STORED_CONTENT) }));

  if (trimmed.length === 0) delete all[key];
  else all[key] = { updatedAt: now, messages: trimmed };

  // Newest first; keep a bounded number of conversations within the size budget
  const keys = Object.keys(all).sort((a, b) => all[b].updatedAt - all[a].updatedAt);
  const kept: Record<string, Entry> = {};
  let size = 0;
  for (const k of keys.slice(0, MAX_CONVERSATIONS)) {
    const length = JSON.stringify(all[k]).length;
    if (size + length > MAX_STORAGE_CHARS && k !== key) continue;
    size += length;
    kept[k] = all[k];
  }
  try {
    storage.setItem(CHAT_STORAGE_KEY, JSON.stringify(kept));
  } catch {
    // quota exceeded or storage disabled: keep working without persistence
  }
}

export function clearConversation(key: string, storage: Storage | null = getStorage()): void {
  saveConversation(key, [], storage);
}
