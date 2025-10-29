import { NextRequest, NextResponse } from "next/server";
import { ReviewDatabaseOptimizer } from "@/lib/services/review-database-optimizer";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const health = await ReviewDatabaseOptimizer.healthCheck();

    return NextResponse.json(health);
  } catch (error) {
    console.error("Error getting health check:", error);
    return NextResponse.json(
      { error: "Failed to get health check" },
      { status: 500 }
    );
  }
}
