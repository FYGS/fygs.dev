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

const MAX_CODE_LENGTH = 50_000;
const MAX_LANGUAGE_LENGTH = 32;
const MAX_QUERY_LENGTH = 2_000;
const MAX_CHALLENGE_ID_LENGTH = 100;

/**
 * Server action to analyze code based on the request type
 * This is the main entry point for AI code assistance
 */
export async function analyzeCode(
  request: AICodeAssistRequest
): Promise<CodeAnalysis | CodeHint | Record<string, unknown>> {
  const { code, language, query, challengeId, requestType } = request;

  // Server actions are public endpoints and TypeScript types are not enforced at
  // runtime: bound every input before doing any work.
  if (
    typeof code !== "string" ||
    code.length > MAX_CODE_LENGTH ||
    typeof language !== "string" ||
    language.length > MAX_LANGUAGE_LENGTH ||
    (query !== undefined && (typeof query !== "string" || query.length > MAX_QUERY_LENGTH)) ||
    (challengeId !== undefined &&
      (typeof challengeId !== "string" || challengeId.length > MAX_CHALLENGE_ID_LENGTH))
  ) {
    throw new Error("Invalid request");
  }

  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
