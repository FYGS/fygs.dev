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

    const recommendations =
      await ReviewDatabaseOptimizer.getOptimizationRecommendations();

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error getting optimization recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get optimization recommendations" },
      { status: 500 }
    );
  }
}
