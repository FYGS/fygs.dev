import { TestingGuide } from "./_components/testing-guide";
import { topicMetadata } from "@/app/[locale]/(main)/tech-mastry/_catalog/metadata";

export const metadata = topicMetadata("/tech-mastry/frontend/testing");

export default function TestingPage() {
  return (
    <div className="container py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-500/20 mb-2">
          <span className="text-3xl">🧪</span>
        </div>
        <h1 className="text-4xl font-bold">Testing Frontend</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stratégies de test pour applications React : unitaires avec Vitest,
          composants avec Testing Library, E2E avec Playwright.
        </p>
      </div>
      <TestingGuide />
    </div>
  );
}
