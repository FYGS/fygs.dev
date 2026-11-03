"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AI_LIMITS,
  type AssistantContext,
  type AssistantErrorCode,
  type AssistantLocale,
  type AssistantMode,
  type AssistantRequestInput,
} from "@/lib/ai/schema";
import {
  clearConversation,
  loadConversation,
  saveConversation,
  type StoredMessage,
} from "./chat-storage";
import { AssistantClientError, streamAssistant } from "./stream-client";
import { solveHumanProof } from "@/lib/anti-automation/client";
import { useSession } from "@/lib/auth-client";

export type ChatMessage = StoredMessage;

export interface ChatError {
  code: AssistantErrorCode | "network";
  /** Seconds, when the server told us when to come back. */
  retryAfter?: number;
}

export type ChatStatus = "idle" | "streaming";

export interface UseAiChatOptions {
  /** Storage key of the conversation (one per project / lesson). */
  scopeKey: string;
  surface: "playground" | "lesson";
  locale: AssistantLocale;
  /** Read at send time so the model always sees the current code. */
  getContext: () => AssistantContext;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

export interface SendOptions {
  mode?: AssistantMode;
}

const HISTORY_MESSAGES = 12;
const HISTORY_CHARS = 36_000;
const FLUSH_MS = 50;

const newId = () => globalThis.crypto.randomUUID();

/** The part of the conversation worth sending: recent, within the server's caps. */
export function buildHistory(messages: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  const usable = messages.filter((m) => m.content.trim().length > 0);
  const picked: { role: "user" | "assistant"; content: string }[] = [];
  let used = 0;
  for (let i = usable.length - 1; i >= 0 && picked.length < HISTORY_MESSAGES; i--) {
    const content = usable[i].content.slice(0, AI_LIMITS.maxMessageChars);
    if (picked.length > 0 && used + content.length > HISTORY_CHARS) break;
    used += content.length;
    picked.unshift({ role: usable[i].role, content });
  }
  // A conversation must start with the user
  while (picked.length > 1 && picked[0].role !== "user") picked.shift();
  return picked;
}

/** 1 for the first hint in a row, up to 3 when the learner keeps asking. */
export function nextHintLevel(history: ChatMessage[]): 1 | 2 | 3 {
  let count = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.role !== "user") continue;
    if (m.mode !== "hint") break;
    count++;
  }
  return Math.min(3, count + 1) as 1 | 2 | 3;
}

