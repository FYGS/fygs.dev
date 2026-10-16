import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { rateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";
import { AiUpstreamError, getAiConfig, openCompletion } from "@/lib/ai/anthropic";
import { generateOfflineAnswer } from "@/lib/ai/offline";
import { buildModelPrompt } from "@/lib/ai/prompts";
import { AI_LIMITS, assistantRequestSchema, type AssistantErrorCode } from "@/lib/ai/schema";
import { formatSse } from "@/lib/ai/sse";

/**
 * POST /api/ai/assistant: the AI tutor. JSON in, Server-Sent Events out.
 *
 *   event: meta   {"mode":"online"|"offline","model"?}
 *   event: delta  {"text":"..."}            (repeated)
 *   event: done   {"truncated":boolean}
 *   event: error  {"code","message"}        (mid-stream failure)
 *
 * Failures before the stream starts are plain JSON with a matching HTTP status.
 * Without ANTHROPIC_API_KEY the answer comes from the local static analyzer.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GUEST_PER_HOUR = 8;
const USER_PER_HOUR = 60;
const BURST = { limit: 5, windowSeconds: 10 };
const HOUR = 3600;
/** UTF-8 can take 4 bytes per character; this is only the cheap pre-check. */
const MAX_BODY_BYTES = AI_LIMITS.maxBodyChars * 4;
const OFFLINE_CHUNK = 400;

const NO_STORE = { "Cache-Control": "no-store, no-transform" } as const;

function fail(
  status: number,
  code: AssistantErrorCode,
  error: string,
  extra: { retryAfter?: number; headers?: Record<string, string>; issues?: string[] } = {},
) {
  const headers: Record<string, string> = { ...NO_STORE, ...extra.headers };
  if (extra.retryAfter) headers["Retry-After"] = String(extra.retryAfter);
  return NextResponse.json(
    { error, code, ...(extra.retryAfter ? { retryAfter: extra.retryAfter } : {}), ...(extra.issues ? { issues: extra.issues } : {}) },
    { status, headers },
  );
}

async function getUserId(headers: Headers): Promise<string | null> {
  // Visitors have no session cookie, so this is free for them. For a signed-in
  // user a slow session store must not stall the tutor: treat it as a guest.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const session = await Promise.race([
      auth.api.getSession({ headers }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 2_000);
      }),
    ]);
    return session?.user?.id ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  // 1. Cheap rejections first
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return fail(413, "too_large", "Request too large");
  }

  const burst = await checkRateLimit(request, "ai-assistant-burst", BURST);
  if (!burst.allowed) {
    return fail(429, "rate_limited", "Too many requests", {
      retryAfter: burst.retryAfter,
      headers: rateLimitHeaders(burst),
    });
  }

  // 2. Parse and validate
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, "invalid_request", "Invalid request");
  }
  if (raw.length > AI_LIMITS.maxBodyChars) return fail(413, "too_large", "Request too large");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_request", "Invalid JSON");
  }
  const parsed = assistantRequestSchema.safeParse(json);
  if (!parsed.success) {
    const issues = [...new Set(parsed.error.issues.map((i) => i.path.join(".") || "body"))].slice(0, 10);
    return fail(400, "invalid_request", "Invalid request", { issues });
  }
  const body = parsed.data;

  // 3. Quota: visitors by IP, signed-in users by account
  const userId = await getUserId(request.headers);
  const config = getAiConfig();
  // The offline analyzer costs next to nothing: only the burst limit applies to it
  let quotaHeaders: Record<string, string> = {};
  if (config) {
    const quota = await checkRateLimit(request, "ai-assistant", {
      limit: userId ? USER_PER_HOUR : GUEST_PER_HOUR,
      windowSeconds: HOUR,
      subject: userId ? `user:${userId}` : undefined,
    });
    quotaHeaders = rateLimitHeaders(quota);
    if (!quota.allowed) {
      return fail(429, "rate_limited", "Too many requests", {
        retryAfter: quota.retryAfter,
        headers: quotaHeaders,
      });
    }
  }

  if (userId) {
    // Fire and forget; no code or message content is recorded
    void AnalyticsHelper.emit({
      userId,
      type: "AI_ASSISTANT_REQUEST",
      source: "api",
      properties: {
        mode: body.mode,
        surface: body.context.surface,
        locale: body.locale,
        backend: config ? "online" : "offline",
      },
    });
  }

  // 4. Cancel upstream work as soon as the browser goes away
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });

  const encoder = new TextEncoder();
  const headers = {
    ...NO_STORE,
    ...quotaHeaders,
    "Content-Type": "text/event-stream; charset=utf-8",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };

  // 5a. Offline mode
  if (!config) {
    const answer = generateOfflineAnswer(body);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(formatSse("meta", { mode: "offline" })));
        for (let i = 0; i < answer.length; i += OFFLINE_CHUNK) {
          controller.enqueue(encoder.encode(formatSse("delta", { text: answer.slice(i, i + OFFLINE_CHUNK) })));
        }
        controller.enqueue(encoder.encode(formatSse("done", { truncated: false })));
        controller.close();
      },
    });
    return new Response(stream, { headers });
  }

  // 5b. Model-backed answer
  const prompt = buildModelPrompt(body);
  let completion;
  try {
    completion = await openCompletion({
      config,
      system: prompt.system,
      messages: prompt.messages,
      maxTokens: prompt.maxTokens,
      signal: abort.signal,
    });
  } catch (error) {
    if (abort.signal.aborted) return new Response(null, { status: 499 });
    if (error instanceof AiUpstreamError) {
      console.error(`[ai] upstream failure: ${error.code}`);
      return fail(error.httpStatus, error.code, error.message, { retryAfter: error.retryAfter });
    }
    console.error("[ai] unexpected failure opening the stream");
    return fail(500, "internal", "Unexpected error");
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(formatSse(event, data)));
      try {
        send("meta", { mode: "online", model: config.model });
        for await (const text of completion.text) send("delta", { text });
        send("done", { truncated: completion.truncated });
      } catch (error) {
        if (!abort.signal.aborted) {
          const known = error instanceof AiUpstreamError;
          console.error(`[ai] stream failure: ${known ? error.code : "unexpected"}`);
          send("error", {
            code: known ? error.code : "internal",
            message: known ? error.message : "Unexpected error",
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed by a cancel
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, { headers });
}

/** Which backend is active, so the UI can label offline mode before the first question. */
export async function GET() {
  const config = getAiConfig();
  return NextResponse.json({ mode: config ? "online" : "offline" }, { headers: NO_STORE });
}
