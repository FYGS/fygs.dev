import { analyzeCode } from "@/app/_services/ai-code-actions";
import { RequestType } from "@/app/_services/ai-code-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, code, language, challengeId } = await request.json();

    if (!message || !code || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Determine the request type based on the message content
    let requestType: RequestType = "chat" as const;
    if (message.toLowerCase().includes("optimize")) {
      requestType = "optimize";
    } else if (message.toLowerCase().includes("explain")) {
      requestType = "explain";
    } else if (message.toLowerCase().includes("debug")) {
      requestType = "debug";
    } else if (
      message.toLowerCase().includes("hint") ||
      message.toLowerCase().includes("help")
    ) {
      requestType = "hint";
    }

    // Call the AI service
    const response = await analyzeCode({
      code,
      language,
      query: message,
      challengeId,
      requestType,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in AI chat API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
