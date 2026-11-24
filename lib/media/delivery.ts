import { NextResponse } from "next/server";

import { signedReadUrl, storageKeyFromUrl } from "./storage";

/**
 * The answer of the media routes: a redirect to the file, never the file itself (a video is streamed by the
 * storage, with ranges and seeking, not through the Next.js server). The redirect itself is never cached or shared.
 */

const HEADERS = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export const mediaNotFound = () => NextResponse.json({ error: "NOT_FOUND" }, { status: 404, headers: HEADERS });

/**
 * Sends the viewer to a stored address: a short-lived signed address when it lies in our storage, the address itself
 * when it is an https address elsewhere. Anything else is not served.
 */
export async function redirectToMedia(address: string, options: { downloadAs?: string } = {}): Promise<NextResponse> {
  const key = storageKeyFromUrl(address);
  if (key) {
    const signed = await signedReadUrl(key, { downloadAs: options.downloadAs });
    // Storage without credentials in this process (a read-only deployment): the stored address still works if public
    return NextResponse.redirect(signed ?? address, { status: 302, headers: HEADERS });
  }
  try {
    if (new URL(address).protocol !== "https:") return mediaNotFound();
  } catch {
    return mediaNotFound();
  }
  return NextResponse.redirect(address, { status: 302, headers: HEADERS });
}
