import { NextResponse } from "next/server";

/**
 * Reads a JSON request body. A body that is not valid JSON is a client error:
 * answer 400 instead of letting the SyntaxError surface as a 500.
 *
 *   const parsed = await parseJsonBody(request);
 *   if (!parsed.ok) return parsed.response;
 *   const body = parsed.body;
 */
export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Corps de requête invalide (JSON attendu)" },
        { status: 400 },
      ),
    };
  }
}
