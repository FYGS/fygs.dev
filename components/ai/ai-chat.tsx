"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssistantMode } from "@/lib/ai/schema";
import {
  Bot,
  BookOpen,
  Bug,
  FlaskConical,
  Gauge,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  Send,
  SearchCheck,
  Square,
  Trash2,
  WifiOff,
  Wand2,
  X,
} from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { AiMarkdown, type CodeActions } from "./ai-markdown";
import type { ChatMessage, useAiChat } from "./use-ai-chat";

export type Backend = "online" | "offline" | null;

const MODE_ICONS: Record<AssistantMode, typeof Bot> = {
  explain: BookOpen,
  debug: Bug,
  review: SearchCheck,
  optimize: Gauge,
  tests: FlaskConical,
  refactor: Wand2,
  hint: Lightbulb,
  chat: MessageCircle,
};

export interface AiChatProps {
  chat: ReturnType<typeof useAiChat>;
  variant: "playground" | "lesson";
  backend: Backend;
  /** Quick-action chips, in display order. */
  quickModes?: AssistantMode[];
  /** Mode to emphasise (e.g. debug after a failed run). */
  highlightMode?: AssistantMode;
  /** Free prompts shown in the empty state (lessons). */
  starterPrompts?: string[];
  /** Describes what the assistant currently sees (file, selection...). */
  scope?: ReactNode;
  /** Code-block actions that need a host (editor); `enabled` is set per message. */
  codeActions?: Omit<CodeActions, "enabled">;
  light?: boolean;
  onClose?: () => void;
  /** Escape in the composer: give the focus back to the host. */
  onEscape?: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
  /** DOM id prefix, for aria wiring when several chats exist on a page. */
  idPrefix?: string;
}

function OfflineBadge({ detailed = false }: { detailed?: boolean }) {
  const t = useIntlayer("ai-assistant");
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
      title={t.badge.offlineHint.value}
      data-testid="ai-offline-badge"
    >
      <WifiOff className="h-3 w-3" aria-hidden />
      {t.badge.offline.value}
      {detailed && <span className="sr-only">. {t.badge.offlineHint.value}</span>}
    </span>
  );
}

