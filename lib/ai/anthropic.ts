import { readSseStream } from "./sse";

/**
 * Server-only client for the Anthropic Messages API (streaming), over plain
 * `fetch`. The API key never leaves the server.
 */

export const DEFAULT_AI_MODEL = "claude-sonnet-5-5";
const DEFAULT_BASE_URL = "https://api.anthropic.com";
const ANTHROPIC_VERSION = "2023-06-01";

export interface AiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

/** Read the configuration from the environment; null when no key is set (offline mode). */
export function getAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig | null {
  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  const config = {
    model: env.AI_MODEL?.trim() || DEFAULT_AI_MODEL,
    baseUrl: (env.ANTHROPIC_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ""),
  } as AiConfig;
  // Not enumerable: JSON.stringify(config), spreads and logger context never carry the key
  Object.defineProperty(config, "apiKey", { value: apiKey, enumerable: false, writable: false });
  return config;
}

export type AiErrorCode = "busy" | "unavailable" | "timeout" | "upstream_error";

/**
 * A failure of the model provider, already translated to something safe to show:
 * the message never contains the upstream body, status text or key.
 */
export class AiUpstreamError extends Error {
  constructor(
    readonly code: AiErrorCode,
    readonly httpStatus: number,
    message: string,
    readonly retryAfter?: number,
    /** HTTP status returned by the provider, when there was one (for logs only). */
    readonly upstreamStatus?: number,
  ) {
    super(message);
    this.name = "AiUpstreamError";
  }
}

export function mapUpstreamStatus(status: number, retryAfterHeader?: string | null): AiUpstreamError {
  const mapped = mapStatus(status, retryAfterHeader);
  return new AiUpstreamError(mapped.code, mapped.httpStatus, mapped.message, mapped.retryAfter, status);
}

function mapStatus(status: number, retryAfterHeader?: string | null): AiUpstreamError {
  const parsed = Number(retryAfterHeader);
  const retryAfter = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.ceil(parsed), 600) : undefined;
  if (status === 429 || status === 529) {
    return new AiUpstreamError("busy", 503, "The AI service is busy, please retry shortly.", retryAfter ?? 30);
  }
  if (status === 401 || status === 403) {
    // A bad key is an operator problem, not something the learner can act on
    return new AiUpstreamError("unavailable", 503, "The AI service is not available right now.");
  }
  if (status === 408 || status === 504) {
    return new AiUpstreamError("timeout", 504, "The AI service took too long to answer.");
  }
  return new AiUpstreamError("upstream_error", 502, "The AI service returned an error.");
}

export interface CompletionMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  config: AiConfig;
  system: string;
  messages: CompletionMessage[];
  maxTokens: number;
  /** Aborts the upstream call, e.g. when the browser disconnects. */
  signal?: AbortSignal;
  /** Time allowed to receive the response headers. */
  connectTimeoutMs?: number;
  /** Longest silence tolerated between two chunks. */
  idleTimeoutMs?: number;
  /** Ceiling for the whole answer. */
  totalTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Token accounting reported by the provider (message_start / message_delta). */
export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

export interface CompletionStream {
  /** Text deltas, in order. Throws AiUpstreamError if the stream fails midway. */
  text: AsyncGenerator<string, void>;
  /** Available once `text` is exhausted: whether the answer hit max_tokens. */
  readonly truncated: boolean;
  /** Latest usage numbers seen so far (final once `text` is exhausted). */
  readonly usage: AiUsage;
  /** stop_reason from message_delta, when seen. */
  readonly stopReason: string | null;
  /** Characters of answer streamed so far (lets callers estimate tokens if the stream is cut). */
  readonly outputChars: number;
}

/**
 * Start a streaming completion. Resolves once the provider has accepted the
 * request (so HTTP-level failures surface as an AiUpstreamError before any byte
 * is sent to the browser); text then arrives through `text`.
 */
