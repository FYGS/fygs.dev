/**
 * Reading a request body with a hard cap on the bytes accepted.
 *
 * `request.json()` and `request.text()` buffer the whole body before anyone can look at its size, and a
 * `Content-Length` header is only a claim (it is absent with chunked transfer). These helpers refuse as soon as the
 * stream passes the limit, so an anonymous caller cannot make the server hold megabytes per request.
 */

export type BodyResult =
  | { ok: true; text: string }
  | { ok: false; status: 400 | 413; error: "too_large" | "unreadable" };

export async function readBodyText(request: Request, maxBytes: number): Promise<BodyResult> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, status: 413, error: "too_large" };

  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, error: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "unreadable" };
  }

  const joined = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(joined) };
  } catch {
    return { ok: false, status: 400, error: "unreadable" };
  }
}

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: "too_large" | "unreadable" | "invalid_json" };

/** The body as JSON, within `maxBytes`. An empty body is `invalid_json`. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const body = await readBodyText(request, maxBytes);
  if (!body.ok) return body;
  try {
    return { ok: true, value: JSON.parse(body.text) as unknown };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
