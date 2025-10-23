"use client";

import dynamic from "next/dynamic";

// Dynamically import the Enhanced AI Assistant component on the client side
const DynamicEnhancedAIAssistant = dynamic(
  () => import("./enhanced-ai-assistant").then((mod) => mod.EnhancedAIAssistant),
  { ssr: false }
);

interface EnhancedAIAssistantWrapperProps {
  challengeId?: string;
}

export function EnhancedAIAssistantWrapper({ challengeId }: EnhancedAIAssistantWrapperProps) {
  return <DynamicEnhancedAIAssistant challengeId={challengeId} />;
}