export async function openCompletion(opts: CompletionOptions): Promise<CompletionStream> {
  const {
    config,
    connectTimeoutMs = 30_000,
    idleTimeoutMs = 30_000,
    totalTimeoutMs = 120_000,
    fetchImpl = fetch,
  } = opts;

  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const startedAt = Date.now();

  const arm = (ms: number) => {
    clearTimeout(timer);
    const remaining = totalTimeoutMs - (Date.now() - startedAt);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, Math.max(1, Math.min(ms, remaining)));
  };
  const onAbort = () => controller.abort();
  const cleanup = () => {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onAbort);
  };

  if (opts.signal?.aborted) controller.abort();
  else opts.signal?.addEventListener("abort", onAbort, { once: true });
  arm(connectTimeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(`${config.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: opts.maxTokens,
        system: opts.system,
        messages: opts.messages,
        stream: true,
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    cleanup();
    if (opts.signal?.aborted) throw error; // the caller went away: not an upstream failure
    if (timedOut) throw new AiUpstreamError("timeout", 504, "The AI service took too long to answer.");
    throw new AiUpstreamError("upstream_error", 502, "The AI service could not be reached.");
  }

  if (!response.ok || !response.body) {
    cleanup();
    const retryAfter = response.headers.get("retry-after");
    await response.body?.cancel().catch(() => {});
    throw mapUpstreamStatus(response.ok ? 502 : response.status, retryAfter);
  }

  const body = response.body;
  const stream = {
    truncated: false,
    stopReason: null as string | null,
    outputChars: 0,
    usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 } as AiUsage,
  };
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined);
  const absorbUsage = (u: unknown) => {
    if (!u || typeof u !== "object") return;
    const r = u as Record<string, unknown>;
    // Counts only ever grow; message_delta repeats input fields on some API versions
    stream.usage.inputTokens = num(r.input_tokens) ?? stream.usage.inputTokens;
    stream.usage.outputTokens = Math.max(stream.usage.outputTokens, num(r.output_tokens) ?? 0);
    stream.usage.cacheReadTokens = num(r.cache_read_input_tokens) ?? stream.usage.cacheReadTokens;
    stream.usage.cacheCreationTokens = num(r.cache_creation_input_tokens) ?? stream.usage.cacheCreationTokens;
  };

  async function* generate(): AsyncGenerator<string, void> {
    let finished = false;
    try {
      arm(idleTimeoutMs);
      for await (const sse of readSseStream(body)) {
        arm(idleTimeoutMs);
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(sse.data);
        } catch {
          continue; // not JSON (e.g. a keep-alive): nothing to act on
        }
        const type = (payload.type as string | undefined) ?? sse.event;

        if (type === "content_block_delta") {
          const delta = payload.delta as { type?: string; text?: string } | undefined;
          if (delta?.type === "text_delta" && typeof delta.text === "string" && delta.text) {
            stream.outputChars += delta.text.length;
            yield delta.text;
          }
        } else if (type === "message_start") {
          absorbUsage((payload.message as { usage?: unknown } | undefined)?.usage);
        } else if (type === "message_delta") {
          const delta = payload.delta as { stop_reason?: string } | undefined;
          if (delta?.stop_reason === "max_tokens") stream.truncated = true;
          if (typeof delta?.stop_reason === "string") stream.stopReason = delta.stop_reason;
          absorbUsage(payload.usage);
        } else if (type === "message_stop") {
          finished = true;
          return;
        } else if (type === "error") {
          const err = payload.error as { type?: string } | undefined;
          const busy = err?.type === "overloaded_error" || err?.type === "rate_limit_error";
          throw busy
            ? new AiUpstreamError("busy", 503, "The AI service is busy, please retry shortly.", 30)
            : new AiUpstreamError("upstream_error", 502, "The AI service returned an error.");
        }
      }
      if (!finished) {
        throw new AiUpstreamError("upstream_error", 502, "The AI service closed the stream unexpectedly.");
      }
    } catch (error) {
      if (error instanceof AiUpstreamError) throw error;
      if (opts.signal?.aborted) throw error;
      if (timedOut) throw new AiUpstreamError("timeout", 504, "The AI service took too long to answer.");
      throw new AiUpstreamError("upstream_error", 502, "The AI service stream failed.");
    } finally {
      cleanup();
      controller.abort(); // release the connection if we stopped early
    }
  }

  return {
    text: generate(),
    get truncated() {
      return stream.truncated;
    },
    get usage() {
      return { ...stream.usage };
    },
    get stopReason() {
      return stream.stopReason;
    },
    get outputChars() {
      return stream.outputChars;
    },
  };
}
