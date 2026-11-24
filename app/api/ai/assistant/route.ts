import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AnalyticsHelper } from "@/lib/analytics-helper";
import { rateLimitHeaders, checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyHumanProof } from "@/lib/anti-automation";
import { AiUpstreamError, getAiConfig, openCompletion } from "@/lib/ai/anthropic";
import { generateOfflineAnswer } from "@/lib/ai/offline";
import { buildModelPrompt } from "@/lib/ai/prompts";
import { AI_LIMITS, assistantRequestSchema, type AssistantErrorCode } from "@/lib/ai/schema";
import { formatSse } from "@/lib/ai/sse";
import { AiOutputFilter, filterAiOutput } from "@/lib/ai/output-filter";
import {
  estimateTokens,
  getBudgetConfig,
  reserveModelRequest,
  settleModelRequest,
  shouldLogExhaustion,
  type BudgetDenial,
  type BudgetScope,
  type BudgetSubject,
} from "@/lib/ai/budget";
import { createLogger } from "@/lib/structured-logger";

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

// Logs carry ids, counts and timings only: never the prompt, the code or the answer
const log = createLogger({ operation: "ai-assistant" });

const GUEST_PER_HOUR = 8;
const USER_PER_HOUR = 60;
const BURST = { limit: 5, windowSeconds: 10 };
const HOUR = 3600;
const DAY = 24 * HOUR;
/** UTF-8 can take 4 bytes per character; this is only the cheap pre-check. */
const MAX_BODY_BYTES = AI_LIMITS.maxBodyChars * 4;
const OFFLINE_CHUNK = 400;

/** Why the answer comes from the local analyzer instead of the model (shown to the learner as a first line). */
type OfflineReason = "budget" | "share" | "unavailable" | "proof";

const OFFLINE_NOTICE: Record<OfflineReason, Record<string, string>> = {
  budget: {
    fr: "_Le tuteur IA a atteint sa capacité quotidienne : voici une analyse locale à la place. Le modèle sera de nouveau disponible demain._\n\n",
    en: "_The AI tutor has reached its daily capacity, so this is a local analysis instead. The model will be available again tomorrow._\n\n",
    es: "_El tutor de IA ha alcanzado su capacidad diaria, así que esto es un análisis local. El modelo volverá a estar disponible mañana._\n\n",
  },
  share: {
    fr: "_Vous avez utilisé votre part quotidienne du tuteur IA : voici une analyse locale à la place. Elle se renouvelle demain._\n\n",
    en: "_You have used your daily share of the AI tutor, so this is a local analysis instead. It renews tomorrow._\n\n",
    es: "_Has usado tu parte diaria del tutor de IA, así que esto es un análisis local. Se renueva mañana._\n\n",
  },
  unavailable: {
    fr: "_Le tuteur IA est momentanément indisponible : voici une analyse locale à la place._\n\n",
    en: "_The AI tutor is temporarily unavailable, so this is a local analysis instead._\n\n",
    es: "_El tutor de IA no está disponible por el momento, así que esto es un análisis local._\n\n",
  },
  proof: {
    fr: "_Le tuteur IA a besoin d'une vérification que votre navigateur n'a pas pu faire : voici une analyse locale à la place. Rechargez la page pour réessayer._\n\n",
    en: "_The AI tutor needs a check your browser could not complete, so this is a local analysis instead. Reload the page to try again._\n\n",
    es: "_El tutor de IA necesita una comprobación que tu navegador no pudo completar, así que esto es un análisis local. Recarga la página para reintentar._\n\n",
  },
};

