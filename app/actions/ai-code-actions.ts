"use server";

import { 
  AICodeAssistRequest, 
  CodeAnalysis, 
  CodeHint,
  generateCodeAnalysis,
  generateCodeExplanation,
  generateOptimizationSuggestions,
  generateDebugSuggestions,
  generateHint,
  generateChatResponse
} from "@/app/_services/ai-code-service";

/**
 * Server action to analyze code based on the request type
 * This is the main entry point for AI code assistance
 */
export async function analyzeCode(
  request: AICodeAssistRequest
): Promise<CodeAnalysis | CodeHint | Record<string, unknown>> {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const { code, language, query, challengeId, requestType } = request;
  
  switch (requestType) {
    case "analyze":
      return generateCodeAnalysis(code, language);
    case "explain":
      return generateCodeExplanation(code, language, query);
    case "optimize":
      return generateOptimizationSuggestions(code, language);
    case "debug":
      return generateDebugSuggestions(code, language);
    case "hint":
      return generateHint(challengeId || "", code);
    case "chat":
      return generateChatResponse(code, language, query || "");
    default:
      throw new Error("Invalid request type");
  }
}
