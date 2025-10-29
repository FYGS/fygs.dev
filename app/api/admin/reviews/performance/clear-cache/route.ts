import { NextRequest, NextResponse } from "next/server";
import { ReviewCacheService } from "@/lib/services/review-cache";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleared = await ReviewCacheService.clearAllCache();

    return NextResponse.json({
      success: true,
      message: `Cleared ${cleared} cache keys`,
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
