import { EditorLoading } from "@/app/interview-prep/playground/_components/editor-loading";
import { Metadata } from "next";
import { Suspense } from "react";
import { EnhancedAIAssistantWrapper } from "./_components/enhanced-ai-assistant-wrapper";
import { FormatAnimation } from "./_components/format-animation";
import { ModernEditorLayout } from "./_components/modern-editor-layout";
import { MonacoInit } from "./_components/monaco-init";
import { ToolbarActions } from "./_components/toolbar-actions";

export const metadata: Metadata = {
  title: "Advanced Code Playground | FYGS",
  description:
    "Next-generation code playground with real-time execution and collaboration",
};

export default function PlaygroundPage() {
  // This state would be managed by a more sophisticated state management system in production
  // For now, we'll just simulate it with a static value
  const activeChallengeId = "1"; // Example challenge ID
  return (
    <main className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-background/80 via-background/90 to-background/95">
      {/* Initialize Monaco Editor */}
      <MonacoInit />

      {/* Format Animation - Confetti effect */}
      <FormatAnimation />

      {/* Ambient Background Effect */}
      <div className="absolute inset-0 bg-grid-small-white/[0.2] -z-[1]" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-background/80 -z-[1]" />

      {/* Animated Gradient Orbs - More vibrant and futuristic */}
      <div className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl animate-blob -z-[1]"></div>
      <div className="absolute bottom-20 left-20 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-pink-500/30 to-indigo-500/30 blur-3xl animate-blob animation-delay-2000 -z-[1]"></div>
      <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 blur-3xl animate-blob animation-delay-4000 -z-[1]"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 blur-3xl animate-blob animation-delay-3000 -z-[1]"></div>

      {/* Header Actions - Enhanced with glass effect */}
      <header className="flex-none p-4 border-b border-border/40 bg-background/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20 z-10 glass-panel">
        <ToolbarActions />
      </header>

      {/* Main Editor Area with Modern Layout */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex-1 rounded-lg neon-border full-height-container">
          <Suspense fallback={<EditorLoading />}>
            <ModernEditorLayout />
          </Suspense>
        </div>
      </div>

      {/* Enhanced AI Assistant */}
      <EnhancedAIAssistantWrapper challengeId={activeChallengeId} />
    </main>
  );
}