function Typing() {
  const t = useIntlayer("ai-assistant");
  return (
    <div className="space-y-2" data-testid="ai-skeleton">
      <span className="sr-only">{t.thinking.value}</span>
      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-muted" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function AiChat({
  chat,
  variant,
  backend,
  quickModes = [],
  highlightMode,
  starterPrompts = [],
  scope,
  codeActions,
  light = false,
  onClose,
  onEscape,
  inputRef,
  className,
  idPrefix = "ai",
}: AiChatProps) {
  const t = useIntlayer("ai-assistant");
  const { messages, status, error, cooldown, send, regenerate, stop, clear } = chat;
  const streaming = status === "streaming";

  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const localInput = useRef<HTMLTextAreaElement | null>(null);
  const textarea = inputRef ?? localInput;
  const listRef = useRef<HTMLDivElement | null>(null);
  const stick = useRef(true);
  const wasStreaming = useRef(false);

  // Keep the newest text in view unless the learner scrolled up to read
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, error]);

  // Screen readers: announce the start and the end of an answer, not every token
  useEffect(() => {
    if (streaming && !wasStreaming.current) setAnnouncement(t.announce.answering.value);
    if (!streaming && wasStreaming.current) setAnnouncement(t.announce.done.value);
    wasStreaming.current = streaming;
  }, [streaming, t.announce.answering.value, t.announce.done.value]);

  const submit = () => {
    const text = draft.trim();
    if (!text || streaming || cooldown > 0) return;
    setDraft("");
    stick.current = true;
    void send(text, { mode: "chat" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      onEscape?.();
    }
  };

  const runMode = (mode: AssistantMode) => {
    if (streaming || cooldown > 0) return;
    stick.current = true;
    void send(t.modes[mode].prompt.value || t.modes.explain.prompt.value, { mode });
  };

  const runPrompt = (text: string, mode: AssistantMode = "chat") => {
    if (streaming || cooldown > 0) return;
    stick.current = true;
    void send(text, { mode });
  };

  const lastAssistantIndex = messages.reduce((acc, m, i) => (m.role === "assistant" ? i : acc), -1);
  const lastMessage = messages[messages.length - 1];
  const showFollowUps =
    !streaming && !error && lastMessage?.role === "assistant" && lastMessage.content.length > 0 && !lastMessage.stopped;
  const followUps = showFollowUps ? t.modes[(lastMessage.mode as AssistantMode) ?? "chat"].followUps : [];

  const errorText = error ? (t.errors[error.code]?.value ?? t.errors.internal.value) : "";
  const disabled = streaming || cooldown > 0;
  const listId = `${idPrefix}-log`;

  const renderMessage = (m: ChatMessage, index: number) => {
    if (m.role === "user") {
      return (
        <div key={m.id} className="flex justify-end">
          <div className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground [overflow-wrap:anywhere]">
            <span className="sr-only">{t.you.value}: </span>
            {m.content}
          </div>
        </div>
      );
    }
    const isLast = index === lastAssistantIndex;
    const live = isLast && streaming;
    return (
      <div key={m.id} className="flex gap-2" data-testid="ai-message">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bot className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <span className="sr-only">{t.tutor.value}: </span>
          {m.content ? (
            <AiMarkdown
              content={m.content}
              light={light}
              actions={codeActions ? { ...codeActions, enabled: !live } : undefined}
            />
          ) : (
            live && <Typing />
          )}
          {live && m.content && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-primary align-middle" aria-hidden />
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {m.offline && <OfflineBadge />}
            {m.stopped && <span className="text-[11px] text-muted-foreground">{t.stopped.value}</span>}
            {m.truncated && (
              <span className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400">
                {t.truncated.value}
                {isLast && !streaming && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    disabled={disabled}
                    onClick={() => runPrompt(t.continuePrompt.value, (m.mode as AssistantMode) ?? "chat")}
                  >
                    {t.continue.value}
                  </Button>
                )}
              </span>
            )}
            {isLast && !streaming && m.content && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                disabled={disabled}
                onClick={() => {
                  stick.current = true;
                  void regenerate();
                }}
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                {t.regenerate.value}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label={t.title.value}
      className={cn("flex h-full min-h-0 flex-col bg-background text-foreground", className)}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Bot className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold leading-tight">
              {variant === "lesson" ? t.lesson.title.value : t.title.value}
            </h2>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{t.subtitle.value}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {backend === "offline" && <OfflineBadge detailed />}
          {backend === "online" && (
            <span className="hidden items-center gap-1 text-[10px] text-green-600 dark:text-green-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
              {t.badge.online.value}
            </span>
          )}
          {messages.length > 0 &&
            (confirmClear ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => {
                  clear();
                  setConfirmClear(false);
                }}
                onBlur={() => setConfirmClear(false)}
                autoFocus
                aria-label={`${t.clear.value}: ${t.confirm.value}`}
                title={t.clearConfirm.value}
              >
                {t.confirm.value}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={t.clear.value}
                title={t.clear.value}
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ))}
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={t.close.value}
              title={t.close.value}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {scope && (
        <div className="border-b border-border/60 bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground">{scope}</div>
      )}

      {/* Conversation */}
      <div
        ref={listRef}
        id={listId}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={streaming}
        aria-label={t.title.value}
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-1 py-6 text-center" data-testid="ai-empty">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Bot className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t.empty.title.value}</h3>
              <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                {variant === "lesson" ? t.empty.lessonDescription.value : t.empty.description.value}
              </p>
            </div>
            {backend === "offline" && <OfflineBadge detailed />}
            <div className="grid w-full max-w-sm grid-cols-2 gap-2">
              {quickModes.map((mode) => {
                const Icon = MODE_ICONS[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    disabled={disabled}
                    onClick={() => runMode(mode)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left text-xs transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                      highlightMode === mode && "border-red-500/60 bg-red-500/10",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    {t.modes[mode].label.value}
                  </button>
                );
              })}
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={disabled}
                  onClick={() => runPrompt(prompt)}
                  className="col-span-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left text-xs transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {streaming && messages[messages.length - 1]?.role === "user" && <Typing />}

        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs" data-testid="ai-error">
            <p className="text-red-600 dark:text-red-300">{errorText}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-7 gap-1 px-2 text-[11px]"
              disabled={cooldown > 0 || streaming}
              onClick={() => void regenerate()}
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              {cooldown > 0 ? `${t.errors.retryIn.value} ${cooldown}${t.errors.seconds.value}` : t.errors.retry.value}
            </Button>
          </div>
        )}

        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5" data-testid="ai-followups">
            {followUps.map((f) => (
              <button
                key={f.value}
                type="button"
                disabled={disabled}
                onClick={() => runPrompt(f.value, (lastMessage.mode as AssistantMode) ?? "chat")}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {f.value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background px-3 pb-2 pt-2">
        {messages.length > 0 && quickModes.length > 0 && (
          <div
            className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
            role="toolbar"
            aria-label={t.title.value}
          >
            {quickModes.map((mode) => {
              const Icon = MODE_ICONS[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={disabled}
                  onClick={() => runMode(mode)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                    highlightMode === mode && "border-red-500/60 bg-red-500/10",
                  )}
                >
                  <Icon className="h-3 w-3 text-primary" aria-hidden />
                  {t.modes[mode].label.value}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor={`${idPrefix}-input`} className="sr-only">
            {t.composerLabel.value}
          </label>
          {/* Auto-growing textarea: a hidden mirror of the text sizes the grid cell */}
          <div
            data-replicated-value={`${draft} `}
            className="grid max-h-36 min-w-0 flex-1 overflow-y-auto rounded-lg border border-input bg-background after:invisible after:whitespace-pre-wrap after:break-words after:px-3 after:py-2 after:text-sm after:content-[attr(data-replicated-value)] after:[grid-area:1/1/2/2] focus-within:ring-2 focus-within:ring-ring"
          >
            <textarea
              id={`${idPrefix}-input`}
              ref={textarea}
              value={draft}
              rows={1}
              maxLength={4000}
              aria-describedby={`${idPrefix}-hint`}
              placeholder={variant === "lesson" ? t.placeholder.lesson.value : t.placeholder.playground.value}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="min-h-9 resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent px-3 py-2 text-sm [grid-area:1/1/2/2] placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
          {streaming ? (
            <Button type="button" size="icon" variant="destructive" className="h-9 w-9 shrink-0" onClick={stop} aria-label={t.stop.value} title={t.stop.value}>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={submit}
              disabled={!draft.trim() || cooldown > 0}
              aria-label={t.send.value}
              title={t.send.value}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p id={`${idPrefix}-hint`} className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
          {t.composerHint.value} · {t.disclaimer.value} {t.storedNote.value}
        </p>
      </div>
    </section>
  );
}
