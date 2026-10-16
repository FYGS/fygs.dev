import { readSseStream } from "@/lib/ai/sse";
import type { AssistantErrorCode, AssistantRequestInput } from "@/lib/ai/schema";

/** Browser side of POST /api/ai/assistant. */

export const ASSISTANT_ENDPOINT = "/api/ai/assistant";

export class AssistantClientError extends Error {
  constructor(
    readonly code: AssistantErrorCode | "network",
    message: string,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "AssistantClientError";
  }
}

export interface StreamHandlers {
  onMeta?: (meta: { mode: "online" | "offline"; model?: string }) => void;
  onDelta: (text: string) => void;
  onDone?: (done: { truncated: boolean }) => void;
}

export interface StreamOptions {
  signal?: AbortSignal;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

const KNOWN_CODES: ReadonlySet<string> = new Set<AssistantErrorCode>([
  "invalid_request",
  "too_large",
  "rate_limited",
  "busy",
  "unavailable",
  "timeout",
  "upstream_error",
  "internal",
]);

function asCode(value: unknown): AssistantErrorCode {
  return typeof value === "string" && KNOWN_CODES.has(value) ? (value as AssistantErrorCode) : "internal";
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Send a request and feed the handlers as the answer streams in. Resolves when
 * the server says it is done; throws AssistantClientError on any failure and
 * the platform's AbortError when `signal` is aborted.
 */
export async function streamAssistant(
  request: AssistantRequestInput,
  handlers: StreamHandlers,
  options: StreamOptions = {},
): Promise<void> {
  const { signal, endpoint = ASSISTANT_ENDPOINT, fetchImpl = fetch } = options;

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(request),
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AssistantClientError("network", "Network error");
  }

  if (!response.ok) {
    const json = parseJson(await response.text().catch(() => ""));
    const header = Number(response.headers.get("retry-after"));
    const retryAfter = Number(json?.retryAfter) || (Number.isFinite(header) && header > 0 ? header : undefined);
    const code = json ? asCode(json.code) : response.status === 429 ? "rate_limited" : "internal";
    throw new AssistantClientError(code, String(json?.error ?? "Request failed"), retryAfter);
  }
  if (!response.body || !(response.headers.get("content-type") ?? "").includes("text/event-stream")) {
    throw new AssistantClientError("internal", "Unexpected response");
  }

  let finished = false;
  try {
    for await (const event of readSseStream(response.body, signal)) {
      const data = parseJson(event.data);
      if (!data) continue;
      if (event.event === "meta") {
        handlers.onMeta?.({ mode: data.mode === "offline" ? "offline" : "online", model: data.model as string | undefined });
      } else if (event.event === "delta") {
        if (typeof data.text === "string") handlers.onDelta(data.text);
      } else if (event.event === "done") {
        finished = true;
        handlers.onDone?.({ truncated: data.truncated === true });
      } else if (event.event === "error") {
        throw new AssistantClientError(asCode(data.code), String(data.message ?? "Error"));
      }
    }
  } catch (error) {
    if (error instanceof AssistantClientError) throw error;
    if (signal?.aborted) throw error;
    throw new AssistantClientError("network", "Stream interrupted");
  }
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  if (!finished) throw new AssistantClientError("network", "Stream interrupted");
}
