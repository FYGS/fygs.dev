import { NextRequest, NextResponse } from "next/server";
import { ReviewDatabaseOptimizer } from "@/lib/services/review-database-optimizer";
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

    const metrics = await ReviewDatabaseOptimizer.getPerformanceMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error getting performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to get performance metrics" },
      { status: 500 }
    );
  }
}
