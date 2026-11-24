import { NextRequest, NextResponse } from "next/server";
import { activeHumanProofMode } from "@/lib/anti-automation";
import { markHot, ipBucketOf } from "@/lib/anti-automation/hot-buckets";
import { isHumanProofAction, issueChallenge } from "@/lib/anti-automation/pow";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/pow?action=sign-up: hands out a proof-of-work challenge (lib/anti-automation/pow.ts).
 *
 * Public and cheap: one HMAC. Rate limited per client address, and a network that asks for challenges in bulk is also
 * marked as hot, which raises the work its next challenges ask for. When the layer is switched off
 * (HUMAN_PROOF_MODE=off) it answers `{ enforced: false }` and browsers skip the work.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");
  if (!isHumanProofAction(action)) {
    return NextResponse.json({ error: "unknown_action" }, { status: 400, headers: NO_STORE });
  }

  if (activeHumanProofMode() === "off") {
    return NextResponse.json({ enforced: false }, { headers: NO_STORE });
  }

  const limited = await enforceRateLimit(request, "pow-issue", { limit: 60, windowSeconds: 600 });
  if (limited) {
    markHot(ipBucketOf(getClientIp(request.headers)));
    return limited;
  }

  const challenge = issueChallenge(action, getClientIp(request.headers));
  return NextResponse.json({ enforced: true, ...challenge }, { headers: NO_STORE });
}
