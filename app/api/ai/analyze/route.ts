import { analyzeCode } from "@/app/actions/ai-code-actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the AI service
    const response = await analyzeCode({
      code,
      language,
      requestType: "analyze",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in AI analyze API:", error);
    return NextResponse.json(
      { error: "Failed to analyze code" },
      { status: 500 }
    );
  }
}
