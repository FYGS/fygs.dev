import type { Metadata } from "next";
import { TestingGuide } from "./_components/testing-guide";

export const metadata: Metadata = {
  title: "Testing Frontend | Tech-Mastry",
  description: "Tests unitaires, d'intégration et E2E pour applications React : Vitest, Testing Library, Playwright.",
};

export default function TestingPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
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
    </main>
  );
}
