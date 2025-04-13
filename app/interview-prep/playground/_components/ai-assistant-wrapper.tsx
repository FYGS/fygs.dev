"use client";

import dynamic from "next/dynamic";

// Dynamically import the AI Assistant component on the client side
const DynamicAIAssistant = dynamic(
  () => import("./ai-assistant").then((mod) => mod.AIAssistant),
  { ssr: false }
);

export function AIAssistantWrapper() {
  return <DynamicAIAssistant />;
}