export function useAiChat(options: UseAiChatOptions) {
  const { scopeKey, surface, locale, endpoint, fetchImpl } = options;
  const getContextRef = useRef(options.getContext);
  const scopeKeyRef = useRef(scopeKey);
  // A visitor without an account proves in the background that a browser is asking (signed-in users are not asked)
  const { data: session } = useSession();
  const isGuest = !session?.user;
  const isGuestRef = useRef(true);

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadConversation(scopeKey));
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<ChatError | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loadedKey, setLoadedKey] = useState(scopeKey);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef("");
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  // Another project / lesson: switch to its conversation (adjusting state while rendering)
  if (loadedKey !== scopeKey) {
    setLoadedKey(scopeKey);
    setMessages(loadConversation(scopeKey));
    setError(null);
    setCooldown(0);
  }

  // Keep the refs read by async callbacks current (refs are never written during render)
  useEffect(() => {
    getContextRef.current = options.getContext;
    scopeKeyRef.current = scopeKey;
    messagesRef.current = messages;
    isGuestRef.current = isGuest;
  });

  // An answer in flight belongs to the conversation it was asked in
  useEffect(() => () => abortRef.current?.abort(), [scopeKey]);

  // Persist once a turn is finished (not on every streamed token)
  useEffect(() => {
    if (status !== "idle") return;
    saveConversation(scopeKey, messages);
  }, [messages, status, scopeKey]);

  // Rate-limit countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (flushTimer.current) clearTimeout(flushTimer.current);
    },
    [],
  );

  const updateLast = useCallback(
    (patch: (m: ChatMessage) => ChatMessage) => {
      const current = messagesRef.current;
      if (current.length === 0) return;
      const next = current.slice();
      next[next.length - 1] = patch(next[next.length - 1]);
      commit(next);
    },
    [commit],
  );

  const flush = useCallback(() => {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
      flushTimer.current = null;
    }
    if (!bufferRef.current) return;
    const chunk = bufferRef.current;
    bufferRef.current = "";
    updateLast((m) => ({ ...m, content: m.content + chunk }));
  }, [updateLast]);

  /** Stream an answer to `history` (which must end with a user message). */
  const run = useCallback(
    async (history: ChatMessage[], mode: AssistantMode) => {
      const placeholder: ChatMessage = { id: newId(), role: "assistant", content: "", mode };
      commit([...history, placeholder]);
      setStatus("streaming");
      setError(null);
      bufferRef.current = "";

      const controller = new AbortController();
      abortRef.current = controller;
      const keyAtStart = scopeKeyRef.current;

      const request: AssistantRequestInput = {
        mode,
        locale,
        // The hints asked before this one decide how explicit it may be
        hintLevel: mode === "hint" ? nextHintLevel(history.slice(0, -1)) : undefined,
        messages: buildHistory(history),
        context: { ...getContextRef.current(), surface },
      };

      try {
        const proofHeaders = isGuestRef.current ? await solveHumanProof("ai-guest") : undefined;
        await streamAssistant(
          request,
          {
            onMeta: (meta) => updateLast((m) => ({ ...m, offline: meta.mode === "offline" })),
            onDelta: (text) => {
              bufferRef.current += text;
              if (!flushTimer.current) flushTimer.current = setTimeout(flush, FLUSH_MS);
            },
            onDone: (done) => {
              flush();
              if (done.truncated) updateLast((m) => ({ ...m, truncated: true }));
            },
          },
          { signal: controller.signal, endpoint, fetchImpl, headers: proofHeaders },
        );
      } catch (err) {
        flush();
        // The learner moved to another conversation: nothing here concerns it
        if (scopeKeyRef.current !== keyAtStart) return;
        const aborted = controller.signal.aborted;
        const last = messagesRef.current[messagesRef.current.length - 1];
        const empty = !last || last.content.length === 0;
        if (aborted) {
          if (empty) commit(messagesRef.current.slice(0, -1));
          else updateLast((m) => ({ ...m, stopped: true }));
        } else {
          if (empty) commit(messagesRef.current.slice(0, -1));
          const known = err instanceof AssistantClientError;
          const code = known ? err.code : "network";
          const retryAfter = known ? err.retryAfter : undefined;
          setError({ code, retryAfter });
          if (retryAfter) setCooldown(Math.min(Math.ceil(retryAfter), 3600));
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStatus("idle");
      }
    },
    [commit, endpoint, fetchImpl, flush, locale, surface, updateLast],
  );

  const send = useCallback(
    async (text: string, sendOptions: SendOptions = {}) => {
      const content = text.trim().slice(0, AI_LIMITS.maxMessageChars);
      if (!content || abortRef.current) return;
      const mode = sendOptions.mode ?? "chat";
      const user: ChatMessage = { id: newId(), role: "user", content, mode };
      await run([...messagesRef.current, user], mode);
    },
    [run],
  );

  /** Answer the last user message again (after an error, or to get another take). */
  const regenerate = useCallback(async () => {
    if (abortRef.current) return;
    const current = messagesRef.current;
    let lastUser = -1;
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i].role === "user") {
        lastUser = i;
        break;
      }
    }
    if (lastUser === -1) return;
    const history = current.slice(0, lastUser + 1);
    await run(history, (history[lastUser].mode as AssistantMode) ?? "chat");
  }, [run]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    clearConversation(scopeKey);
    commit([]);
    setError(null);
    setCooldown(0);
  }, [commit, scopeKey]);

  return { messages, status, error, cooldown, send, regenerate, stop, clear };
}
