import { NextRequest, NextResponse } from "next/server";
import { ReviewCacheService } from "@/lib/services/review-cache";
import { auth } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request, "admin", {
    limit: 60,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await ReviewCacheService.getCacheStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return NextResponse.json(
      { error: "Failed to get cache stats" },
      { status: 500 }
    );
  }
}
