"use client";

import { useEffect, useState } from "react";
import { ASSISTANT_ENDPOINT } from "./stream-client";
import type { Backend } from "./ai-chat";
import type { ChatMessage } from "./use-ai-chat";

let cached: Promise<Backend> | null = null;

function fetchBackend(): Promise<Backend> {
  cached ??= fetch(ASSISTANT_ENDPOINT, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((json): Backend => (json?.mode === "offline" ? "offline" : json?.mode === "online" ? "online" : null))
    .catch((): Backend => {
      cached = null; // try again next time the panel opens
      return null;
    });
  return cached;
}

/** For tests: forget the cached answer. */
export function __resetBackendCache() {
  cached = null;
}

/**
 * Which backend answers: asked once from the server when the chat opens, then
 * corrected by what the latest answer actually reported.
 */
export function useBackendMode(messages: ChatMessage[], active: boolean): Backend {
  const [fetched, setFetched] = useState<Backend>(null);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    void fetchBackend().then((mode) => alive && setFetched(mode));
    return () => {
      alive = false;
    };
  }, [active]);

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && messages[i].content) {
      return messages[i].offline ? "offline" : "online";
    }
  }
  return fetched;
}
