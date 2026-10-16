import { z } from "zod";

/**
 * Wire contract of POST /api/ai/assistant, shared by the route (validation) and
 * the client (types). Hard caps live here; the prompt builder applies tighter
 * budgets on top of them (see prompts.ts).
 */

export const ASSISTANT_MODES = [
  "explain",
  "debug",
  "review",
  "optimize",
  "tests",
  "refactor",
  "hint",
  "chat",
] as const;
export type AssistantMode = (typeof ASSISTANT_MODES)[number];

export const ASSISTANT_LOCALES = ["fr", "en", "es"] as const;
export type AssistantLocale = (typeof ASSISTANT_LOCALES)[number];

export const AI_LIMITS = {
  /** Whole request body, in characters. */
  maxBodyChars: 200_000,
  maxMessages: 24,
  maxMessageChars: 6_000,
  maxConversationChars: 40_000,
  maxFileChars: 60_000,
  maxSelectionChars: 20_000,
  maxConsoleChars: 20_000,
  maxOtherFiles: 30,
  maxOtherFileHeadChars: 2_000,
} as const;

const fileSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().max(AI_LIMITS.maxFileChars),
});

export const assistantContextSchema = z.object({
  surface: z.enum(["playground", "lesson"]).default("playground"),
  language: z.string().max(32).optional(),
  activeFile: fileSchema.optional(),
  selection: z
    .object({
      text: z.string().max(AI_LIMITS.maxSelectionChars),
      startLine: z.number().int().min(1).max(1_000_000).optional(),
      endLine: z.number().int().min(1).max(1_000_000).optional(),
    })
    .optional(),
  otherFiles: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        content: z.string().max(AI_LIMITS.maxOtherFileHeadChars).optional(),
      }),
    )
    .max(AI_LIMITS.maxOtherFiles)
    .optional(),
  console: z
    .object({
      status: z.enum(["idle", "running", "success", "error"]).optional(),
      output: z.string().max(AI_LIMITS.maxConsoleChars),
    })
    .optional(),
  challenge: z
    .object({
      id: z.string().max(100).optional(),
      title: z.string().max(200).optional(),
      description: z.string().max(4_000).optional(),
    })
    .optional(),
  lesson: z
    .object({
      title: z.string().max(300),
      summary: z.string().max(3_000).optional(),
      course: z.string().max(300).optional(),
    })
    .optional(),
});
export type AssistantContext = z.infer<typeof assistantContextSchema>;

export const assistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(AI_LIMITS.maxMessageChars),
});
export type AssistantMessage = z.infer<typeof assistantMessageSchema>;

export const assistantRequestSchema = z
  .object({
    mode: z.enum(ASSISTANT_MODES),
    locale: z.enum(ASSISTANT_LOCALES).default("fr"),
    /** 1 (nudge) to 3 (most explicit) - only used by the hint mode. */
    hintLevel: z.number().int().min(1).max(3).optional(),
    messages: z.array(assistantMessageSchema).min(1).max(AI_LIMITS.maxMessages),
    context: assistantContextSchema.default({ surface: "playground" }),
  })
  .refine((r) => r.messages.at(-1)?.role === "user", {
    message: "The last message must come from the user",
    path: ["messages"],
  })
  .refine(
    (r) =>
      r.messages.reduce((n, m) => n + m.content.length, 0) <=
      AI_LIMITS.maxConversationChars,
    { message: "Conversation too long", path: ["messages"] },
  );
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

// ─── Our own SSE stream (server -> browser) ──────────────────────────────────

export type AssistantErrorCode =
  | "invalid_request"
  | "too_large"
  | "rate_limited"
  | "busy"
  | "unavailable"
  | "timeout"
  | "upstream_error"
  | "internal";

export type AssistantStreamEvent =
  | { event: "meta"; data: { mode: "online" | "offline"; model?: string } }
  | { event: "delta"; data: { text: string } }
  | { event: "done"; data: { truncated: boolean } }
  | { event: "error"; data: { code: AssistantErrorCode; message: string } };

/** Request as the client builds it (defaults not applied yet). */
export type AssistantRequestInput = z.input<typeof assistantRequestSchema>;

/** Map any UI locale ("fr", "en-US", ...) to one the assistant answers in. */
export function toAssistantLocale(locale: string | undefined): AssistantLocale {
  const short = (locale ?? "").slice(0, 2).toLowerCase();
  return short === "en" || short === "es" ? short : "fr";
}
