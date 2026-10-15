import { analyzeCode } from "@/app/actions/ai-code-actions";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "ai", {
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const { challengeId, code, language } = await request.json();

    if (!challengeId || !code || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the AI service
    const response = await analyzeCode({
      code,
      language,
      challengeId,
      requestType: "hint",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in AI hint API:", error);
    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}