/** What the budget refused, as the reason the learner is told about. */
function offlineReasonFor(reason: BudgetDenial, scope: BudgetScope): OfflineReason {
  if (reason === "store_unavailable") return "unavailable";
  return scope === "subject" ? "share" : "budget";
}

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
  const budget = getBudgetConfig();
  // Who the budget share belongs to: the account, the visitor's (trusted) address, or "unknown address" for everyone
  // whose address cannot be told: that last bucket is small on purpose
  const clientIp = getClientIp(request.headers);
  const subject: BudgetSubject = userId
    ? { kind: "user", id: userId }
    : clientIp === "unknown"
      ? { kind: "unknown" }
      : { kind: "guest", id: clientIp };
  // The offline analyzer costs next to nothing: only the burst limit applies to it
  let quotaHeaders: Record<string, string> = {};
  if (config) {
    const quota = await checkRateLimit(request, "ai-assistant", {
      // visitors whose address is unknown share one bucket: it is deliberately tight
      limit: userId ? USER_PER_HOUR : subject.kind === "unknown" ? Math.max(1, Math.floor(GUEST_PER_HOUR / 4)) : GUEST_PER_HOUR,
      windowSeconds: HOUR,
      subject: userId ? `user:${userId}` : subject.kind === "unknown" ? "ip:unknown" : undefined,
      failMode: "closed",
    });
    quotaHeaders = rateLimitHeaders(quota);
    if (!quota.allowed) {
      return fail(429, "rate_limited", "Too many requests", {
        retryAfter: quota.retryAfter,
        headers: quotaHeaders,
      });
    }
    // Daily ceiling on top of the hourly one, per account or per visitor IP
    const dailyLimit = userId
      ? budget.userDailyRequests
      : subject.kind === "unknown"
        ? Math.max(1, Math.floor(budget.guestDailyRequests / 10))
        : budget.guestDailyRequests;
    if (dailyLimit > 0) {
      const daily = await checkRateLimit(request, "ai-assistant-day", {
        limit: dailyLimit,
        windowSeconds: DAY,
        subject: userId ? `user:${userId}` : subject.kind === "unknown" ? "ip:unknown" : undefined,
        failMode: "closed",
      });
      if (!daily.allowed) {
        log.warn("ai.assistant.daily_cap_reached", {
          eventType: "ai.assistant.daily_cap_reached",
          userId: userId ?? undefined,
          metadata: { signedIn: !!userId, limit: dailyLimit },
        });
        return fail(429, "rate_limited", "Daily limit reached, please come back tomorrow", {
          retryAfter: daily.retryAfter,
          headers: { ...quotaHeaders, ...rateLimitHeaders(daily) },
        });
      }
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

  // 5a. Offline mode (no key configured, the budget is spent, or the visitor could not be verified)
  const respondOffline = (reason?: OfflineReason) => {
    const notice = reason ? (OFFLINE_NOTICE[reason][body.locale] ?? OFFLINE_NOTICE[reason].en) : "";
    // The analyzer echoes the learner's own code and console: the same filter as for the model applies
    const answer = filterAiOutput(notice + generateOfflineAnswer(body));
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(formatSse("meta", { mode: "offline", ...(reason ? { reason } : {}) })));
        for (let i = 0; i < answer.length; i += OFFLINE_CHUNK) {
          controller.enqueue(encoder.encode(formatSse("delta", { text: answer.slice(i, i + OFFLINE_CHUNK) })));
        }
        controller.enqueue(encoder.encode(formatSse("done", { truncated: false })));
        controller.close();
      },
    });
    return new Response(stream, { headers });
  };
  if (!config) return respondOffline();

  // 5b-0. A visitor without an account proves that a browser did some work (see lib/anti-automation): without the
  // proof the answer comes from the local analyzer, which costs nothing
  if (!userId) {
    const proof = await verifyHumanProof(request, "ai-guest");
    if (!proof.ok) return respondOffline("proof");
  }

  // 5b-1. Build the prompt first: its size is part of what the budget reserves
  const prompt = buildModelPrompt(body);
  const inputTokens = estimateTokens(prompt.system.length + prompt.messages.reduce((n, m) => n + m.content.length, 0));

  // 5b-2. Budget: the request must fit in the global caps and in this subject's share, or the local analyzer answers
  const reservation = await reserveModelRequest(budget, { subject, inputTokens, maxOutputTokens: prompt.maxTokens });
  if (!reservation.allowed) {
    if (shouldLogExhaustion()) {
      log.error("ai.assistant.budget_exhausted", {
        eventType: "ai.assistant.budget_exhausted",
        metadata: {
          exhausted: reservation.reason,
          scope: reservation.scope,
          subject: subject.kind,
          budgetStore: reservation.degraded ? "memory" : "redis",
        },
      });
    }
    return respondOffline(offlineReasonFor(reservation.reason, reservation.scope));
  }

  // 5b. Model-backed answer
  const startedAt = Date.now();
  const base = { userId: userId ?? undefined, eventType: "ai.assistant" };
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
    // Nothing will be produced for this request: give the reservation back
    void settleModelRequest(reservation, 0);
    if (abort.signal.aborted) return new Response(null, { status: 499 });
    if (error instanceof AiUpstreamError) {
      log.error("ai.assistant.upstream_error", {
        ...base,
        duration: Date.now() - startedAt,
        metadata: { phase: "open", code: error.code, upstreamStatus: error.upstreamStatus, model: config.model, mode: body.mode },
      });
      return fail(error.httpStatus, error.code, error.message, { retryAfter: error.retryAfter });
    }
    log.error("ai.assistant.internal_error", { ...base, duration: Date.now() - startedAt, metadata: { phase: "open", model: config.model } });
    return fail(500, "internal", "Unexpected error");
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(formatSse(event, data)));
      let outcome: "ok" | "error" | "aborted" = "ok";
      let errorCode: string | undefined;
      let firstTokenAt = 0;
      // What the model writes is filtered before the browser sees it (images and active HTML never get through)
      const filter = new AiOutputFilter();
      try {
        send("meta", { mode: "online", model: config.model });
        for await (const text of completion.text) {
          if (!firstTokenAt) firstTokenAt = Date.now();
          const safe = filter.push(text);
          if (safe) send("delta", { text: safe });
        }
        const rest = filter.flush();
        if (rest) send("delta", { text: rest });
        send("done", { truncated: completion.truncated });
      } catch (error) {
        if (abort.signal.aborted) {
          outcome = "aborted";
        } else {
          outcome = "error";
          const known = error instanceof AiUpstreamError;
          errorCode = known ? error.code : "internal";
          send("error", {
            code: known ? error.code : "internal",
            message: known ? error.message : "Unexpected error",
          });
        }
      } finally {
        // Account what was produced even when the stream was cut: the provider bills it
        const usage = completion.usage;
        const outputTokens = Math.max(usage.outputTokens, Math.ceil(completion.outputChars / 4));
        // Replace the worst case reserved at the start by what was really produced
        void settleModelRequest(reservation, outputTokens);
        const entry = {
          ...base,
          duration: Date.now() - startedAt,
          metadata: {
            outcome,
            errorCode,
            model: config.model,
            mode: body.mode,
            surface: body.context.surface,
            inputTokens: usage.inputTokens,
            outputTokens,
            cacheReadTokens: usage.cacheReadTokens,
            stopReason: completion.stopReason ?? undefined,
            truncated: completion.truncated,
            timeToFirstTokenMs: firstTokenAt ? firstTokenAt - startedAt : undefined,
          },
        };
        if (outcome === "error") log.error("ai.assistant.stream_error", entry);
        else log.info("ai.assistant.completed", entry);
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
